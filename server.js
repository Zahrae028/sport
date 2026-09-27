require('dotenv').config();
const http = require('http');
const path = require('path');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');
const pool = require('./src/config/db');
const { buildRouter } = require('./src/core/router');
const { render } = require('./src/core/renderer');

const PORT = process.env.PORT || 3000;
const router = buildRouter();
const serve = serveStatic(path.join(__dirname, 'public'), { index: false });

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/') || url.pathname.startsWith('/images/')) {
      return serve(req, res, finalhandler(req, res));
    }

    router.lookup(req, res);
  } catch (err) {
    console.error(err);
    render(res, 'error.ejs', { status: 500, message: 'Erreur interne du serveur' }, 500);
  }
});


pool.query('SELECT NOW()')
  .then(() => {
    console.log('PostgreSQL connected!');
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('PostgreSQL connection failed:', err.message);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} (DB unavailable)`);
    });
  });
