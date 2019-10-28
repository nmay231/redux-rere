/** @format */

const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts'],
    },
    module: {
        rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
    },
}
