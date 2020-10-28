const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const LAMBDA_DIRECTORY = 'src/lambda';

const getLambdaConfiguration = lambdaFolder => lambdaFile => {
    console.log(`Packing ${lambdaFolder}/${lambdaFile}`);
    const lambdaName = path.basename(lambdaFile, '.js');
    console.log(`Packing ${lambdaName}`);
    return {
        entry: [lambdaFile],
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'dist', lambdaFolder, lambdaName),
            filename: `${lambdaName}.js`,
            libraryTarget: 'umd'
        },
        resolve: {
            // forces the.js file to be required instead of .mjs
            alias: {
                'node-fetch': 'node-fetch/lib/index.js'
            }
        },
        optimization: {
            minimize: false,
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {}
                })
            ]
        }
    };
};

const getLambdaFiles = lambdaFolder => {
    const lambdasFolder = path.resolve(__dirname, lambdaFolder);
    console.log(`Lambda folder: ${lambdasFolder}`);
    return fs
        .readdirSync(lambdasFolder)
        .map(file => { 
            const fullpath = path.resolve(lambdasFolder, file);
            console.log(`File: ${fullpath}`);
            return fullpath});
};

const files = getLambdaFiles(LAMBDA_DIRECTORY);
console.log(`Files: ${JSON.stringify(files)}`);
webpack(files.map(getLambdaConfiguration(LAMBDA_DIRECTORY)), (err, stats) => {
    // Stats Object
    if (err || stats.hasErrors()) {
        console.error('Webpack: something went wrong:', err, stats.toJson());
        process.exit(1);
        return;
    }
    console.log(`Webpack: Build success on folder ${LAMBDA_DIRECTORY}`);
});
