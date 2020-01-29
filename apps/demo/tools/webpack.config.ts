import path from "path";

//Plugins
import { Builder } from "@reactway/webpack-builder";
import { TypeScriptPlugin } from "@reactway/webpack-builder-plugin-typescript";
import webpackDevServer from "@reactway/webpack-builder-plugin-web-dev";
import { StylesPlugin } from "@reactway/webpack-builder-plugin-styles";
import htmlPlugin from "@reactway/webpack-builder-plugin-html";
import clean from "@reactway/webpack-builder-plugin-clean";
import writeFile from "@reactway/webpack-builder-plugin-write-file";

const fullOutputPath = path.resolve(__dirname, "dist");

let publicPath = process.env.PUBLIC_PATH;

if (publicPath == null) {
    publicPath = "/";
}

const webpackMode = process.env.NODE_ENV === "production" ? "production" : "development";

const configToExport = new Builder(__dirname, {
    entry: "./src/app.tsx",
    mode: webpackMode,
    output: {
        path: fullOutputPath,
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[contenthash].js",
        publicPath: publicPath
    }
})
    .use(TypeScriptPlugin, {
        tsLoaderOptions: {
            projectReferences: true,
            experimentalWatchApi: true
        }
    })
    .use(StylesPlugin)
    .use(webpackDevServer)
    .use(htmlPlugin, {
        inject: false,
        appMountId: "root",
        title: "React Forms Demo",
        template: require("html-webpack-template"),
        baseHref: publicPath,
        favicon: "./src/assets/favicon-128.png",
        meta: [
            {
                charset: "UTF-8"
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1.0"
            }
        ]
    })
    .use(writeFile)
    .use(clean)
    .update(config => {
        if (config.resolve == null) {
            throw new Error("'config.resolve' is undefined.");
        }
        config.resolve.alias = {
            react: path.resolve("./node_modules/react"),
            "react-dom": path.resolve("./node_modules/react-dom")
        };

        if (config.plugins == null) {
            config.plugins = [];
        }

        return config;
    })
    .toConfig(true);

module.exports = configToExport;
