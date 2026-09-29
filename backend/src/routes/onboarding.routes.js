const express = require('express');
const router = express.Router();

const onboardingController = require('../controllers/onboarding.controller');
const requireAuth = require('../middlewares/auth.middleware');

router.patch('/complete', requireAuth, onboardingController.completeOnboarding);

module.exports = router;
