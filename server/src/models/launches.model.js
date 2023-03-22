const axios = require('axios');
const launchesDB = require('./launches.mongo');
const planetsDB = require('./planets.mongo');

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'; 

const DEFAULT_FLIGHT_NUMBER = 100;

//let latestFlightNumber = 100;
//const launches = new Map();

//var launch = {
//    flightNumber: 100,//flight_number поле из API
//    mission: 'Kepler Exploration X23',//name
//    rocket: 'Explorer IS12',//rocket.name поле из API SpaceX
//    target: 'Kepler442b', //not applicable
//    launchDate: new Date('December 27, 2030'),//date_local
//    customer: ['NASA', 'Filka'], //payload.customers for each payload
//    upcoming: true,//upcoming
//    success: true//success
//};

//saveLaunch(launch);



async function loadAllPopulateLaunches() {
    //методы запросов axios принимают два аргумента: 1) URL 2)Объект тела запроса (запрос(query)+options)
    console.log('Starting loading all launches data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},//т.к. это JS-объект, кавычки для ключей необязательны, интерпетатор понимает, что это строки
        options: {
            pagination: false,//выключили разбиение данных на странице в API, чтобы загружать данные целиком, а не постранично
            //pagination полезен для снижения нагрузки, ведь мы загружаем небольшой объем данных за один запрос, после переходим в след странице и тд.
            populate: [
                {
                    path: 'rocket',
                    select: {
                        "name": 1
                    }
                },
                {
                    path: 'payloads',//для получения данных customers обращаемся к коллекции payloads, где есть поле customers
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });
    if (response.status !== 200) {
        console.error(`There was a some problem loading data`);
        throw new Error('Launch data downloading failed');
    }
    //свойство data ответа предоставляет axios
    const launchsDocs = response.data.docs; //docs - название массива, в котором содержаться данные о запуске - "docs": [launchData]
    //data - свойство, предоставляемое axios - возвращаемые данные
    //хороший тон в обработке получаемых данных добавлять в название переменной название целевой коллекции, из которой мы получаем данные (Docs в нашем случае)
    for (const launchDoc of launchsDocs) { //для каждой вложенной коллекции списка (массива) docs
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => payload['customers']); //Короткая альтернатива {RETURN payload['customers']}
        //Функция flatMap() возвращает список. Элементы для возвращаемого списка обрабатываются коллбэком (любая функция)
        //обращаемся к кваждому объекту payload и его полю, содержащему список. В итоге customers по каждому запуску (ЦИКЛ!) будут в одном массиве-списке

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],//в коллекции rocket поле name

            /*rocket": {
                // "name": "Falcon 1",
                 // "id": "5e9d0d95eda69955f709d1eb"
                 // },
            */
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customer: customers, // альтернатива записи: просто оставить customers,
        };
        console.log(` ${launch.flightNumber}, ${launch.rocket}`); //console.log(typeof 42); выводит тип примитива, массив  - Object, для уточнения массива используется Array.isArray()
        //console.log(Array.isArray(launch.customer));//возвращает Boolean, является ли массивом передаваемый объект
        //находясь в цикле, сторим каждую итерацию в БД
        await saveLaunch(launch);
    }
}

async function loadLaunchData() { //главная фукнция получения всех данных из API SpaceX, если мы еще не загружали данные (блок валидации)
    const firstLaunch = await findLaunchForExcludeLoading({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat"
    });
    if (firstLaunch) {
        console.log("Launch data already loaded");
        return;
    } else {
        await loadAllPopulateLaunches();
    }

}


async function findLaunchForExcludeLoading(filter) { //в filter передаем объект с полями первого запуска
    return await launchesDB.findOne(filter);
}


async function existLaunchWithId(launchId) {//функция валидации. Из req.params.id (/:id) получаем flightNumber и ищем в БД в коллекции launches документ, содержащий этот номер
    return await findLaunchForExcludeLoading({ //return await launchesDB.findOne({
        flightNumber: launchId, //объект передаем в filter
    });
}

//js-объект - ключи и значения строки, Map() - ключи и значения могут быть чем угодно, даже функциями

//launches.set(launch.flightNumber, launch);

async function getLatestFlightNumber() {
    //Вызываем findOut() без аргументов (без{}), так как критерием служит функция sort(). Знак "-" - обратный порядок сортировки по свойству flightNumber
    //Т.е. от большего к меньшему. В переменной latestLaunch сохраняется первый элемент отсортированного массива, который возвращает findOne()
    const latestLaunch = await launchesDB.findOne().sort('-flightNumber');
    if (!latestLaunch) { //Если коллекция пуста и мы не находим launch, возвращаем начальный номер 100
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;//если объект launch есть, возращаем значение поля flightNumber
}

async function getAllLaunches(skip, limit) {
    //return Array.from(launches.values());
    return await launchesDB.find({}, { //Получаем все документы коллекции launches, в документах исключаем (второй аргумент projection) поля
        //с ObjectId и версией документа. В ответ должны поступать только самые необходимые данные - правило безопасности
        '_id': 0, '__v': 0,
        //skip() и limit() - функции mongoose. Они реализуют pagination нашего API. skip() - количество документов, которые мы не хотим выдавать,
        //т.е. ПРОПУСКАЕМ. В данной функциональной цепи на страницу после пропуска первых 20 будут возвращаться 50 результатов
    })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
    const planet = await planetsDB.findOne({ keplerName: launch.target });
    //блок валидации по планете - планета, посылаемая с запросом, должна быть одной из 8 планет списка.
    //если нет, выкидываем ошибку (класс Error встроен в Node.js)
    if (!planet) {//блок валидации переместили в эту ф-ю из saveLaunch(), т.к. данная валидация уместна при добавлении launch из фронтенда, а не из API SpaceX
        throw new Error('No matching planet found');
    }

    console.log(planet);
    const nextFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {//1 аргумент - сам объект, который будем менять, второй - непосредственное изменение полей
        success: true,
        upcoming: true,
        customer: ['Filipopov', 'Natashka'],
        flightNumber: nextFlightNumber,
    });
    await saveLaunch(newLaunch);//Вызываем ф-ю сохранения запуска в БД. Причем сторим в БД модифицированный объект (часть получили из запроса).

}



//function isLaunch(launchID) {
//    return launches.has(launchID);
//}
//
//function addNewLaunch(launch) {
//latestFlightNumber++;
//launches.set(latestFlightNumber, Object.assign(launch, { //назначить допольнительные свойства поступившему launch
// success: true,
// upcoming: true,
//customers: ['Filka', 'Popov'],
//flightNumber: latestFlightNumber,
// }));
//}

function abortLaunchById(launchID) {
    const aborted = launchesDB.updateOne({// 1 арг - находим по свойству, 2 арг - что меняем, третий - upsert: true (вставить, если отсутствует)
        //но мы знаем точно, что документ есть, т.к. abortLaunchById() будем использовать в http-функции в контроллере вместе с 
        //функцией-валидатором existLaunchWithId(). Поэтому upsert: true здесь нам не нужен

        flightNumber: launchID,
    },
        {
            upcoming: false,
            success: false
        });
    return aborted;
    // const abortedLaunch = launches.get(launchID);
    //abortedLaunch.upcoming = false;
    //abortedLaunch.success = false;
    //return abortedLaunch;
}

async function saveLaunch(launch) {

    //findOneAndUpdate() - альтернатива updateOne(), но НЕ возвращает дополнительное поле setOnInsert с версией объекта (безопасность)
    await launchesDB.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });

}



module.exports = {
    loadLaunchData,
    existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
}