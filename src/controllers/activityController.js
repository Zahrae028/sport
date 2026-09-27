const pool = require('../config/db');
const { render } = require('../core/renderer');
const { parseFormBody, redirect } = require('../utils/helpers');
const { validateActivitySchedule } = require('../services/scheduleService');

async function list(req, res, error = null) {
    if (typeof error !== 'string') {
        error = null;
    }

    const [activities, facilities, associations] = await Promise.all([
        pool.query(`
            SELECT a.*, f.name AS facility_name, ass.name AS association_name
            FROM activities a
            JOIN facilities f ON f.id = a.facility_id
            LEFT JOIN associations ass ON ass.id = a.association_id
            ORDER BY a.id
        `),

        pool.query('SELECT * FROM facilities ORDER BY name'),

        pool.query('SELECT * FROM associations ORDER BY name')
    ]);

    render(res, 'pages/activities.ejs', {
        activities: activities.rows,
        facilities: facilities.rows,
        associations: associations.rows,
        error
    }, error ? 400 : 200);
}

async function create(req, res) {
    const body = await parseFormBody(req);

    try {
        await validateActivitySchedule({
            facilityId: Number(body.facility_id),
            dayOfWeek: body.day_of_week,
            startTime: body.start_time,
            endTime: body.end_time,
            maxCapacity: Number(body.max_capacity),
            zone: body.zone || 'full'
        });

        await pool.query(
            `INSERT INTO activities
            (name, association_id, facility_id, day_of_week, start_time, end_time, max_capacity, base_price, target_category, special_risk, zone)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [
                body.name,
                body.association_id ? Number(body.association_id) : null,
                Number(body.facility_id),
                body.day_of_week,
                body.start_time,
                body.end_time,
                Number(body.max_capacity),
                Number(body.base_price),
                body.target_category || 'Tous publics',
                body.special_risk === 'on',
                body.zone || 'full'
            ]
        );

        redirect(res, '/activities');

    } catch (err) {
        await list(req, res, err.message);
    }
}

module.exports = { list, create };