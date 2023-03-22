const express = require('express');
const {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
} = require('./launches.controller');

launchesRouter = express.Router();
launchesRouter.get('/', httpGetAllLaunches);//в app.js установили миддлвер app.use('/launches', launchesRouter); теперь в роутере '/' = это по умолчанию '/lauches'
//иногда это может немного улучшить синтаксис
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;