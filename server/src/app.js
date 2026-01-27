const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const swaggerUi = require('swagger-ui-express');
const rateLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const {logger} = require('./config/logger');
const morgan = require('morgan');

const app = express();

console.log('Environment:', config.env);
if (config.env !== 'production') {
    app.use(morgan('short', { stream: logger.stream }));
}
app.use(cors());

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (config.env === 'production') {
    app.use(rateLimiter);
}

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;