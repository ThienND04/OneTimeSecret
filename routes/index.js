const secretRoutes = require('./secretRoutes');

function Route(app) {
    app.use('/api/secret', secretRoutes);
}

module.exports = Route;
