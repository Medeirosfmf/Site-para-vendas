const express = require('express');
const { getExample } = require('../controllers/exampleController');

const router = express.Router();

router.get('/example', getExample);

module.exports = router;
