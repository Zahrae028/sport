const pool = require('../config/db');
const { render } = require('../core/renderer');
const { parseFormBody, redirect } = require('../utils/helpers');
const { calculatePrice, calculateInstallments } = require('../services/pricingService');
const { checkAgeEligibility, getMedicalStatus } = require('../services/eligibilityService');
const { promoteNextCandidate, expireOldPromotions } = require('../services/waitingListService');

async function list(req, res, error = null, quote = null) {
    if (typeof error !== 'string') {
        error = null;
    }

    if (quote && typeof quote !== 'object') {
        quote = null;
    }

    const [registrations, waiting, members, activities] = await Promise.all([
        pool.query(`
            SELECT r.*, m.full_name, a.name AS activity_name
            FROM registrations r
            JOIN members m ON m.id = r.member_id
            JOIN activities a ON a.id = r.activity_id
            ORDER BY r.created_at DESC
        `),

        pool.query(`
            SELECT wl.*, m.full_name, a.name AS activity_name
            FROM waiting_list wl
            JOIN members m ON m.id = wl.member_id
            JOIN activities a ON a.id = wl.activity_id
            ORDER BY wl.priority_score DESC, wl.created_at ASC
        `),

        pool.query('SELECT * FROM members ORDER BY full_name'),

        pool.query('SELECT * FROM activities ORDER BY name')
    ]);

    render(res, 'pages/registrations.ejs', {
        registrations: registrations.rows,
        waiting: waiting.rows,
        members: members.rows,
        activities: activities.rows,
        error,
        quote
    }, error ? 400 : 200);
}

async function create(req, res) {
    const body = await parseFormBody(req);

    const memberId = Number(body.member_id);
    const activityId = Number(body.activity_id);
    const paymentMode = Number(body.payment_mode || 1);
    const hasPassSport = body.pass_sport === 'on';

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const activityRes = await client.query(
            'SELECT * FROM activities WHERE id = $1 FOR UPDATE',
            [activityId]
        );

        if (activityRes.rowCount === 0) {
            throw new Error('Activité introuvable');
        }

        const activity = activityRes.rows[0];

        const memberRes = await client.query(
            `
            SELECT m.*, f.family_quotient
            FROM members m
            LEFT JOIN families f ON f.id = m.family_id
            WHERE m.id = $1
            `,
            [memberId]
        );

        if (memberRes.rowCount === 0) {
            throw new Error('Adhérent introuvable');
        }

        const member = memberRes.rows[0];

        if (!checkAgeEligibility(member.birth_date, activity.target_category)) {
            throw new Error(
                "L'âge de l'adhérent ne correspond pas à la catégorie de l'activité"
            );
        }

        const medicalStatus = getMedicalStatus(
            member.medical_certificate_date,
            activity.special_risk
        );

        if (
            activity.special_risk &&
            medicalStatus === 'medical_non_compliant'
        ) {
            throw new Error(
                'Certificat médical périmé : moins d’un an obligatoire pour ce sport'
            );
        }

        let familyRegistrationCount = 0;

        if (member.family_id) {
            const familyCountRes = await client.query(
                `
                SELECT COUNT(*) AS total
                FROM registrations r
                JOIN members m ON m.id = r.member_id
                WHERE m.family_id = $1
                AND r.status = 'confirmed'
                `,
                [member.family_id]
            );

            familyRegistrationCount = Number(
                familyCountRes.rows[0].total
            );
        }

        const pricing = calculatePrice({
            basePrice: Number(activity.base_price),
            resident: member.resident,
            familyRegistrationCount,
            familyQuotient: member.family_quotient ?? 1000,
            hasPassSport
        });

        const countRes = await client.query(
            `
            SELECT COUNT(*) AS total
            FROM registrations
            WHERE activity_id = $1
            AND status = 'confirmed'
            `,
            [activityId]
        );

        const currentCount = Number(countRes.rows[0].total);

        if (currentCount >= activity.max_capacity) {
            const priorityScore = member.resident ? 10 : 0;

            await client.query(
                `
                INSERT INTO waiting_list
                (activity_id, member_id, priority_score, status)
                VALUES ($1, $2, $3, 'waiting')
                `,
                [activityId, memberId, priorityScore]
            );

            await client.query('COMMIT');

            return redirect(res, '/registrations');
        }

        await client.query(
            `
            INSERT INTO registrations
            (
                member_id,
                activity_id,
                final_price,
                status,
                medical_status,
                payment_mode
            )
            VALUES ($1, $2, $3, 'confirmed', $4, $5)
            `,
            [
                memberId,
                activityId,
                pricing.finalPrice,
                medicalStatus,
                paymentMode
            ]
        );

        await client.query('COMMIT');

        const quote = {
            finalPrice: pricing.finalPrice,
            details: pricing.details,
            installments:
                paymentMode === 3
                    ? calculateInstallments(pricing.finalPrice)
                    : null,
            medicalStatus
        };

        return list(req, res, null, quote);

    } catch (err) {
        await client.query('ROLLBACK');

        return list(req, res, err.message, null);

    } finally {
        client.release();
    }
}

async function cancel(req, res, params) {
    const registrationId = Number(params.id);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const regRes = await client.query(
            'SELECT * FROM registrations WHERE id = $1 FOR UPDATE',
            [registrationId]
        );

        if (regRes.rowCount === 0) {
            throw new Error('Inscription introuvable');
        }

        const activityId = regRes.rows[0].activity_id;

        await client.query(
            `
            UPDATE registrations
            SET status = 'cancelled'
            WHERE id = $1
            `,
            [registrationId]
        );

        await expireOldPromotions(client, activityId);

        await promoteNextCandidate(client, activityId);

        await client.query('COMMIT');

        return redirect(res, '/registrations');

    } catch (err) {
        await client.query('ROLLBACK');

        return list(req, res, err.message, null);

    } finally {
        client.release();
    }
}

module.exports = {
    list,
    create,
    cancel
};