const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0; //limit = 0 - все документы будут возвращены на одной странице

function getPagination(query) {
    //Math.abs() возвращает АБСОЛЮТНОЕ значение числа. Т.е. если положительное, то вернет положительное, если отрицательное - вернет положительное
    //если строка - конвертирует в Number
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER; //DEFAULT_PAGE_LIMIT и DEFAULT_PAGE_NUMBER - значения по умолчанию
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT; //page и limit - ключи объекта {} req.query, где значения - строки вида "50", "3" и тд.
    const skip = (page-1)*limit;
    return {
        skip, //skip:skip, limit: limit
        limit,
    }
}

module.exports = {
    getPagination,
};