import { GitHubStorage } from "./GitHubStorage.js";

export enum StorageProviderType {
  LOCAL = "local",
  JSONBIN = "jsonbin",
  GITHUB = "github",
  GITLAB = "gitlab",
  SUPERNOVA = "supernova",
  ADO = "ado",
  URL = "url",
  BITBUCKET = "bitbucket",
  TOKENS_STUDIO = "tokensstudio",
}

export class SyncProvider {
  provider: StorageProviderType;
  secret: string;
  owner: string;
  repository: string;
  branch: string;
  path: string;
  baseUrl?: string;
  storage: GitHubStorage;

  constructor(
    provider: StorageProviderType,
    secret: string,
    owner: string,
    repository: string,
    branch: string,
    path: string,
    baseUrl?: string,
  ) {
    this.secret = secret;
    this.provider = provider;
    this.owner = owner;
    this.repository = repository;
    this.branch = branch;
    this.path = path;
    this.baseUrl = baseUrl;

    switch (provider) {
      case StorageProviderType.GITHUB:
        this.storage = new GitHubStorage(
          this.secret,
          this.owner,
          this.repository,
          this.branch,
          this.path,
          this.baseUrl,
        );
        break;
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  public async canWrite() {
    const { provider } = this;
    switch (provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GitHubStorage;
        return storage.canWrite();
      }
      default: {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    }
  }

  public async push(
    files: Record<string, string>,
    commitMessage: string,
    branch: string,
  ) {
    const { provider } = this;
    switch (provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GitHubStorage;
        storage.writeChangeset({
          files,
          commitMessage,
          branch,
        });
        break;
      }
      default: {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    }
  }

  public async createBranch(branch: string) {
    const { provider } = this;
    switch (provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GitHubStorage;
        return storage.createBranch(branch);
      }
      default: {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    }
  }

  public async pull() {
    const { provider } = this;
    switch (provider) {
      case StorageProviderType.GITHUB: {
        const storage = this.storage as GitHubStorage;
        return storage.read();
      }
      default: {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }
    }
  }
}
