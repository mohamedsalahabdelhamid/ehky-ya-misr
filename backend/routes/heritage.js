const express = require('express');
const router = express.Router();
const heritageController = require('../controllers/heritageController');

router.get('/', heritageController.getHeritageItems);
router.get('/crafts/:id', heritageController.getCraftById);

module.exports = router;

