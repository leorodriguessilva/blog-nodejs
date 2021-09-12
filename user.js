'use strict';

const Bcrypt = require('bcrypt');
const { db } = require('./db.js');

const SALT_ROUNDS = 10;

const createUserRoutes = () => {
    return [
        {
            method: 'POST',
            path: '/signin',
            handler: async (request, h) => {
                try {
                    const auth = await validateUserCredentials(request)
                    return h.response(auth).code(200);
                } catch(ex) {
                    console.log(ex);
                    return h.response().code(500);
                }
            }
        }, {
            method: 'POST',
            path: '/signup',
            handler: async (request, h) => {
                validateUserProps(request.payload)
                db.serialize(async () => {
                    const stmt = db.prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)", (_, err) => {
                        if(err) console.log(err);
                    });
                    const hashPass = await Bcrypt.hash(request.payload.password, SALT_ROUNDS);
                    stmt.run(request.payload.username, hashPass, Date.now());
                    stmt.finalize();
                });
                return h.response().code(201);
            }
        }
    ];
}

const validateUserProps = (user) => {
    if(!user.username) {
        throw Error("Username is empty");
    }
    if(!user.password) {
        throw Error("Password is empty");
    }
}

const validateUserCredentials = async (request) => {
    const user = request.payload;
    validateUserProps(user);
    console.log(request.payload);
    var userFound = {};
    db.get(
        "SELECT id, username, password, created_at FROM users WHERE username = (?)", 
        user.username, 
        async (err, row) => {
            if(err) console.log(err);
            else {
                console.log(row);
                Bcrypt.compare(user.password, row.password, (err, same) => {
                    if(same) userFound = row;
                });
            }
        }
    );
    console.log(userFound);
    const isValid = userFound === true;
    return { isValid, userFound };
}

module.exports = { createUserRoutes, validateUserCredentials };