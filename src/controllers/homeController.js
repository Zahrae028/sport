const pool = require('../config/db');
const { render } = require('../core/renderer');

async function dashboard(req, res) {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM facilities) AS facilities,
      (SELECT COUNT(*) FROM activities) AS activities,
      (SELECT COUNT(*) FROM members) AS members,
      (SELECT COUNT(*) FROM registrations WHERE status = 'confirmed') AS registrations,
      (SELECT COALESCE(SUM(final_price), 0) FROM registrations WHERE status = 'confirmed') AS revenue
  `);

  render(res, 'pages/dashboard.ejs', { stats: stats.rows[0] });
}

module.exports = { dashboard };
