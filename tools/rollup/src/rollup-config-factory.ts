import { InputOptions, OutputOptions } from "rollup";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import builtins from "builtin-modules";
import { terser } from "rollup-plugin-terser";

export interface RollupConfigFactoryOptions {
    dependencies: string[];
}

export function rollupConfigFactory(options: RollupConfigFactoryOptions): InputOptions & { output: OutputOptions[] } {
    return {
        input: "src/index.ts",
        output: [
        {
                file: "dist/index.js",
                format: "cjs"
            },
            {
                file: "dist/index.es.js",
                format: "es"
            }
        ],
        external: [...builtins, ...options.dependencies],
        // prettier-ignore
        plugins: [
            commonjs(),
            typescript({
                composite: false,
                target: "ES2015"
            }),
            terser()
        ]
    };
}
