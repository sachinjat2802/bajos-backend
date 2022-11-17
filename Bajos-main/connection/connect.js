const mongoose = require("mongoose");
const mongo_url = process.env.MONGO_URI


var mongoDbconnection = async function () {
    mongoose.connect(mongo_url, { useUnifiedTopology: true, useNewUrlParser: true })
};


mongoose.connection.on('connected', () => {
    console.log('Mongo has connected succesfully !!!')
})
mongoose.connection.on('reconnected', () => {
    console.log('Mongo has reconnected !!!')
})
mongoose.connection.on('error', error => {
    console.log('Mongo connection has an error !!', error)
    mongoose.disconnect()
})
mongoose.connection.on('disconnected', () => {
    console.log('Mongo connection is disconnected !!')
})


module.exports = {
    mongoDbconnection: mongoDbconnection
};