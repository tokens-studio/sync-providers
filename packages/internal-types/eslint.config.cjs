const studioConfig = require('@tokens-studio/configs/eslint');

module.exports = [
	{
		ignores: [
			'dist/'
		],
	},
	...studioConfig,
];