/* eslint-disable */
import { rollupConfigFactory } from "@reactway-tools/rollup";

const packageJson = require("./package.json");

export default rollupConfigFactory({
    dependencies: [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.peerDependencies || {})]
});
