module.exports = {
	'parser': '@typescript-eslint/parser',
	'plugins': ['@typescript-eslint'],
	'root': true,
	'env': {
		'es6': true,
		'node': true,
		'mocha': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking'
	],
	'parserOptions': {
		'ecmaVersion': 2020,
		'project': './tsconfig.json'
	},
	'rules': {
		// Custom rules:
		'no-console': 'off', // Too annoying when adding log messages during debugging.
		'no-debugger': 'off', // Too annoying when adding log messages during debugging.

		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': false }],
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'curly': ['error', 'all'],
		'no-alert': 'error',
		'no-caller': 'error',
		'no-implied-eval': 'error',
		'no-with': 'error',
		'no-catch-shadow': 'error',
		'no-extend-native': 'error',
		'new-parens': 'error',
		'array-callback-return': 'error',
		'no-eval': 'error',
		'no-use-before-define': ['error', 'nofunc'],
		'eqeqeq': 'error',
		'new-cap': ['error', {'newIsCap': true, 'properties': false, 'capIsNewExceptions': ['Column', 'Table', 'BelongsToMany', 'ForeignKey']}],
		'brace-style': ['error', '1tbs', {'allowSingleLine': true}],
		'no-trailing-spaces': 'error',
		'no-multi-str': 'error',
		'space-unary-ops': ['error', {'words': false, 'nonwords': false}],
		'semi-spacing': ['error', {'before': false, 'after': true}],
		'no-spaced-func': 'error',
		'comma-dangle': ['error', 'only-multiline'],
		'comma-style': ['error', 'last'],
		'eol-last': 'error',
		'semi': ['error', 'always'],
		'keyword-spacing': ['error', {'overrides': {'else': {'before': true}, 'while': {'before': true}, 'catch': {'before': true}}}],
		'space-before-blocks': ['error', 'always'],
		'space-infix-ops': 'error',
		'key-spacing': ['error', {'beforeColon': false, 'afterColon': true, 'mode': 'minimum'}],
		'padded-blocks': ['error', 'never'],
		'comma-spacing': 'error',
		'operator-linebreak': ['error', 'after'],
		'camelcase': ['error', {'properties': 'always'}],
		'space-before-function-paren': ['error', 'never']
	}
};
