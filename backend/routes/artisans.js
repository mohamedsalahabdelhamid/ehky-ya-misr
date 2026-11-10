const express = require('express');
const router = express.Router();
const artisansController = require('../controllers/artisansController');

router.get('/', artisansController.getArtisans);
router.get('/:id', artisansController.getArtisanById);

module.exports = router;
