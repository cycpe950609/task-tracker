/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const path = require('path')
// const __dirname = path.dirname(__filename);
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    entry: {
        index: "./index.ts"
    },
    output: {
        filename: "[name].js",
        publicPath: "/dist/",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        // new NodePolyfillPlugin()
    ],
    target : "node",
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: [
                    {
                        loader: "babel-loader",
                        options: { presets: ["@babel/preset-env"] }
                    },
                    { loader: "ts-loader" }
                ]
            }
        ]
    },
    resolve: { 
        extensions: [".ts", ".js"],
        fallback: { 
            "fs": false,
        //     "buffer": false,
        //     "tls": false,
        //     "net": false,
        //     "zlib": false,
        //     "http": false,
        //     "https": false,
        //     "crypto": false,
        //     "url": false,
        //     "path": false,
        //     "util": false,
        //     "stream": false,
        //     "async_hooks": false,
        }
    }
}
