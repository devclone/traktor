const express = require('express');

const middlw = express.Router();

middlw.use('*', require('./localtest'));


module.exports = middlw;