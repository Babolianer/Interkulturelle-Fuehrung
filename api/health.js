const { handleCors, corsHeaders } = require('./lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  res.status(200).json({ ok: true });
};
