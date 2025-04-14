import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { Octokit } from '@octokit/rest';
import { GitHubStorage } from './GitHubStorage.js';
import { commitMultipleFiles } from './utils/commitMultipleFiles.js';
import {
	createMockOctokit,
	resetMocks,
	setupCommonMocks,
} from './GitHubStorage.mocks.js';

vi.mock('@octokit/rest');
vi.mock('./utils/commitMultipleFiles.js');

beforeEach(() => {
	resetMocks();
	setupCommonMocks({});
});

afterEach(() => {
	resetMocks();
});

test('GitHubStorage.canWrite returns true if user has write permissions', async () => {
	setupCommonMocks({
		currentUser: 'testuser',
		collaboratorPermission: 'write',
	});

	const storage = new GitHubStorage(
		'secret',
		'owner',
		'repo',
		'main',
		'src/tokens',
	);

	const canWrite = await storage.canWrite();
	expect(canWrite).toBe(true);
});

test('GitHubStorage.createBranch creates a new branch', async () => {
	createMockOctokit({
		git: {
			getRef: vi
				.fn()
				.mockResolvedValue({ data: { object: { sha: '123456' } } }),
			createRef: vi
				.fn()
				.mockResolvedValue({ data: { ref: 'refs/heads/new-branch' } }),
		},
	});

	const storage = new GitHubStorage(
		'secret',
		'owner',
		'repo',
		'main',
		'src/tokens',
	);

	const branchCreated = await storage.createBranch('new-branch');
	expect(branchCreated).toBe(true);
});

test("GitHubStorage.writeChangeset creates a new branch when it doesn't exist", async () => {
	const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});
	commitMultipleFiles.mockReturnValue(mockCreateOrUpdateFiles);

	createMockOctokit({
		repos: {
			listBranches: vi.fn().mockResolvedValue([{ name: 'main' }]),
		},
		rest: {
			repos: {
				createOrUpdateFiles: mockCreateOrUpdateFiles,
				getContent: vi.fn().mockResolvedValue({}),
			},
		},
		paginate: vi.fn().mockResolvedValue([]),
	});

	const storage = new GitHubStorage(
		'secret',
		'owner',
		'repo',
		'main',
		'src/tokens',
	);

	const changeset = {
		files: { 'test.json': 'content' },
		commitMessage: 'Test commit',
		branch: 'new-branch',
	};

	const result = await storage.writeChangeset(changeset);

	expect(result).toBe(true);
	expect(mockCreateOrUpdateFiles).toHaveBeenCalledWith({
		branch: 'new-branch',
		owner: 'owner',
		repo: 'repo',
		createBranch: true,
		changes: [
			{
				message: 'Test commit',
				files: { 'test.json': 'content' },
				ignoreDeletionFailures: true,
			},
		],
	});
});

test('GitHubStorage.writeChangeset calls createOrUpdate with files to delete', async () => {
	const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});
	commitMultipleFiles.mockReturnValue(mockCreateOrUpdateFiles);

	createMockOctokit({
		repos: {
			listBranches: vi.fn().mockResolvedValue([{ name: 'main' }]),
		},
		rest: {
			git: {
				getTree: vi.fn().mockResolvedValue({
					data: {
						tree: [
							{ path: 'tokens/file1.json', sha: 'sha1', type: 'blob' },
							{ path: 'tokens/file2.json', sha: 'sha2', type: 'blob' },
						],
					},
				}),
				createTree: vi.fn().mockResolvedValue({
					data: {
						tree: [
							{ path: 'tokens/file1.json', sha: 'sha1', type: 'blob' },
							{ path: 'tokens/file2.json', sha: 'sha2', type: 'blob' },
						],
					},
				}),
			},
			repos: {
				getContent: vi.fn().mockResolvedValue({
					data: [
						{ path: 'src/tokens/file1.json', sha: 'sha1', type: 'blob' },
						{ path: 'src/tokens/file2.json', sha: 'sha2', type: 'blob' },
					],
				}),
				createOrUpdateFiles: mockCreateOrUpdateFiles,
			},
		},
		paginate: vi.fn().mockResolvedValue([{ name: 'main' }]),
	});

	const storage = new GitHubStorage(
		'secret',
		'owner',
		'repo',
		'main',
		'src/tokens',
	);

	const changeset = {
		files: { 'src/tokens/file1.json': 'content' },
		commitMessage: 'Test commit',
		branch: 'main',
	};

	const result = await storage.writeChangeset(changeset);
	expect(result).toBe(true);
	expect(mockCreateOrUpdateFiles).toHaveBeenCalledWith({
		branch: 'main',
		owner: 'owner',
		repo: 'repo',
		createBranch: false,
		changes: [
			{
				message: 'Test commit',
				files: { 'src/tokens/file1.json': 'content' },
				filesToDelete: ['src/tokens/file2.json'],
				ignoreDeletionFailures: true,
			},
		],
	});
});

test('GitHubStorage.writeChangeset calls createOrUpdate without files to delete', async () => {
	const mockCreateOrUpdateFiles = vi.fn().mockResolvedValue({});
	commitMultipleFiles.mockReturnValue(mockCreateOrUpdateFiles);

	createMockOctokit({
		repos: {
			listBranches: vi.fn().mockResolvedValue([{ name: 'main' }]),
		},
		rest: {
			repos: {
				getContent: vi.fn().mockResolvedValue({ data: [] }),
				createOrUpdateFiles: mockCreateOrUpdateFiles,
			},
		},
		git: {
			getTree: vi.fn().mockResolvedValue({
				data: {
					tree: [],
				},
			}),
		},
		paginate: vi.fn().mockResolvedValue([{ name: 'main' }]),
	});

	const storage = new GitHubStorage(
		'secret',
		'owner',
		'repo',
		'main',
		'src/tokens',
	);

	const changeset = {
		files: { 'test.json': 'content' },
		commitMessage: 'Test commit',
		branch: 'main',
	};

	const result = await storage.writeChangeset(changeset);
	expect(result).toBe(true);
	expect(mockCreateOrUpdateFiles).toHaveBeenCalledWith({
		branch: 'main',
		owner: 'owner',
		repo: 'repo',
		createBranch: false,
		changes: [
			{
				message: 'Test commit',
				files: { 'test.json': 'content' },
				filesToDelete: [],
				ignoreDeletionFailures: true,
			},
		],
	});
});

test('GitHubStorage.read reads file directories', async () => {
	createMockOctokit({
		rest: {
			repos: {
				getContent: vi
					.fn()
					.mockResolvedValueOnce({
						data: [
							{
								path: 'src/tokens/file1.json',
								sha: 'sha(src/tokens/file1.json)',
								type: 'blob',
							},
						],
					})
					.mockResolvedValueOnce({
						data: [
							{
								path: 'src/tokens',
								sha: 'sha(src/tokens/file1.json)',
								type: 'directory',
							},
						],
					})
					.mockResolvedValueOnce({
						data: '{ "foo": "bar" }\n',
					}),
			},
			git: {
				getTree: vi.fn().mockResolvedValue({
					data: {
						tree: [{ path: 'src/tokens/file1.json', type: 'blob' }],
					},
				}),
			},
		},
	});

	const storage = new GitHubStorage(
		'secret',
		'owner',
		'repo',
		'main',
		'src/tokens',
	);

	const result = await storage.read();
	expect(result).toEqual([
		{
			path: 'src/tokens/file1.json',
			name: 'file1',
			data: '{ "foo": "bar" }\n',
		},
	]);
});
