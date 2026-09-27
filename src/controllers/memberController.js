const pool = require('../config/db');
const { render } = require('../core/renderer');
const { parseFormBody, redirect } = require('../utils/helpers');
const { getAgeCategory } = require('../services/eligibilityService');

async function list(req, res) {
  const [members, families] = await Promise.all([
    pool.query(`SELECT m.*, f.family_name, f.family_quotient
                FROM members m
                LEFT JOIN families f ON f.id = m.family_id
                ORDER BY m.id`),
    pool.query('SELECT * FROM families ORDER BY family_name')
  ]);

  const rows = members.rows.map(m => ({ ...m, age_category: getAgeCategory(m.birth_date) }));
  render(res, 'pages/members.ejs', { members: rows, families: families.rows, error: null });
}

async function create(req, res) {
  const body = await parseFormBody(req);
  await pool.query(
    `INSERT INTO members (full_name, birth_date, resident, family_id, medical_certificate_date)
     VALUES ($1,$2,$3,$4,$5)`,
    [
      body.full_name,
      body.birth_date,
      body.resident === 'on',
      body.family_id ? Number(body.family_id) : null,
      body.medical_certificate_date || null
    ]
  );
  redirect(res, '/members');
}

module.exports = { list, create };
