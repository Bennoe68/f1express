const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const api = require('./routes/api');



const app = express();

//Цепочка middlewares, которая обрабатывает запросы на пути к серверу
//Запрос поступает в express, проходит валидацию на соответствие типа контента (Content-Type Header д.б. JSON) и поступает на экспресс-маршрутизатор, который направляет запрос к данным
app.use(cors({ //в {} - конфигурация объекта CORS, куда мы передаем разрешенные origins
    origin: 'http://localhost:3000',
}));

app.use(morgan('combined'));

app.use(express.json());//middleware parsing JSON
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1', api);//привязываем к приложению единый роутер для управления версиями нашего API Только для бекэнда, фронтэнд не трогаем, это не API
app.get('/*', (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'public','index.html'));//если отправляем json, то .json
})

module.exports = app;