// const isProd = (process.env.NODE_ENV || 'production') === 'production'
// require('dotenv').config({ path: isProd ? '.env.production' : '.env.local' } );

require('dotenv').config({ path: '.env.local' } );

module.exports = {
  // assetPrefix: isProd ? '/tina-cms' : '',
  env: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    REPO_FULL_NAME: process.env.REPO_FULL_NAME,
    BASE_BRANCH: process.env.BASE_BRANCH,
  },
  webpack(config, {isServer}){
    if(!isServer) {
      config.node = {
        fs: 'empty',
      }
    };
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })
    return config;
  },
}