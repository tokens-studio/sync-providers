import compact from 'just-compact';

// Removes falsy values from path
export const normalizePath = (path: string) =>
	compact(path.split('/')).join('/');
