var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  resolve: {
      extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
            ],
            'sass': [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ]
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(jpg|JPG|jpeg|png|gif|mp3|svg|ttf|woff2|woff|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    template: './src/index.html'
  })],
  devServer: {
    historyApiFallback: true
  },
  externals: {
    // global app config object
    config: JSON.stringify({
      apiUrl: process.env.NODE_ENV === 'production' ? 
        'https://eztalk-dev.herokuapp.com/api/v1' : 'http://localhost:1338/api/v1',
      socketUrl: process.env.NODE_ENV === 'production' ?
      	'https://eztalk-dev.herokuapp.com' : 'http://localhost:1338',
      iceServerConfiguration: {
        'iceServers': [{
          "url":"stun:global.stun.twilio.com:3478?transport=udp",
          "urls":"stun:global.stun.twilio.com:3478?transport=udp"
        }, {
          "url":"turn:global.turn.twilio.com:3478?transport=udp",
          "username":"73a4afa119bd11d37e6e64003542c3cc9a0ae4cdad85871c193e1690eee4fea6",
          "urls":"turn:global.turn.twilio.com:3478?transport=udp",
          "credential":"j1oQKgPw75sFJbX5abH1MLQRfXl33RAYNxXDDtYPElI="
        }, {
          "url":"turn:global.turn.twilio.com:3478?transport=tcp",
          "username":"73a4afa119bd11d37e6e64003542c3cc9a0ae4cdad85871c193e1690eee4fea6",
          "urls":"turn:global.turn.twilio.com:3478?transport=tcp",
          "credential":"j1oQKgPw75sFJbX5abH1MLQRfXl33RAYNxXDDtYPElI="
        }, {
          "url":"turn:global.turn.twilio.com:443?transport=tcp",
          "username":"73a4afa119bd11d37e6e64003542c3cc9a0ae4cdad85871c193e1690eee4fea6",
          "urls":"turn:global.turn.twilio.com:443?transport=tcp",
          "credential":"j1oQKgPw75sFJbX5abH1MLQRfXl33RAYNxXDDtYPElI="
        }]
      }  
    })
  }
}

console.log(module.exports.externals)
