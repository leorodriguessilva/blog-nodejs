'use strict';

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

const createPostRoutes = () => {
    return [
        {
            method: 'GET',
            path: '/posts',
            handler: (request, h) => {
                return h.response(['Post1', 'Post2', 'Post3']).code(200);
            },
            options: { auth: 'simple' }
        }, {
            method: 'GET',
            path: '/posts/{id}',
            handler: (request, h) => {
                return h.response(['Post1', 'Post2', 'Post3']).code(200);
            },
            options: { auth: 'simple' }
        }, {
            method: 'POST',
            path: '/posts',
            handler: (request, h) => {
                const post = {
                    'id': 1,
                    'post': request.payload.post,
                    'date': Date.now()
                };
                return h.response(post).code(201);
            },
            options: { auth: 'simple' }
        }
    ];    
}

module.exports = { createPostRoutes };