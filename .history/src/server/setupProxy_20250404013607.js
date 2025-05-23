// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api', '/signup', '/login', '/account'],
    createProxyMiddleware({
      // target: 'http://localhost:6000',
      target: 'http://localhost:4500',
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/api': ''
      }
    })
  );
};