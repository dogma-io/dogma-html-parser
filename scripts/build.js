#! /usr/bin/env node

const path = require('path')
const rollup = require('rollup')
const flow = require('rollup-plugin-flow')
const uglify = require('rollup-plugin-uglify')
const {minify} = require('uglify-es')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

function buildWithRollup (options) {
  const plugins = [
    flow(),
  ]

  if (!options.debug) {
    plugins.push(
      uglify({}, minify)
    )
  }

  return rollup.rollup({
    input: 'src/index.js',
    plugins,
  })
    .then(bundle => {
      return bundle.write({
        file: options.file,
        format: options.format,
        name: 'dogmaHtmlParser',
      })
    })
}

function buildWithWebpack (options) {
  const plugins = []

  if (!options.debug) {
    plugins.push(
      new UglifyJSPlugin()
    )
  }

  return new Promise((resolve, reject) => {
    const compiler = webpack({
      entry: path.join(__dirname, '..', 'src', 'index.js'),
      output: {
        filename: path.basename(options.file),
        path: path.dirname(options.file),
      },
      plugins,
    })

    compiler.run((err, stats) => {
      if (err) {
        throw err
      }

      resolve()
    })
  })
}

Promise.all([
  buildWithRollup({
    debug: true,
    file: 'dist/dogma-html-parser.es6.js',
    format: 'iife',
  }),
  buildWithRollup({
    debug: false,
    file: 'dist/dogma-html-parser.es6.min.js',
    format: 'iife',
  }),
  buildWithWebpack({
    debug: true,
    file: path.join(__dirname, '..', 'dist', 'dogma-html-parser.js'),
  }),
  buildWithWebpack({
    debug: false,
    file: path.join(__dirname, '..', 'dist', 'dogma-html-parser.min.js'),
  }),
])
  .then(() => {
    console.info('Done building :)')
  })
  .catch(err => {
    console.error('Building failed :(')
    throw err
  })
