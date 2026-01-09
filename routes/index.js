const { api } = require('../config/cloudinary');
const secretRoute = require('./secretRoute');
const authRoute = require('./authRoute');

function Route(app) {
    app.use('/api/secret', secretRoute);
    app.use('/api/auth', authRoute);
}

module.exports = Route;
