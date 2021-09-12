'use strict';

const Hapi = require('@hapi/hapi');
const Basic = require('@hapi/basic');
const { createTables } = require('./db.js');
const { createPostRoutes } = require('./post.js');
const { createUserRoutes, validateUserCredentials } = require('./user.js');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    await server.register(Basic);

    server.auth.strategy('simple', 'basic', { 'validate': validateUserCredentials });

    createTables();

    await server.start();
    console.log('Server running on %s', server.info.uri);
    server.route(
        [
            ...createPostRoutes(),
            ...createUserRoutes()
        ]
    );
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();