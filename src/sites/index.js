const express = require('express');

const sites = express.Router();

sites.get('/', require('./landingPage'));

module.exports = sites;