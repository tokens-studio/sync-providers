import { beforeEach, expect, test, vi } from 'vitest';
import { StorageProviderType, SyncProvider } from './SyncProvider.js';

const mockRead = vi.fn().mockResolvedValue([]);
const mockWriteChangeset = vi.fn().mockResolvedValue(true);

vi.mock('./GitHubStorage.js', () => ({
	GitHubStorage: vi.fn().mockImplementation(() => ({
		writeChangeset: mockWriteChangeset,
		read: mockRead,
	})),
}));

beforeEach(() => {
	mockWriteChangeset.mockClear();
	mockRead.mockClear();
});

test('SyncProvider.push calls storage.writeChangeset of github storage', async () => {
	const storageProvider = new SyncProvider(
		StorageProviderType.GITHUB,
		'secret',
		'six7',
		'localtestrepo',
		'main',
		'tokens',
	);

	const files = { 'test.json': 'content' };
	const commitMessage = 'Test commit';
	const branch = 'main';

	await storageProvider.push(files, commitMessage, branch);

	expect(mockWriteChangeset).toHaveBeenCalledWith({
		files,
		commitMessage,
		branch,
	});
});

test('SyncProvider.pull calls storage.read', async () => {
	const storageProvider = new SyncProvider(
		StorageProviderType.GITHUB,
		'secret',
		'six7',
		'localtestrepo',
		'main',
		'tokens',
	);

	await storageProvider.pull();

	expect(mockRead).toHaveBeenCalled();
});
