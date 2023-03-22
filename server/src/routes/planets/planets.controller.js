//контроллер должен нахожится в папке с роутером, т.к. роутер прямо использует контроллер

const { getAllPlanets } = require('../../models/planets.model');

async function httpGetAllPlanets (req,res) {
   return res.status(200).json(await getAllPlanets());//отправлять статускод необязательно, т.к. по умолчанию отправляется 200 в случае успеха запроса
   //return не использует express, мы ретёрним функцию для ее остановки после выполнения для предотвращения ошибок
}
module.exports = {
    httpGetAllPlanets
}