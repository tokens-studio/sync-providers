import { expect, test, vi } from 'vitest';
import { StorageProviderType, SyncProvider } from './SyncProvider.js';
import dotenv from 'dotenv';

dotenv.config();

test.skip('SyncProvider.pull calls storage.read', async () => {
	const storageProvider = new SyncProvider(
		StorageProviderType.GITHUB,
		process.env.GITHUB_TEST_TOKEN || '',
		process.env.GITHUB_TEST_OWNER || '',
		process.env.GITHUB_TEST_REPO || '',
		'main',
		'src/tokens',
	);

	expect(await storageProvider.pull()).toEqual([
		{
			path: 'src/tokens/file1.json',
			name: 'file1',
			data: { foo: 'bar' },
		},
	]);
});
