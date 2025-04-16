import { vi } from 'vitest';
import { Octokit } from '@octokit/rest';
import deepmerge from 'deepmerge';

// Mock Octokit plugin
export const mockOctokitPlugin = vi.fn();
vi.spyOn(Octokit, 'plugin').mockReturnValue(mockOctokitPlugin);

// Mock for commitMultipleFiles
export const mockCommitMultipleFiles = vi.fn();
vi.mock('./utils/commitMultipleFiles.js', () => ({
	commitMultipleFiles: mockCommitMultipleFiles,
}));

// Default mock implementation
const defaultMockImplementation = {
	rest: {
		repos: {
			listBranches: vi.fn(),
			getContent: vi.fn(),
			createOrUpdateFiles: vi.fn(),
			getCollaboratorPermissionLevel: vi.fn(),
		},
		users: {
			getAuthenticated: vi.fn(),
		},
		git: {
			getTree: vi.fn(),
			createTree: vi.fn(),
		},
	},
	git: {
		getRef: vi.fn(),
		createRef: vi.fn(),
	},
	paginate: vi.fn().mockResolvedValue([]),
};

// Helper function to create mock Octokit instance
export function createMockOctokit(mockImplementation: any = {}) {
	return mockOctokitPlugin.mockReturnValue(
		deepmerge(defaultMockImplementation, mockImplementation),
	);
}

// Reset all mocks
export function resetMocks() {
	mockOctokitPlugin.mockReset();
	mockCommitMultipleFiles.mockReset();

	// Reset all default mock implementations
	Object.values(defaultMockImplementation.rest).forEach((category) => {
		Object.values(category).forEach((method) => method.mockReset());
	});
	Object.values(defaultMockImplementation.git).forEach((method) =>
		method.mockReset(),
	);
	defaultMockImplementation.paginate.mockReset();
}

// Helper function to set up common mock responses
export function setupCommonMocks(options: {
	branches?: string[];
	currentUser?: string;
	collaboratorPermission?: string;
	fileContents?: Record<string, any>;
}) {
	const {
		branches = ['main'],
		currentUser = 'testuser',
		collaboratorPermission = 'write',
		fileContents = {},
	} = options;

	createMockOctokit({
		rest: {
			repos: {
				listBranches: vi
					.fn()
					.mockResolvedValue(branches.map((name) => ({ name }))),
				getContent: vi.fn().mockImplementation((params) => {
					const content = fileContents[params.path];
					if (content) {
						return Promise.resolve({ data: content });
					}
					return Promise.reject(new Error('File not found'));
				}),
				getCollaboratorPermissionLevel: vi.fn().mockResolvedValue({
					data: { permission: collaboratorPermission },
				}),
			},
			users: {
				getAuthenticated: vi.fn().mockResolvedValue({
					data: { login: currentUser },
				}),
			},
		},
	});
}
