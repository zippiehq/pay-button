var path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    index: './src/zippie-pay.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'zippie-pay.js',
    library: 'zippie',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
  },
};




