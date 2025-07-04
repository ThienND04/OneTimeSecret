require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const Route = require('./routes/index');

const PORT = process.env.PORT || 3000;

db.connect();

const app = express();
app.use(morgan('combined'));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

Route(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
