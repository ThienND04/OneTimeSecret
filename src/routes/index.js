const express = require('express');
const { api } = require('../config/cloudinary');
const secretRoute = require('./secretRoute');
const authRoute = require('./authRoute');

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/secret',
        route: secretRoute,
    },
]

const devRoutes = [
    {
        path: '/docs',
        route: require('./docsRoute'),
    }
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

if (process.env.NODE_ENV === 'dev') {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route);
    });
}

module.exports = router;