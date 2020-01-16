import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import serve from 'rollup-plugin-serve';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/main.js',
		output: {
			name: 'makeChart',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs(), // so Rollup can convert `ms` to an ES module
			buble({  // transpile ES2015+ to ES5
				exclude: ['node_modules/**']
			}),
			serve({host: '0.0.0.0', port: 3000, contentBase: ''}),
			terser()
		]
	}
];
