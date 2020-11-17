const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules'),
        ],
    },
    devtool: 'source-map',
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
        },
    ]},
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.[fullhash].js',
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './index.html' }),
    ],
    performance: { hints: false },
    devServer: {
        publicPath: '/',
        contentBase: './static',
        stats: {
            children: false,
            modules: false,
        },
    },
};
