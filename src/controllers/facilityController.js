const pool = require('../config/db');
const { render } = require('../core/renderer');
const { parseFormBody, redirect } = require('../utils/helpers');

async function list(req, res) {
  const result = await pool.query('SELECT * FROM facilities ORDER BY id');
  render(res, 'pages/facilities.ejs', { facilities: result.rows, error: null });
}

async function create(req, res) {
  const body = await parseFormBody(req);
  const capacity = Number(body.erp_capacity);
  if (!body.name || !body.type || !Number.isInteger(capacity) || capacity <= 0) {
    const result = await pool.query('SELECT * FROM facilities ORDER BY id');
    return render(res, 'pages/facilities.ejs', {
      facilities: result.rows,
      error: 'Veuillez remplir correctement tous les champs.'
    }, 400);
  }

  await pool.query(
    'INSERT INTO facilities (name, type, erp_capacity) VALUES ($1, $2, $3)',
    [body.name, body.type, capacity]
  );
  redirect(res, '/facilities');
}


async function listAssociations(req, res) {
  const result = await pool.query('SELECT * FROM associations ORDER BY id');
  render(res, 'pages/associations.ejs', { associations: result.rows, error: null });
}

async function createAssociation(req, res) {
  const body = await parseFormBody(req);
  if (!body.name) {
    const result = await pool.query('SELECT * FROM associations ORDER BY id');
    return render(res, 'pages/associations.ejs', {
      associations: result.rows,
      error: 'Le nom de l’association est obligatoire.'
    }, 400);
  }

  await pool.query(
    'INSERT INTO associations (name, contact_email) VALUES ($1, $2)',
    [body.name, body.contact_email || null]
  );
  redirect(res, '/associations');
}

module.exports = { list, create, listAssociations, createAssociation };
