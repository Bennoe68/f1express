const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planetsDB = require('./planets.mongo');

//const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;

}

function loadPlanetsData() { //функция запускается до старта нашего express сервера
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')) // функция дает нам эмиттер событий
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    //habitablePlanets.push(data);
                   
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log(`Habitable planets found: ${countPlanetsFound}`);
                resolve();
            });
    });
}

async function getAllPlanets() {
    return await planetsDB.find({},
        { '_id':0, '__v':0 });
}

async function savePlanet (planet) {
    try{
        await planetsDB.updateOne({
            keplerName: planet.kepler_name, //мы должны передавать данные в соответствии с определенной схемой (planet - импортированная схема)
            //kepler_name - название колонки с именами планет,  data - каждая строка читаемого в потоке файла
        }, {
            keplerName: planet.kepler_name,
        }, {
            upsert: true
        });
    } catch (err) {
        console.error(`Could not save planet ${err}`);
    }

}


module.exports = {
    loadPlanetsData,
    getAllPlanets 
}