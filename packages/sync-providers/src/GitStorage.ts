import { joinPath } from "./utils/joinPath.js";
import type { StorageInterface } from "./SyncProvider.js";

export type GitStorageSaveOptions = {
  commitMessage?: string;
};

export type GitStorageSaveOption = {
  commitMessage: string;
};

export abstract class GitStorage implements StorageInterface {
  protected secret: string;

  protected owner: string;

  protected repository: string;

  protected branch: string = "main";

  protected path: string = "";

  protected baseUrl: string | undefined = undefined;

  protected username: string | undefined = undefined;

  constructor(
    secret: string,
    owner: string,
    repository: string,
    branch: string,
    path: string,
    baseUrl?: string,
    username?: string,
  ) {
    this.secret = secret;
    this.owner = owner;
    this.repository = repository;
    this.branch = branch;
    this.path = path;
    this.baseUrl = baseUrl;
    this.username = username;
  }

  public abstract fetchBranches(): Promise<string[]>;
  public abstract createBranch(
    branch: string,
    source?: string,
  ): Promise<boolean>;
  public abstract canWrite(): Promise<boolean>;
  public abstract writeChangeset(changeset: {
    files: Record<string, string>;
    commitMessage: string;
    branch: string;
    shouldCreateBranch?: boolean;
  }): Promise<boolean>;

  public async write(
    files: Record<string, string>,
    saveOptions: GitStorageSaveOption,
  ): Promise<boolean> {
    // TODO: Should we check if the branch exists? Cant we push to an empty repository?
    const branches = await this.fetchBranches();
    if (!branches.length) return false;

    return this.writeChangeset({
      files,
      commitMessage: saveOptions.commitMessage,
      branch: this.branch,
      shouldCreateBranch: !branches.includes(this.branch),
    });
  }
}
