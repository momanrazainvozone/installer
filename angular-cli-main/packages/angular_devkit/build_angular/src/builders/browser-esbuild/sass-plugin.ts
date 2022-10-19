/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type { PartialMessage, Plugin, PluginBuild } from 'esbuild';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CompileResult } from 'sass';

export function createSassPlugin(options: { sourcemap: boolean; loadPaths?: string[] }): Plugin {
  return {
    name: 'angular-sass',
    setup(build: PluginBuild): void {
      let sass: typeof import('sass');

      build.onLoad({ filter: /\.s[ac]ss$/ }, async (args) => {
        // Lazily load Sass when a Sass file is found
        sass ??= await import('sass');

        try {
          const warnings: PartialMessage[] = [];
          // Use sync version as async version is slower.
          const { css, sourceMap, loadedUrls } = sass.compile(args.path, {
            style: 'expanded',
            loadPaths: options.loadPaths,
            sourceMap: options.sourcemap,
            sourceMapIncludeSources: options.sourcemap,
            quietDeps: true,
            logger: {
              warn: (text, _options) => {
                warnings.push({
                  text,
                });
              },
            },
          });

          return {
            loader: 'css',
            contents: sourceMap
              ? `${css}\n${sourceMapToUrlComment(sourceMap, dirname(args.path))}`
              : css,
            watchFiles: loadedUrls.map((url) => fileURLToPath(url)),
            warnings,
          };
        } catch (error) {
          if (error instanceof sass.Exception) {
            const file = error.span.url ? fileURLToPath(error.span.url) : undefined;

            return {
              loader: 'css',
              errors: [
                {
                  text: error.toString(),
                },
              ],
              watchFiles: file ? [file] : undefined,
            };
          }

          throw error;
        }
      });
    },
  };
}

function sourceMapToUrlComment(
  sourceMap: Exclude<CompileResult['sourceMap'], undefined>,
  root: string,
): string {
  // Remove `file` protocol from all sourcemap sources and adjust to be relative to the input file.
  // This allows esbuild to correctly process the paths.
  sourceMap.sources = sourceMap.sources.map((source) => relative(root, fileURLToPath(source)));

  const urlSourceMap = Buffer.from(JSON.stringify(sourceMap), 'utf-8').toString('base64');

  return `/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${urlSourceMap} */`;
}
