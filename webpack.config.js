const path = require("path");

const babelConfig = require('./babel.config.json');

module.exports = function (env, argv) {

    const IS_RELEASE = argv.mode == "production";
    const IS_DEBUG = !IS_RELEASE;

    const APP_ROOT = __dirname;
    const DIST_DIR = path.join(APP_ROOT, "dist");
    const BUNDLE_FILENAME = "app.js";

    return {
        mode: IS_RELEASE ? "production" : "development",
        entry: "./index.ts",
        output: {
            path: DIST_DIR,
            filename: BUNDLE_FILENAME,
        },

        resolve: {
            extensions: ['.ts', '.js', '.json']
        },

        module: {
            rules: [
                {
                    test: /\.(js|ts)$/,
                    use: {
                        loader: "babel-loader",
                        options: {...babelConfig},
                    }
                }
            ]
        },

        devtool: IS_DEBUG ? 'eval-source-map' : false,

        plugins: [

        ]
    };
}