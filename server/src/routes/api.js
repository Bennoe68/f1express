const express = require('express');

const launchesRouter = require('./launches/launches.router');
const planetsRouter = require('./planets/planets.router');

const api = express.Router(); // создаем единый роутер, управляющий другими роутерами

api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;