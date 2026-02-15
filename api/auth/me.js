const { getAuthUser, requireAuth } = require('../lib/auth');
const { handleCors, corsHeaders } = require('../lib/cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const cors = corsHeaders();
  if (req.method !== 'GET') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const user = await getAuthUser(req);
  const err = requireAuth(user);
  if (err) {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(err.status).json(err.json);
  }
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  res.status(200).json(user);
};
