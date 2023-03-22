require('dotenv').config(); //единственная функция модуля dotenv. Применить настройки окружения. Функуия д. вызываться НАД всеми импортами, чтобы она применилась ко всему нашему коду, особенно к mongo.js из services
const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');//при импорте используем структурный синтаксис, так как знаем, что будем использовать конкретную функцию
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;//process.env.PORT-переменная окружения, сождержащая предоставленный порт. Если false, используем 8000

const server = http.createServer(app);
//Мы прикрепили наше серверное приложение к серверу, теперь любые маршруты и middlewares будут проходить через сервер. По сути, эксперсс здесь нужен для прослушивания сервера

//для ошибок будем использовать on(), т.к. разных ошибок может выкидывать несколько
mongoose.connection.on('error', (err)=>{
    console.error(err); // вместо обычного лога используем "ошибочный", т.е. будет оформлен соответствующим образом
})



async function startServer(){
    await mongoConnect(); //используем функцию соединения с БД как для тестов, так и для приложения благодаря разбиению на модули (mongo.js)
    await loadPlanetsData();
    await loadLaunchData();
    server.listen(PORT), () => {
        console.log(`Listening on port: ${PORT}...`);
    };
}


startServer();
console.log(`PORT: ${PORT}`);