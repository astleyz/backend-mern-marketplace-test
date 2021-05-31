import path from 'path';
import excludeNodeModules from 'webpack-node-externals';
import merge from 'webpack-merge';
import { createBundledAnalyzer, createEnvVariables } from './plugins';

export default merge(
  {
    mode: 'production',
    entry: path.resolve(__dirname, '../src/index.ts'),
    resolve: {
      extensions: ['.ts'],
    },
    target: 'node',
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'index.js',
    },
    externals: [excludeNodeModules()],
    module: {
      rules: [
        {
          test: /\.(ts)$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
      ],
    },
  },
  createBundledAnalyzer(),
  process.env.NODE_ENV === 'production' && createEnvVariables()
);
