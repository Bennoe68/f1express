const mongoose = require('mongoose');
require('dotenv').config();

//файл для отдельного запуска БД как для тестов, так и для приложения
const MONGO_URL = process.env.MONGO_URL;



mongoose.set("strictQuery", false);

mongoose.connection.once('open', ()=>{ //mongoose.connection - это event-emitter, генерирующий событие, когда соединение установлено. Мы вызываем коллбэк в ответ на это событие
    //Т.к. событие генерируется один раз (установлено соединение) мы использовали разовый прослушиватель (once())
    console.log('MongoDB connection ready!');
});

async function mongoConnect() {
    await mongoose.connect(MONGO_URL).then(() => console.log('Connected!')).catch((error) => console.log("There was an error: ", error));
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };