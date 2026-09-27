const pool = require('../config/db');

async function validateActivitySchedule({ facilityId, dayOfWeek, startTime, endTime, maxCapacity, zone = 'full', ignoreId = null }) {
  const facilityRes = await pool.query(
    'SELECT id, erp_capacity FROM facilities WHERE id = $1',
    [facilityId]
  );

  if (facilityRes.rowCount === 0) {
    throw new Error('Infrastructure introuvable');
  }

  if (Number(maxCapacity) > Number(facilityRes.rows[0].erp_capacity)) {
    throw new Error('La capacité du cours dépasse la jauge ERP de la salle');
  }

  const params = [facilityId, dayOfWeek, startTime, endTime];
  let sql = `
    SELECT id, name, start_time, end_time, zone
    FROM activities
    WHERE facility_id = $1
      AND day_of_week = $2
      AND start_time < $4
      AND end_time > $3
  `;

  if (ignoreId) {
    params.push(ignoreId);
    sql += ' AND id <> $5';
  }

  const conflicts = await pool.query(sql, params);
  const realConflict = conflicts.rows.find(existing => {
    return existing.zone === 'full' || zone === 'full' || existing.zone === zone;
  });

  if (realConflict) {
    throw new Error(`Conflit horaire avec l'activité : ${realConflict.name}`);
  }

  return true;
}

module.exports = { validateActivitySchedule };
