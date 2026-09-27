-- Taux de remplissage par activité
SELECT a.id, a.name, a.max_capacity,
       COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed,
       ROUND(
         100.0 * COUNT(r.id) FILTER (WHERE r.status = 'confirmed') / NULLIF(a.max_capacity, 0),
         2
       ) AS fill_rate
FROM activities a
LEFT JOIN registrations r ON r.activity_id = a.id
GROUP BY a.id
ORDER BY fill_rate DESC NULLS LAST;

-- Recettes confirmées
SELECT COALESCE(SUM(final_price), 0) AS total_revenue
FROM registrations
WHERE status = 'confirmed';
