const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = (_, argv) => {
    const isProduction = argv.mode === 'production';
    const plugins = [
        new HtmlWebpackPlugin({ template: './index.html' }),
    ];

    if (isProduction) {
        plugins.push(new CopyPlugin({ patterns: [{ from: 'static', to: '.' }] }));
    }

    return {
        entry: './src/app.ts',
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [
                path.resolve('./src'),
                path.resolve('./node_modules'),
            ],
        },
        devtool: 'eval-source-map',
        module: {
            rules: [{
                test: /\.ts$/,
                include: [path.resolve('./src')],
                use: [{ loader: 'ts-loader' }]
            },
            {
                test: /\.ts$/,
                enforce: 'pre',
                use: [{
                    options: { eslintPath: require.resolve('eslint') },
                    loader: require.resolve('eslint-loader'),
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            }],
        },
        output: {
            path: __dirname + '/dist',
            publicPath: '/',
            filename: 'bundle.[fullhash].js',
        },
        plugins,
        performance: { hints: false },
        infrastructureLogging: {
            level: 'error',
        },
        devServer: {
            hot: true,
            publicPath: '/',
            contentBase: './static',
            stats: {
                children: false,
                modules: false,
            },
        },
    };
};