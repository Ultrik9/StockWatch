require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const initializeRoutes = require("./routes");
const cookieFingerprint = require('./middleware/swuid');
const customHeaders = require('./middleware/custom-headers');
const schedule = require('node-schedule');

const tasks = require('./tasks/finnhub');

const dbConnect = require('./db/connect');

dbConnect().then(() => {


    if (cluster.isMaster) {

        console.log('numCPUs: ', numCPUs)

        for (let i = 0; i < numCPUs; i++) {
            cluster.schedulingPolicy = cluster.SCHED_NONE;
            cluster.fork();
        }

        cluster.on('exit', (worker) => {
            console.log(`Worker ${worker.id} died`);
            cluster.fork();
        });

        const prices = schedule.scheduleJob('*/3 * * * *', () => tasks.finnhubPrices());
        const candles = schedule.scheduleJob('*/15 * * * *', () => tasks.finnhubCandles());

    } else {

        const app = express();

        const port = process.env.PORT || '3000';


        app.use((req, res, next) => {
            if (req.header('x-forwarded-proto') !== 'https')
                res.redirect(`https://${req.header('host')}${req.url}`);
            else
                next();
        });

        app.set('views', path.join(__dirname, 'routes', 'pages', 'views'));
        app.set('view engine', 'pug');

        //app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

        app.use(logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(cookieFingerprint());
        app.use(customHeaders());

        const staticPath = path.join(__dirname, '..', 'public');


        app.use(express.static(staticPath));


        initializeRoutes(app);

        const onError = (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        const onListening = () => {
            console.log('Listening on port', port);
        }

        const server = http.createServer(app);

        server.on('error', onError);
        server.on('listening', onListening);

        server.listen(port);

    }

}, (err) => {
    console.log('DB connection error');
})




















