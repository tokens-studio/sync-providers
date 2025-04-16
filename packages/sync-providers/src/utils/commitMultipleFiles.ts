import type { Octokit } from '@octokit/rest';
import octokitCommitMultipleFilesFallback from 'octokit-commit-multiple-files/create-or-update-files';

export const commitMultipleFiles =
	(octokitClient: Octokit) => async (params: any) =>
		octokitCommitMultipleFilesFallback(octokitClient, params);
