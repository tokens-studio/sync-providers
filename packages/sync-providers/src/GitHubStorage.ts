import { Octokit } from "@octokit/rest";
import OctokitCommitMultipleFiles from "octokit-commit-multiple-files";
import { GitStorage } from "./GitStorage.js";
import { getTreeMode } from "./utils/getTreeMode.js";
import { commitMultipleFiles } from "./utils/commitMultipleFiles.js";
import type { ExtendedOctokitClient } from "./types/ExtendedOctokitClient.js";
import { octokitClientDefaultHeaders } from "./constants/octokitClientDefaultHeaders.js";
import compact from "just-compact";
import { normalizePath } from "./utils/normalizePath.js";
import { convertSingleFileToMultiFile } from "./utils/convertSingleFileToMultiFile.js";

export class GitHubStorage extends GitStorage {
  private octokitClient: ExtendedOctokitClient;

  constructor(
    secret: string,
    owner: string,
    repository: string,
    branch: string,
    path: string,
    baseUrl?: string,
  ) {
    super(secret, owner, repository, branch, path, baseUrl);
    const ExtendedOctokitConstructor = Octokit.plugin(
      OctokitCommitMultipleFiles,
    );
    this.octokitClient = new ExtendedOctokitConstructor({
      auth: this.secret,
      baseUrl: this.baseUrl || undefined,
    });
  }

  // TODO: We can combine listBranches and fetchBranches
  public async listBranches() {
    return this.octokitClient.paginate(this.octokitClient.repos.listBranches, {
      owner: this.owner,
      repo: this.repository,
      headers: octokitClientDefaultHeaders,
      per_page: 30, // Set to desired page size (max 100)
    });
  }

  public async fetchBranches() {
    const branches = await this.listBranches();
    return branches?.map((branch) => branch.name);
  }

  public async createBranch(branch: string, source?: string) {
    try {
      const originRef = `heads/${source || this.branch}`;
      const newRef = `refs/heads/${branch}`;
      const originBranch = await this.octokitClient.git.getRef({
        owner: this.owner,
        repo: this.repository,
        ref: originRef,
        headers: octokitClientDefaultHeaders,
      });
      const newBranch = await this.octokitClient.git.createRef({
        owner: this.owner,
        repo: this.repository,
        ref: newRef,
        sha: originBranch.data.object.sha,
      });
      return !!newBranch.data.ref;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  public async canWrite(): Promise<boolean> {
    const currentUser = await this.octokitClient.rest.users.getAuthenticated();
    if (!currentUser.data.login) return false;
    try {
      const canWrite =
        await this.octokitClient.rest.repos.getCollaboratorPermissionLevel({
          owner: this.owner,
          repo: this.repository,
          username: currentUser.data.login,
          headers: octokitClientDefaultHeaders,
        });
      return !!canWrite;
    } catch (_) {
      return false;
    }
  }

  private async checkIfBranchExists(givenBranch: string) {
    const branches = await this.listBranches();
    return branches?.some((branch) => branch.name === givenBranch);
  }

  private async getFilesToDelete(
    contentsOfDirectory: { path: string; sha: string; type: string }[],
    changeset: Record<string, string>,
  ): Promise<string[]> {
    if (Array.isArray(contentsOfDirectory)) {
      const directoryTreeResponse =
        await this.octokitClient.rest.git.createTree({
          owner: this.owner,
          repo: this.repository,
          tree: contentsOfDirectory.map((item) => ({
            path: item.path,
            sha: item.sha,
            mode: getTreeMode(item.type),
          })),
        });

      if (directoryTreeResponse?.data?.tree[0]?.sha) {
        const treeResponse = await this.octokitClient.rest.git.getTree({
          owner: this.owner,
          repo: this.repository,
          tree_sha: directoryTreeResponse.data.tree[0].sha,
          recursive: "true",
        });

        if (treeResponse.data.tree.length > 0) {
          const jsonFiles = treeResponse.data.tree
            .filter((file) => file.path?.endsWith(".json"))
            .sort((a, b) =>
              a.path && b.path ? a.path.localeCompare(b.path) : 0,
            );

          return jsonFiles.reduce((acc, jsonFile) => {
            // getTree returns the path relative to the root of the tree (as in one level up)
            const fullPath = `${this.path.split("/")[0]}/${jsonFile.path}`;
            if (jsonFile.path && !Object.keys(changeset).includes(fullPath)) {
              acc.push(fullPath);
            }
            return acc;
          }, [] as string[]);
        }
      }
    }
    return [];
  }

  public async writeChangeset(changeset: {
    files: Record<string, string>;
    commitMessage: string;
    branch: string;
  }): Promise<boolean> {
    const createOrUpdateFiles =
      this.octokitClient.repos.createOrUpdateFiles ||
      commitMultipleFiles(this.octokitClient);
    const branchExists = await this.checkIfBranchExists(changeset.branch);
    const shouldCreateBranch = !branchExists;

    let filesToDelete: string[] | undefined = undefined;

    try {
      const existingContentsOfDirectory =
        await this.octokitClient.rest.repos.getContent({
          owner: this.owner,
          repo: this.repository,
          path: this.path,
          ref: changeset.branch,
        });

      // There's some existing files in the branch and this directory
      if (Array.isArray(existingContentsOfDirectory.data)) {
        console.log("existingContentsOfDirectory", existingContentsOfDirectory);
        filesToDelete = await this.getFilesToDelete(
          existingContentsOfDirectory.data,
          changeset.files,
        );
        console.log("filesToDelete", filesToDelete);
      }
    } catch (e) {
      console.error(
        "Error retrieving contents of directory, might be empty",
        e,
      );
    }

    const response = await createOrUpdateFiles({
      branch: changeset.branch,
      owner: this.owner,
      repo: this.repository,
      createBranch: shouldCreateBranch,
      changes: [
        {
          message: changeset.commitMessage,
          files: changeset.files,
          filesToDelete,
          ignoreDeletionFailures: true,
        },
      ],
    });
    return !!response;
  }

  private async getTreeShaForDirectory(path: string) {
    // @README this is necessary because to figure out the tree SHA we need to fetch the parent directory contents
    // however when pulling from the root directory we can  not do this, but we can take the SHA from the branch
    if (path === "") {
      const branches = await this.listBranches();
      const branch = branches?.find((entry) => entry.name === this.branch);
      if (!branch) throw new Error(`Branch not found, ${this.branch}`);
      return branch.commit.sha;
    }

    // get the parent directory content to find out the sha
    const parent = path.includes("/")
      ? path.slice(0, path.lastIndexOf("/"))
      : "";
    const parentDirectoryTreeResponse =
      await this.octokitClient.rest.repos.getContent({
        owner: this.owner,
        repo: this.repository,
        path: parent,
        ref: this.branch,
        headers: octokitClientDefaultHeaders,
      });

    if (Array.isArray(parentDirectoryTreeResponse.data)) {
      const directory = parentDirectoryTreeResponse.data.find(
        (item) => item.path === path,
      );
      if (!directory) throw new Error(`Unable to find directory, ${path}`);
      return directory.sha;
    }

    // @README if the parent directory only contains a single subdirectory
    // it will not return an array with 1 item - but rather it will return the item itself
    if (parentDirectoryTreeResponse.data.path === path) {
      return parentDirectoryTreeResponse.data.sha;
    }

    throw new Error("Could not find directory SHA");
  }

  public async read(): Promise<{ path: string; name: string; data: string }[]> {
    try {
      const normalizedPath = normalizePath(this.path);

      const response = await this.octokitClient.rest.repos.getContent({
        path: normalizedPath,
        owner: this.owner,
        repo: this.repository,
        ref: this.branch,
        headers: {
          ...octokitClientDefaultHeaders,
          // Setting this makes github return the raw file instead of a json object.
          Accept: "application/vnd.github.raw",
        },
      });

      // read entire directory
      if (Array.isArray(response.data)) {
        const directorySha = await this.getTreeShaForDirectory(normalizedPath);
        const treeResponse = await this.octokitClient.rest.git.getTree({
          owner: this.owner,
          repo: this.repository,
          tree_sha: directorySha,
          recursive: "true",
          headers: octokitClientDefaultHeaders,
        });

        if (treeResponse && treeResponse.data.tree.length > 0) {
          const jsonFiles = treeResponse.data.tree
            .filter((file) => file.path?.endsWith(".json"))
            .sort((a, b) =>
              a.path && b.path ? a.path.localeCompare(b.path) : 0,
            );
          const jsonFileContents = await Promise.all(
            jsonFiles.map((treeItem) =>
              treeItem.path
                ? this.octokitClient.rest.repos.getContent({
                    owner: this.owner,
                    repo: this.repository,
                    path: treeItem.path.startsWith(normalizedPath)
                      ? treeItem.path
                      : `${normalizedPath}/${treeItem.path}`,
                    ref: this.branch,
                    headers: {
                      ...octokitClientDefaultHeaders,
                      // Setting this makes github return the raw file instead of a json object.
                      Accept: "application/vnd.github.raw",
                    },
                  })
                : Promise.resolve(null),
            ),
          );

          // Combine file contents with file paths
          return compact(
            jsonFileContents.map<{
              data: string;
              path: string;
              name: string;
            } | null>((fileContent, index) => {
              const { path } = jsonFiles[index];
              if (
                path &&
                fileContent?.data &&
                !Array.isArray(fileContent?.data)
              ) {
                const filePath = path.startsWith(normalizedPath)
                  ? path
                  : `${normalizedPath}/${path}`;
                let name = filePath
                  .substring(this.path.length)
                  .replace(/^\/+/, "");
                name = name.replace(".json", "");

                try {
                  return {
                    path: filePath,
                    name,
                    data: fileContent.data,
                  };
                } catch (e) {
                  throw new Error(`Error parsing JSON for ${filePath}`);
                }
              }
              return null;
            }),
          );
        }
      } else if (response.data) {
        // We're dealing with a single file.
        const data = response.data as unknown as string;
        try {
          const parsed = JSON.parse(data);
          return convertSingleFileToMultiFile(this.path, parsed);
        } catch (e) {
          throw new Error(`Error parsing JSON for ${this.path}, ${e}`);
        }
      }

      return [];
    } catch (e) {
      // Raise error (usually this is an auth error)
      throw new Error(e);
    }
  }
}
