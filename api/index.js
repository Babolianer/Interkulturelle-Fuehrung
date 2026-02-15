const app = require('../backend/src/app');

module.exports = (req, res) => {
  // Vercel rewrites /api/:path* → /api?path=:path*; Express braucht den vollen Pfad
  const path = req.query.path;
  if (path) {
    const rest = Array.isArray(path) ? path.join('/') : path;
    const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = '/api/' + rest + qs;
  }
  app(req, res);
};
