function sendSuccessResponse(req, res, httpCode, data, message) {
    data = data || {}
    httpCode = httpCode || 200
    let responseData = {};
    responseData.statusCode = httpCode;
    responseData.message = message;
    responseData.data = data;
    res.status(httpCode).send(responseData);
}

function sendFailResponse(req, res, httpCode, message) {
    httpCode = httpCode || 400
    let responseData = {};
    responseData.statusCode = httpCode;
    responseData.message = message;
    res.status(httpCode).send(responseData);
}


module.exports = {
    sendSuccessResponse,
    sendFailResponse
}