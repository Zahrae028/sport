INSERT INTO facilities (name, type, erp_capacity) VALUES
('Gymnase Municipal', 'Gymnase', 50),
('Dojo Central', 'Dojo', 25),
('Bassin Municipal', 'Piscine', 30);

INSERT INTO associations (name, contact_email) VALUES
('Atlas Sport', 'atlas@example.com'),
('Club Horizon', 'horizon@example.com');

INSERT INTO families (family_name, family_quotient) VALUES
('Famille Amrani', 550),
('Famille Idrissi', 850),
('Famille Benali', 1200);

INSERT INTO members (full_name, birth_date, resident, family_id, medical_certificate_date) VALUES
('Sara Amrani', '2016-04-10', TRUE, 1, CURRENT_DATE - INTERVAL '6 months'),
('Yassine Idrissi', '2005-08-12', TRUE, 2, CURRENT_DATE - INTERVAL '2 years'),
('Adam Benali', '2011-01-20', FALSE, 3, CURRENT_DATE - INTERVAL '14 months');

INSERT INTO activities (name, association_id, facility_id, day_of_week, start_time, end_time, max_capacity, base_price, target_category, special_risk, zone) VALUES
('Basket Junior', 1, 1, 'Lundi', '18:00', '19:00', 20, 120, 'U18', FALSE, 'full'),
('Boxe Senior', 2, 2, 'Mardi', '19:00', '20:30', 20, 150, 'Senior', TRUE, 'full'),
('Natation Tous', 1, 3, 'Mercredi', '17:00', '18:00', 25, 100, 'Tous publics', FALSE, 'full');
