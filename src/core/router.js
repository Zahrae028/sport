const FindMyWay = require('find-my-way');
const { render } = require('./renderer');
const homeController = require('../controllers/homeController');
const facilityController = require('../controllers/facilityController');
const activityController = require('../controllers/activityController');
const memberController = require('../controllers/memberController');
const registrationController = require('../controllers/registrationController');

function safe(handler) {
  return async (req, res, params) => {
    try {
      await handler(req, res, params || {});
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        render(res, 'error.ejs', { status: 500, message: 'Erreur interne du serveur' }, 500);
      }
    }
  };
}

function buildRouter() {
  const router = FindMyWay({
    ignoreTrailingSlash: true,
    defaultRoute: (req, res) => {
      render(res, 'error.ejs', { status: 404, message: 'Page introuvable' }, 404);
    }
  });

  router.on('GET', '/', safe(homeController.dashboard));
  router.on('GET', '/facilities', safe(facilityController.list));
  router.on('POST', '/facilities', safe(facilityController.create));
  router.on('GET', '/associations', safe(facilityController.listAssociations));
  router.on('POST', '/associations', safe(facilityController.createAssociation));
  router.on('GET', '/activities', safe(activityController.list));
  router.on('POST', '/activities', safe(activityController.create));
  router.on('GET', '/members', safe(memberController.list));
  router.on('POST', '/members', safe(memberController.create));
  router.on('GET', '/registrations', safe(registrationController.list));
  router.on('POST', '/registrations', safe(registrationController.create));
  router.on('POST', '/registrations/:id/cancel', safe(registrationController.cancel));

  return router;
}

module.exports = { buildRouter };
