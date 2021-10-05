import {babel} from '@rollup/plugin-babel';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import postcssUrl from './scripts/plugins/postcssUrl';

const env = process.env.NODE_ENV;
const pkg = require('./package.json');

const CWD = process.cwd();
const Paths = {
	SRC: `${CWD}/src`,
	DIST: `${CWD}/dist`,
	NODE_MODULES: `${CWD}/node_modules`,
};
Object.assign(Paths, {
	INPUT: Paths.SRC + '/index.js',
	OUTPUT: Paths.DIST + '/index.js',
});

const lodashExternal = ['lodash/map', 'lodash/isEmpty'];

const onwarn = warning => {
	// throw on others
	if (warning.code === 'CIRCULAR_DEPENDENCY') {
		throw new Error(warning.message);
	}
};

export default {
	input: 'src/index.js',
	onwarn,
	external: [
		'react-resize-detector',
		'react',
		'classnames',
		'prop-types',
		'moment',
		...lodashExternal,
	],
	output: {
		file: {
			es: pkg.module,
			cjs: pkg.main,
		}[env],
		format: env,
		globals: {
			// 'lodash/random': '_.random'
		},
		exports: 'named' /** Disable warning for default imports */,
		sourcemap: true,
	},
	plugins: [
		babel({
			plugins: ['lodash'],
		}),
		commonjs({
			include: 'node_modules/**',
		}),
		postcss({
			extract: path.resolve(Paths.DIST + '/style.css'),
			plugins: [
				...postcssUrl({
					basePath: [Paths.SRC, Paths.NODE_MODULES],
					assetsPath: Paths.DIST + '/assets',
					dest: Paths.DIST,
				}),
			],
		}),
		filesize(),
	],
};
