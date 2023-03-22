const mongoose = require('mongoose');

const launchSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: false,
    },
    target: {
        type: String,
    //убрали обязательность поля, т.к. с API SpaceX получаем данные без планет
    },
    launchDate: {
        type: Date,
        required: true,
    },
    customer: {
        type: [String],
        required: true,
    },
    upcoming: {
        type: Boolean,
        required: true,
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    }
});
// 1-й аргумент - название коллекции, которую представляет эта модель
 module.exports = mongoose.model('Launch', launchSchema);