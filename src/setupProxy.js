const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug', // Add debug logging
      onError: (err, req, res) => {
        console.log('Proxy error:', err);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url, '-> http://localhost:5000' + req.url);
      }
    })
  );
};