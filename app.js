require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const Route = require('./routes/index');
const swaggerDocument = require('./swagger');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(morgan('combined'));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

Route(app);

module.exports = app;