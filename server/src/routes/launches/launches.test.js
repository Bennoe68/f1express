const request = require('supertest');
const app = require('../../app');
const { mongoConnect, MongoDisconnect } = require('../../services/mongo');


describe('Launches API Tests', ()=>{
   beforeAll(async()=>{ // запускаем соединение с БД для тестов отдельно благодаря разбиению подключения к БД на модуль
    await mongoConnect();
   });

   afterAll(async()=>{
    await MongoDisconnect(); //после завершения тестов требуется завершить соединение с БД
});

const testingData = {
    mission: 'KatkaToVillage',
    rocket: 'Landrover 2008',
    target: 'Lintupi',
    launchDate: 'January 19, 2023',
};

const testingDataWithoutDate = {
    mission: 'KatkaToVillage',
    rocket: 'Landrover 2008',
    target: 'Lintupi',

};

const testingDataWithInvalidDate = {
    mission: 'KatkaToVillage',
    rocket: 'Landrover 2008',
    target: 'Lintupi',
    launchDate: 'hz data',
};


describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => { //синтаксис supertest проще и позволяет, помимо запросов, в цепочке функций expect() проверить несколько вещей
        //вроде заголовков
        const response = await request(app)
            .get('/v1/launches')
            .expect('Content-Type', /json/) //проверяем заголовок, поле Content-Type должно содержать слово json (применили регулярное выражение)
            .expect(200);
    });
});


describe('Test POST /launch', () => {
    test('It should respond with 201 created', async () => {
        const response = await request(app)
            .post('/v1/launches')
            .send(testingData)  //т.к. это post-запрос, они должен принимать некоторые данные для тестовой отправки на сервер
            .expect('Content-Type', /json/)
            .expect(201); //Также проверяем заголовок и статусКод в цепочке expect, для POST (create) это 201

        const requestDate = new Date(testingData.launchDate).valueOf();//проверяем даты. valueOf() Возвращает сохраненное значение времени в миллисекундах с полуночи 1 января 1970 года по всемирному координированному времени.
        const responseDate = new Date(response.body.launchDate).valueOf();//То есть мы сравним совпадение двух дат с точностью до миллисекунды
        expect(responseDate).toBe(requestDate);

        expect(response.body).toMatchObject(testingDataWithoutDate); //проверяем тело ответа с помощью функции jest toMatchObject()
    });
});

test('It should catch missing required property', async () => {
    const response = await request(app)
        .post('/v1/launches')
        .send(testingDataWithoutDate)  //т.к. это post-запрос, они должен принимать некоторые данные для тестовой отправки на сервер
        .expect('Content-Type', /json/)
        .expect(400);

    expect(response.body).toStrictEqual({
        error: "Missed required launch property"
    });
});


test('It should catch invalid dates', async () => {
    const response = await request(app)
        .post('/v1/launches')
        .send(testingDataWithInvalidDate)  //т.к. это post-запрос, они должен принимать некоторые данные для тестовой отправки на сервер
        .expect('Content-Type', /json/)
        .expect(400);

    expect(response.body).toStrictEqual({
        error: "Invalid launch date"
    });
});

});




