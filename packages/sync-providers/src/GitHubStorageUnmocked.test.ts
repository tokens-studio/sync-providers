import { describe, expect, test } from 'vitest';
import { GitHubStorage } from './GitHubStorage.js';
import dotenv from 'dotenv';

dotenv.config();

describe.skip('without mocks', () => {
	test('GitHubStorage.canWrite returns true if user has write permissions without mocks', async () => {
		const storage = new GitHubStorage(
			process.env.GITHUB_TEST_TOKEN || '',
			process.env.GITHUB_TEST_OWNER || '',
			process.env.GITHUB_TEST_REPO || '',
			'main',
			'src/tokens',
		);

		const canWrite = await storage.canWrite();
		expect(canWrite).toBe(true);
		const changeset = {
			files: {
				'src/tokens/foo/bar/tokens.json': JSON.stringify({ test: 'test3' }),
			},
			commitMessage: 'Test commit',
			branch: 'new-branch-2',
		};

		const result = await storage.writeChangeset(changeset);

		expect(result).toBe(true);
	});

	test('GitHubStorage.createBranch creates a new branch', async () => {
		const storage = new GitHubStorage(
			process.env.GITHUB_TEST_TOKEN || '',
			process.env.GITHUB_TEST_OWNER || '',
			process.env.GITHUB_TEST_REPO || '',
			'main',
			'src/tokens',
		);

		const branchName = `new-branch-${Date.now()}`;
		const branchCreated = await storage.createBranch(branchName);
		expect(branchCreated).toBe(true);
	});

	test('GitHubStorage.read reads file directories', async () => {
		const storage = new GitHubStorage(
			process.env.GITHUB_TEST_TOKEN || '',
			process.env.GITHUB_TEST_OWNER || '',
			process.env.GITHUB_TEST_REPO || '',
			'main',
			'src/tokens',
		);

		const result = await storage.read();
		expect(result).toEqual([
			{
				path: 'src/tokens/file1.json',
				name: 'file1',
				data: { foo: 'bar' },
			},
		]);
	});

	test('GitHubStorage.read reads a single file', async () => {
		const storage = new GitHubStorage(
			process.env.GITHUB_TEST_TOKEN || '',
			process.env.GITHUB_TEST_OWNER || '',
			process.env.GITHUB_TEST_REPO || '',
			'main',
			'src/combined.json',
		);

		const result = await storage.read();
		expect(result).toEqual([
			{
				path: 'src/combined/foo.json',
				name: 'foo',
				data: { background: '#ff0000' },
			},
			{
				path: 'src/combined/bar.json',
				name: 'bar',
				data: { background: '#000000' },
			},
		]);
	});
});
