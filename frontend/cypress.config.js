const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    testIsolation: false,
    baseUrl: 'http://localhost:3000',
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
});
