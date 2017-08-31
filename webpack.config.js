
var path =  require('path');

module.exports = {
    entry: './src/app.js',
    output: {
        path:       path.resolve(__dirname, 'docs/'),
        filename:   'js/game-2048.min.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: [/node_modules/, /docs/]
            }
        ]
    }
};
