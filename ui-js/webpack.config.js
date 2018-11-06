const path = require('path');

module.exports = {
  entry: './src/synth-editor.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production'
};