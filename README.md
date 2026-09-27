# SportConnect Pro

Projet YouCode MERN — Node.js HTTP natif + EJS + PostgreSQL (`pg`), sans Express et sans ORM.

## Installation

1. Créer la base PostgreSQL : `sportconnect_pro`
2. Exécuter `database/schema.sql`
3. Exécuter `database/seeds.sql`
4. Copier `.env.example` vers `.env` et mettre le vrai mot de passe PostgreSQL
5. Installer les dépendances : `npm install`
6. Démarrer : `node server.js`
7. Ouvrir : `http://localhost:3000`

## Fonctionnalités couvertes

- serveur HTTP natif `http.createServer`
- routage `find-my-way`
- fichiers statiques `serve-static`
- EJS
- PostgreSQL avec requêtes paramétrées `$1`, `$2`, etc.
- infrastructures et jauge ERP
- détection de conflits horaires
- catégories d'âge
- conformité du certificat médical
- tarification résident / extérieur, famille, QF, Pass'Sport, plancher 15 €
- paiement 1x ou 3x (40/30/30 avec correction d'arrondi)
- transaction `BEGIN / COMMIT / ROLLBACK`
- verrou `FOR UPDATE`
- file d'attente avec priorité résident +10
- promotion après annulation avec deadline 48h
- pages 404 / erreur 500

## Remarque

Le HTML dynamique est affiché avec `<%= %>` dans EJS, donc les valeurs utilisateur sont échappées.
