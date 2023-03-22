const { existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');


async function httpGetAllLaunches(req, res) {
    console.log(req.query);
    const { skip, limit } = getPagination(req.query); 
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: "Missed required launch property"
        });
    }
    launch.launchDate = new Date(launch.launchDate);//конвертим из JSON в формат, установленный в нашем API - в объект даты
    //Когда мы добавим запуск в нашу карту, дата будетs хранится правильно
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Invalid launch date"
        });
    }//Альтернатива валидации даты
    //if (launch.launchDate.toString() === 'Invalid Date') {
    // return res.status(400).json({
    //  error: "Invalid launch date"
    await scheduleNewLaunch(launch);
    //статус 201 - коллекция создана успешно
    return res.status(201).json(launch);

};

async function httpAbortLaunch (req, res) {
    const launchID = Number(req.params.id);//возвращаемый id (/:id)  - строка, для сопоставления с flightNumber (число) конвертим в Number
    const existLaunch = await existLaunchWithId(launchID);
    if (!existLaunch) {
        return res.status(404).json({
            error: "Launch does not exist"
        });
    }
   const aborted = await abortLaunchById(launchID);
   return res.status(200).json(aborted);
}


module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}