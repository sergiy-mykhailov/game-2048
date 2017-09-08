
var path =  require('path');

module.exports = {
    entry: './src/app.jsx',
    output: {
        path:       path.resolve(__dirname, 'docs/'),
        filename:   'js/game-2048.min.js'
    },
    devServer: {
        contentBase: './docs'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: [{ loader: 'react-hot-loader'
                },{
                    loader: 'babel-loader',
                    options: {
                        presets: ["react", "es2015", "stage-2"]
                    }
                }],
                exclude: [/node_modules/, /docs/]
            },{
                test: /\.css$/,
                loader: 'style-loader!css-loader',
                exclude: [/docs/]
            },{
                test: /\.less$/,
                loader: "style-loader!css-loader!less-loader",
                exclude: [/node_modules/, /docs/]
            },{
                test: /\.(png|svg|jpg|gif)$/,
                loader: "url-loader?name=img/[name].[ext]"
            },{
                test: /\.json$/,
                loader: "json-loader?name=json/[name].[ext]"
            },{
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            }
        ]
    }
};
