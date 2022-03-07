const mongoose = require("mongoose");


const dbConnect = () => {

    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to ' + process.env.DBURI);
    });

    mongoose.connection.on('error', (err) => {
        console.log('Mongoose connection error: ' + err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected');
    });

    return mongoose.connect(process.env.DBURI);

}

module.exports = dbConnect;