import { describe, expect, test, vi, afterEach } from "vitest";
import { Octokit } from "@octokit/rest";
import { GitHubStorage } from "./GitHubStorage.js";
import { commitMultipleFiles } from "./utils/commitMultipleFiles.js";

vi.mock("@octokit/rest");
vi.mock("./utils/commitMultipleFiles.js");

afterEach(() => {
  vi.resetAllMocks();
});
test("GitHubStorage.canWrite returns true if user has write permissions", async () => {
  const mockGetAuthenticated = vi.fn().mockResolvedValue({
    data: { login: "testuser" },
  });

  const mockGetCollaboratorPermissionLevel = vi.fn().mockResolvedValue({
    data: { permission: "write" },
  });

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    rest: {
      users: { getAuthenticated: mockGetAuthenticated },
      repos: {
        getCollaboratorPermissionLevel: mockGetCollaboratorPermissionLevel,
      },
    },
    paginate: vi.fn().mockResolvedValue([]), // Mock paginate method
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storage = new GitHubStorage(
    "secret",
    "owner",
    "repo",
    "main",
    "src/tokens",
  );

  const canWrite = await storage.canWrite();
  expect(canWrite).toBe(true);
});

test("GitHubStorage.createBranch creates a new branch", async () => {
  const mockGetRef = vi.fn().mockResolvedValue({
    data: { object: { sha: "123456" } },
  });

  const mockCreateRef = vi.fn().mockResolvedValue({
    data: { ref: "refs/heads/new-branch" },
  });

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    git: { getRef: mockGetRef, createRef: mockCreateRef },
    paginate: vi.fn().mockResolvedValue([]), // Mock paginate method
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storage = new GitHubStorage(
    "secret",
    "owner",
    "repo",
    "main",
    "src/tokens",
  );

  const branchCreated = await storage.createBranch("new-branch");
  expect(branchCreated).toBe(true);
});

test("GitHubStorage.writeChangeset creates a new branch when it doesn't exist", async () => {
  const mockListBranches = vi.fn().mockResolvedValue([{ name: "main" }]);
  const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});
  const mockGetContent = vi.fn().mockResolvedValue({});
  commitMultipleFiles.mockReturnValue(mockCreateOrUpdateFiles);

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    repos: {
      listBranches: mockListBranches,
    },
    rest: {
      repos: {
        createOrUpdateFiles: mockCreateOrUpdateFiles,
        getContent: mockGetContent,
      },
    },
    paginate: vi.fn().mockResolvedValue([]),
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storage = new GitHubStorage(
    "secret",
    "owner",
    "repo",
    "main",
    "src/tokens",
  );

  const changeset = {
    files: { "test.json": "content" },
    commitMessage: "Test commit",
    branch: "new-branch",
  };

  const result = await storage.writeChangeset(changeset);

  expect(result).toBe(true);
  expect(mockCreateOrUpdateFiles).toHaveBeenCalledWith({
    branch: "new-branch",
    owner: "owner",
    repo: "repo",
    createBranch: true,
    changes: [
      {
        message: "Test commit",
        files: { "test.json": "content" },
        ignoreDeletionFailures: true,
      },
    ],
  });
});

test("GitHubStorage.writeChangeset calls createOrUpdate with files to delete", async () => {
  const mockGetFilesToDelete = vi
    .spyOn(GitHubStorage.prototype, "getFilesToDelete")
    .mockResolvedValue(["src/tokens/file1.json", "src/tokens/file2.json"]);

  const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});
  commitMultipleFiles.mockReturnValue(mockCreateOrUpdateFiles);

  const mockListBranches = vi.fn().mockResolvedValue([{ name: "main" }]);

  const mockGetContent = vi.fn().mockResolvedValue({
    data: [
      { path: "file1.json", sha: "sha1", type: "blob" },
      { path: "file2.json", sha: "sha2", type: "blob" },
    ],
  });

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    repos: {
      listBranches: mockListBranches,
    },
    rest: {
      repos: {
        getContent: mockGetContent,
        createOrUpdateFiles: mockCreateOrUpdateFiles,
      },
    },
    paginate: vi.fn().mockResolvedValue([{ name: "main" }]), // Mock paginate method
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storage = new GitHubStorage(
    "secret",
    "owner",
    "repo",
    "main",
    "src/tokens",
  );

  const changeset = {
    files: { "test.json": "content" },
    commitMessage: "Test commit",
    branch: "main",
  };

  const result = await storage.writeChangeset(changeset);
  expect(result).toBe(true);
  expect(mockGetFilesToDelete).toHaveBeenCalled();
  expect(mockCreateOrUpdateFiles).toHaveBeenCalledWith({
    branch: "main",
    owner: "owner",
    repo: "repo",
    createBranch: false,
    changes: [
      {
        message: "Test commit",
        files: { "test.json": "content" },
        filesToDelete: ["src/tokens/file1.json", "src/tokens/file2.json"],
        ignoreDeletionFailures: true,
      },
    ],
  });
});

test("GitHubStorage.writeChangeset calls createOrUpdate without files to delete", async () => {
  const mockGetFilesToDelete = vi
    .spyOn(GitHubStorage.prototype, "getFilesToDelete")
    .mockResolvedValue([]);

  const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});
  commitMultipleFiles.mockReturnValue(mockCreateOrUpdateFiles);

  const mockListBranches = vi.fn().mockResolvedValue([{ name: "main" }]);

  const mockGetContent = vi.fn().mockResolvedValue({
    data: [],
  });

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    repos: {
      listBranches: mockListBranches,
    },
    rest: {
      repos: {
        getContent: mockGetContent,
        createOrUpdateFiles: mockCreateOrUpdateFiles,
      },
    },
    paginate: vi.fn().mockResolvedValue([{ name: "main" }]), // Mock paginate method
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storage = new GitHubStorage(
    "secret",
    "owner",
    "repo",
    "main",
    "src/tokens",
  );

  const changeset = {
    files: { "test.json": "content" },
    commitMessage: "Test commit",
    branch: "main",
  };

  const result = await storage.writeChangeset(changeset);
  expect(result).toBe(true);
  expect(mockGetFilesToDelete).toHaveBeenCalled();
  expect(mockCreateOrUpdateFiles).toHaveBeenCalledWith({
    branch: "main",
    owner: "owner",
    repo: "repo",
    createBranch: false,
    changes: [
      {
        message: "Test commit",
        files: { "test.json": "content" },
        filesToDelete: [],
        ignoreDeletionFailures: true,
      },
    ],
  });
});

test("GitHubStorage.read reads file directories", async () => {
  const mockListBranches = vi.fn().mockResolvedValue([{ name: "main" }]);

  const mockGetContent = vi
    .fn()
    .mockResolvedValueOnce({
      data: [
        {
          path: "src/tokens/file1.json",
          sha: "sha(src/tokens/file1.json)",
          type: "blob",
        },
      ],
    })
    .mockResolvedValueOnce({
      data: [
        {
          path: "src/tokens",
          sha: "sha(src/tokens/file1.json)",
          type: "directory",
        },
      ],
    })
    .mockResolvedValueOnce({
      data: '{ "foo": "bar" }\n',
    });

  const mockGetTree = vi.fn().mockResolvedValue({
    data: {
      tree: [
        {
          path: "src/tokens/file1.json",
          type: "blob",
        },
      ],
    },
  });

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    repos: {
      listBranches: mockListBranches,
    },
    rest: {
      repos: {
        getContent: mockGetContent,
      },
      git: {
        getTree: mockGetTree,
      },
    },
    paginate: vi.fn().mockResolvedValue([]),
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);
  const storage = new GitHubStorage(
    "secret",
    "owner",
    "repo",
    "main",
    "src/tokens",
  );

  const result = await storage.read();
  expect(result).toStrictEqual([
    {
      path: "src/tokens/file1.json",
      name: "file1",
      data: { foo: "bar" },
    },
  ]);
});
