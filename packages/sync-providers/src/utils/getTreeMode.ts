export function getTreeMode(type: 'dir' | 'file' | string) {
	switch (type) {
		case 'dir':
			return '040000';
		default:
			return '100644';
	}
}
