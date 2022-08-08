const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const EslintWebpackPlugin = require("eslint-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const path = require("path");
const fs = require('fs');
const paths = require('./config/paths');
const dotenv = require('dotenv');
const {expand} = require('dotenv-expand');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasureWebpackPlugin();
expand(dotenv.config());


const env = require('./config/env')

const measure = process.env.measure;

const isEnvDevelopment = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

// Check if Tailwind config exists
const useTailwind = fs.existsSync(
  path.join(paths.appPath, 'tailwind.config.js')
);

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    isEnvDevelopment && require.resolve('style-loader'),
    isEnvProduction && {
      loader: MiniCssExtractPlugin.loader,
      // css is located in `static/css`, use '../../' to locate index.html folder
      // in production `paths.publicUrlOrPath` can be a relative path
      options: paths.publicPath.startsWith('.')
        ? { publicPath: '../../' }
        : {},
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          config: false,
          plugins: !useTailwind
            ? [
                'postcss-flexbugs-fixes',
                [
                  'postcss-preset-env',
                  {
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  },
                ],
                // Adds PostCSS Normalize as the reset css with default options,
                // so that it honors browserslist config in package.json
                // which in turn let's users customize the target behavior as per their needs.
                'postcss-normalize',
              ]
            : [
                'tailwindcss',
                'postcss-flexbugs-fixes',
                [
                  'postcss-preset-env',
                  {
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  },
                ],
              ],
        },
        sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
      },
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve('resolve-url-loader'),
        options: {
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
          root: paths.appSrc,
        },
      },
      {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
        },
      }
    );
  }
  return loaders;
};

const config = {
  entry: "./src/index",
  mode: isEnvProduction ? "production" : "development",
  output: {
    clean: true,
    path: path.resolve(__dirname, "dist"),
    publicPath: env.publicPath,
    // There will be one main bundle, and one file per asynchronous chunk.
    // In development, it does not produce real files.
    filename: isEnvProduction
      ? 'static/js/[name].[contenthash:8].js'
      : isEnvDevelopment && 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: isEnvProduction
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : isEnvDevelopment && 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/media/[name].[hash][ext]',
    // webpack uses `publicPath` to determine where the app is being served from.
    // It requires a trailing slash, or the file assets will get an incorrect path.
    // We inferred the "public path" (such as / or /my-project) from homepage.
  },
  optimization: {
    minimize: isEnvProduction,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          // Added for profiling in devtools
          // keep_classnames: isEnvProductionProfile,
          // keep_fnames: isEnvProductionProfile,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
      }),
      // This is only used in production mode
      new CssMinimizerPlugin(),
    ],
  },
  devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
  devServer: {
    static: path.resolve(__dirname, "dist"),
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    isEnvDevelopment && new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          template: "./public/index.html",
          inject: "body",
        },
        isEnvProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined
      )
    ),
    new InterpolateHtmlPlugin(env.raw),
    isEnvDevelopment &&  new EslintWebpackPlugin({
      // extensions: ["js", "mjs", "jsx", "ts", "tsx"],
      // formatter: require.resolve("react-dev-utils/eslintFormatter"),
      eslintPath: require.resolve("eslint"),
      // failOnError: !(isEnvDevelopment && emitErrorsAsWarnings),
      context: path.resolve(__dirname, './src'),
      // cache: true,
      // cacheLocation: path.resolve(paths.appNodeModules, ".cache/.eslintcache"),
      // ESLint class options
      // cwd: paths.appPath,
      // resolvePluginsRelativeTo: __dirname,
      // baseConfig: {
      //   extends: [require.resolve("eslint-config-react-app/base")],
      // },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          filter(source) {
            const target = path.resolve(__dirname, 'public/index.html');
            return target !== source;
          }
        }
      ]
    }),
    new webpack.DefinePlugin(env.stringified),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".tsx", ".ts", ".js", ".jsx", ".json"]
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(tsx?|jsx?)$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              // Use `.swcrc` to configure swc
              loader: "swc-loader",
              options: {
                sync: true,
                jsc: {
                  parser: {
                    syntax: "typescript",
                    tsx: true,
                    dynamicImport: false,
                    privateMethod: true,
                    functionBind: false,
                    exportDefaultFrom: true,
                    exportNamespaceFrom: false,
                    decorators: false,
                    decoratorsBeforeExport: false,
                    topLevelAwait: false,
                    importMeta: false,
                  },
                  transform: {
                    react: {
                      refresh: isEnvDevelopment,
                      development: isEnvDevelopment,
                      runtime: "automatic",
                      pragmaFrag: "React.Fragment",
                      throwIfNamespace: true,
                      // development 不设置 会自动读取webpack mode
                      // development: false,
                      // Use Object.assign() instead of _extends. Defaults to false.
                      useBuiltins: false,
                    },
                  },
                  target: "es5",
                  loose: false,
                  externalHelpers: false,
                  // Requires v1.2.50 or upper and requires target to be es2016 or upper.
                  keepClassNames: false,
                },
              },
            },
          },
          {
            test: /\.css$/,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
              modules: {
                mode: 'local',
                auto: true
              }
            })
          },
          {
            test: /\.less/,
            // exclude: /node_modules/,
            use: getStyleLoaders({
              importLoaders: 3,
              sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
              modules: {
                mode: 'local',
                auto: true
              }
            }, 'less-loader')
          },
          {
            test: /\.(png|jpg|jpeg|gif)$/,
            type: 'asset'
          }
        ]
      }
    ],
  },
  stats: {
    errorDetails: true
  }
};

module.exports = measure === 'true' ? smp.wrap(config) : config;
