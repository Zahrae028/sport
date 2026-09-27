const path = require('path');
const ejs = require('ejs');

function render(res, view, data = {}, statusCode = 200) {
  const file = path.join(__dirname, '../../views', view);
  ejs.renderFile(file, data, { root: path.join(__dirname, '../../views') }, (err, html) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Erreur interne du serveur');
    }
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

module.exports = { render };
