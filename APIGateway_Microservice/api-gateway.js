const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

function authToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json("Missing token");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json("Invalid token");
    req.user = user;
    next();
  });
}

function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json("Unauthorized");
    next();
  };
}

// Routes
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: { '^/auth': '' } // forwards /auth/register → /register
}));

// Forward club requests without stripping the base path
app.use('/club', authToken, authRole('club_leader'), createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: { '^/club': '/club' }
}));

// Event service is mounted on `/events` so keep the pluralised path
app.use('/event', authToken, authRole('club_leader'), createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true,
  pathRewrite: { '^/event': '/events' }
}));

// Budget service expects `/budgets`
app.use('/budget', authToken, authRole('club_leader'), createProxyMiddleware({
  target: 'http://localhost:5004',
  changeOrigin: true,
  pathRewrite: { '^/budget': '/budgets' }
}));

// Inventory service mounts its routes under `/inventory`
app.use('/inventory', authToken, authRole('club_leader'), createProxyMiddleware({
  target: 'http://localhost:5005',
  changeOrigin: true,
  pathRewrite: { '^/inventory': '/inventory' }
}));

app.listen(4000, () => console.log("🚀 API Gateway running on port 4000"));
