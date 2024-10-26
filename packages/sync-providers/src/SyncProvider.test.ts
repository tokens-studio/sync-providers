import { afterEach, expect, test, vi } from "vitest";
import { StorageProviderType, SyncProvider } from "./SyncProvider.js";
import { Octokit } from "@octokit/rest";

vi.mock("@octokit/rest");
vi.mock("./utils/commitMultipleFiles.js");

afterEach(() => {
  vi.resetAllMocks();
});

test("SyncProvider.push calls storage.writeChangeset", async () => {
  const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});

  const mockOctokitPlugin = vi.fn().mockReturnValue({
    repos: {
      createOrUpdateFiles: mockCreateOrUpdateFiles,
    },
    paginate: vi.fn().mockImplementation(async (method, params) => {
      return method(params);
    }),
  });

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storageProvider = new SyncProvider(
    StorageProviderType.GITHUB,
    "ghp_Os20DFno0LrMV3bAT72tJn4pL7ddMw2lLxxx",
    "six7",
    "localtestrepo",
    "main",
    "tokens",
  );

  const mockWriteChangeset = vi.fn().mockResolvedValue(true);
  storageProvider.storage.writeChangeset = mockWriteChangeset;

  const files = { "test.json": "content" };
  const commitMessage = "Test commit";
  const branch = "main";

  await storageProvider.push(files, commitMessage, branch);

  expect(mockWriteChangeset).toHaveBeenCalledWith({
    files,
    commitMessage,
    branch,
  });
});

test("SyncProvider.pull calls storage.read", async () => {
  const mockOctokitPlugin = vi.fn().mockReturnValue({});

  vi.spyOn(Octokit, "plugin").mockReturnValue(mockOctokitPlugin);

  const storageProvider = new SyncProvider(
    StorageProviderType.GITHUB,
    "secret",
    "six7",
    "localtestrepo",
    "main",
    "tokens",
  );

  const mockRead = vi.fn().mockResolvedValue([]);
  storageProvider.storage.read = mockRead;

  await storageProvider.pull();

  expect(mockRead).toBeCalled();
});
