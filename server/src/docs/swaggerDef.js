const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
    openapi: '3.0.0',
    info: {
        title: 'OneTimeSecret API',
        version,
        description:
            'Secure one-time secret sharing API with optional authentication, file attachments, and expiration management',
        license: {
            name: 'MIT'
        }
    },
    servers: [
        {
            url: `http://localhost:${config.port}/api`,
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string'
                    },
                    userName: {
                        type: 'string'
                    },
                    email: {
                        type: 'string',
                        format: 'email'
                    },
                    gender: {
                        type: 'string',
                        enum: ['male', 'female', 'helicopter']
                    }
                }
            },
            Token: {
                type: 'object',
                properties: {
                    token: {
                        type: 'string'
                    },
                    expires: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    code: {
                        type: 'integer'
                    },
                    message: {
                        type: 'string'
                    }
                }
            }
        },
        responses: {
            Unauthorized: {
                description:
                    'Unauthorized - Invalid or missing authentication token',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            }
        }
    }
};

module.exports = swaggerDef;
