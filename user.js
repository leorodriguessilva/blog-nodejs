'use strict';

const Bcrypt = require('bcrypt');
const { func } = require('joi');
const { db } = require('./db.js');

const SALT_ROUNDS = 10;

const createUserRoutes = () => {
    return [
        {
            method: 'POST',
            path: '/signin',
            handler: async (request, h) => {
                return await validateUserCredentials(request).then((auth) => {
                    return h.response(auth).code(200);
                }).catch((err) => {
                    return h.response(err).code(500);
                });
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
    return new Promise((resolve, reject) => { 
        db.get(
            "SELECT id, username, password, created_at FROM users WHERE username = (?)", 
            user.username,
            (err, row) => {
                if(err) { 
                    reject(err);
                }
                if(Bcrypt.compareSync(user.password, row.password)) {
                    const isValid = row ? true : false;
                    resolve(
                        {
                            isValid,
                            userFound: {
                                id: row.id,
                                username: row.username,
                                created_at: row.created_at
                            }
                        }
                    );
                }
            }
        )
    });
}

module.exports = { createUserRoutes, validateUserCredentials };