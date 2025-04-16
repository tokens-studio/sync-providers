import type { Octokit } from '@octokit/rest';

export type ExtendedOctokitClient = Omit<Octokit, 'repos'> & {
	repos: Octokit['repos'] & {
		createOrUpdateFiles: (params: {
			owner: string;
			repo: string;
			branch: string;
			createBranch?: boolean;
			changes: {
				message: string;
				files: Record<string, string>;
				filesToDelete?: string[];
				ignoreDeletionFailures?: boolean;
			}[];
		}) => ReturnType<Octokit['repos']['createOrUpdateFileContents']>;
	};
};
