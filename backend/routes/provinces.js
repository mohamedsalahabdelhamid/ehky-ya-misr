const express = require('express');
const router = express.Router();
const provincesController = require('../controllers/provincesController');

router.get('/', provincesController.getAllProvinces);
router.get('/:id', provincesController.getProvinceById);

module.exports = router;

