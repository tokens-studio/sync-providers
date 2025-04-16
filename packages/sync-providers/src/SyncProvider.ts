import { GitHubStorage } from './GitHubStorage.js';

export enum StorageProviderType {
	LOCAL = 'local',
	JSONBIN = 'jsonbin',
	GITHUB = 'github',
	GITLAB = 'gitlab',
	SUPERNOVA = 'supernova',
	ADO = 'ado',
	URL = 'url',
	BITBUCKET = 'bitbucket',
	TOKENS_STUDIO = 'tokensstudio',
}

export interface StorageInterface {
	canWrite(): Promise<boolean>;
	writeChangeset(params: {
		files: Record<string, string>;
		commitMessage: string;
		branch: string;
	}): Promise<boolean>;
	fetchBranches(): Promise<string[]>;
	createBranch(branch: string, source?: string): Promise<boolean>;
	read(): Promise<{ path: string; name: string; data: unknown }[]>;
}

export class SyncProvider {
	public storage: StorageInterface;

	constructor(
		public provider: StorageProviderType,
		public secret: string,
		public owner: string,
		public repository: string,
		public branch: string,
		public path: string,
		public baseUrl?: string,
	) {
		this.storage = this.createStorage();
	}

	private createStorage(): StorageInterface {
		switch (this.provider) {
			case StorageProviderType.GITHUB:
				return new GitHubStorage(
					this.secret,
					this.owner,
					this.repository,
					this.branch,
					this.path,
					this.baseUrl,
				);
			// Add cases for other providers here
			default:
				throw new Error(`Unsupported provider: ${this.provider}`);
		}
	}

	public canWrite = () => this.storage.canWrite();
	public push = (
		files: Record<string, string>,
		commitMessage: string,
		branch: string,
	) => this.storage.writeChangeset({ files, commitMessage, branch });
	public fetchBranches = () => this.storage.fetchBranches();
	public createBranch = (branch: string, source?: string) =>
		this.storage.createBranch(branch, source);
	public pull = () => this.storage.read();
}
