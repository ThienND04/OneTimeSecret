require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Route = require('./routes/index');
const swaggerDocument = require('./swagger');
const swaggerUi = require('swagger-ui-express');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();
if (process.env.NODE_ENV !== 'production') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}
app.use(cors());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(rateLimiter);

Route(app);

module.exports = app;