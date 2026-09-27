async function promoteNextCandidate(client, activityId) {
  const next = await client.query(
    `SELECT wl.id, wl.member_id
     FROM waiting_list wl
     WHERE wl.activity_id = $1 AND wl.status = 'waiting'
     ORDER BY wl.priority_score DESC, wl.created_at ASC
     LIMIT 1
     FOR UPDATE`,
    [activityId]
  );

  if (next.rowCount === 0) return null;

  const promoted = next.rows[0];
  await client.query(
    `UPDATE waiting_list
     SET status = 'promoted_pending',
         deadline_confirmation = NOW() + INTERVAL '48 hours'
     WHERE id = $1`,
    [promoted.id]
  );

  return promoted;
}

async function expireOldPromotions(client, activityId) {
  await client.query(
    `UPDATE waiting_list
     SET status = 'expired'
     WHERE activity_id = $1
       AND status = 'promoted_pending'
       AND deadline_confirmation < NOW()`,
    [activityId]
  );
}

module.exports = { promoteNextCandidate, expireOldPromotions };
