const express = require('express');
const router = express.Router();
const foodsController = require('../controllers/foodsController');

router.get('/', foodsController.getFoods);
router.get('/:id', foodsController.getFoodById);

module.exports = router;
