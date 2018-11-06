// Super simple data storing server with authentication and user management
const serveStatic = require('serve-static');
const connect = require('connect');
const db = require('./data-store-db');
const sessionHandler = require('./session-handler');
const security = require('./security');
const config = require('./server-config').config;

db.connect();

setInterval(() => {
    if(db.persist()) {
        console.log('database persisted');
    }
}, 60000);

const handlers = [
    {
        method: 'GET',
        endpoint: '/session',
        anonymous: true,
        callback: (respond, requestData) => {
            let token;
            let authenticated = false;
            let code;
            if (requestData && sessionHandler.invalidateSession(requestData.token)) {
                token = requestData.token;
                authenticated = !!sessionHandler.getSession(token).user;
                code = 'TOKEN_INVALIDATED';
                console.log('Invalidated existing session', token);
            } else {
                token = sessionHandler.createSession().token;
                code = 'TOKEN_CREATED';
                console.log('registered new session', token);
            }
            respond({ code, token, authenticated });
        }
    },
    {
        method: 'GET',
        endpoint: '/share',
        anonymous: true,
        callback: (respond, requestData) => {
            const data = db.getSharedData(requestData.shareToken);
            if (data) {
                respond({
                    code: 'DATA_OK',
                    data: data.object,
                    name: data.name,
                    owner: data.owner
                });
            } else {
                respond({ code: 'DATA_NOT_FOUND', message: 'Shared data not found.' }, 404);
            }
        }
    },
    {
        method: 'GET',
        endpoint: '/directory',
        callback: (respond, requestData, user) => {
            respond({
                code: 'DIRECTORY_OK',
                data: db.getDataList(user),
                success: true
            });
        }
    },
    {
        method: 'GET',
        endpoint: '/data',
        callback: (respond, requestData, user) => {
            respond({
                code: 'DATA_OK',
                data: db.getData(user, requestData.id).object,
                success: true
            });
        }
    },
    {
        method: 'GET',
        endpoint: '/data',
        callback: (respond, requestData, user) => {
            respond({
                code: 'DATA_OK',
                data: db.getData(user, requestData.id).object,
                success: true
            });
        }
    },
    {
        method: 'POST',
        endpoint: '/register',
        unauthenticated: true,
        callback: (respond, requestData) => {
            const userInfo = requestData;
            const user = db.getUser(userInfo.user);
            if (user) {
                respond({ code: 'USERNAME_TAKEN', message: 'User name already taken.' }, 409);
            } else if (userInfo.user.length < 4 || userInfo.user.length > 32 || userInfo.user.match(/[^a-zA-Z_\d]/)) {
                respond({
                    code: 'INVALID_USERNAME',
                    message: 'Username must have 4 to 32 characters and contain no special characters.'
                }, 400);
            } else if (userInfo.pass.length < 8) {
                respond({ code: 'INVALID_PASSWORD', message: 'Password must be at least 8 characters long' }, 400);
            } else {
                const session = sessionHandler.getSession(userInfo.token);
                session.user = {
                    name: userInfo.user,
                    pass: security.hash(userInfo.pass)
                };
                db.createUser(session.user.name, session.user.pass, config.limits.users);
                respond({ code: 'USER_CREATED' });
            }
        }
    },
    {
        method: 'POST',
        endpoint: '/login',
        unauthenticated: true,
        callback: (respond, requestData) => {
            const loginInfo = requestData;
            const pass = security.hash(loginInfo.pass);
            const user = db.getUser(loginInfo.user);
            if (user && user.pass === pass) {
                const session = sessionHandler.getSession(loginInfo.token);
                session.user = user;
                respond({ code: 'LOGIN_OK' });
            } else {
                respond({ code: 'LOGIN_FAILED', message: 'Username or password wrong.' }, 403);
            }
        }
    },
    {
        method: 'POST',
        endpoint: '/data',
        callback: (respond, requestData, user) => {
            const success = db.setData(user, requestData.id, requestData, config.limits.files);
            if (success) {
                if (requestData.id !== undefined) {
                    respond({ code: 'DATA_SAVED' });
                } else {
                    respond({ code: 'DATA_UPDATED' });
                }
            } else {
                respond({ code: 'SAVING_DATA_FAILED', message: 'Saving data failed.' }, 500);
            }
        }
    },
    {
        method: 'POST',
        endpoint: '/delete',
        callback: (respond, requestData, user) => {
            const success = db.deleteData(user, requestData.id);
            if (success) {
                respond({ code: 'DATA_DELETED' });
            } else {
                respond({ code: 'DELETE_FAILED', message: 'Deleting data failed.' }, 500);
            }
        }
    },
    {
        method: 'POST',
        endpoint: '/logout',
        callback: (respond, requestData, user) => {
            if (sessionHandler.endSession(user.name)) {
                respond({ code: 'LOGGED_OUT' });
            } else {
                respond({ code: 'LOGOUT_FAILED', message: 'Logout failed for an unknown reason.' }, 500);
            }
        }
    },
    {
        method: 'POST',
        endpoint: '/share',
        callback: (respond, requestData, user) => {
            const failResp = () => respond({ code: 'SHARE_TOKEN_CREATE_FAILED', message: 'Unable to create share token.' }, 500);
            const foundData = db.getData(user, requestData.id);
            let shareToken;
            if (foundData) {
                shareToken = foundData.shareToken;
                if (!shareToken) {
                    shareToken = security.createSecureToken() + '_by_' + user.name;
                    const success = db.setData(user, requestData.id, { shareToken });
                    if (!success) {
                        return failResp();
                    }
                }
                respond({ code: 'SHARE_TOKEN_CREATED', shareToken });
            }
            failResp();
        }
    }
];

connect()
    .use(serveStatic(__dirname + config.pathToStaticFiles, { extensions: ['html', 'js', 'css', 'png'] }))
    .use('/', (req, res) => {
        const url = req.url;
        const method = req.method;
        let body;
        req.on('data', data => body = (body === undefined ? '' : body) + data);
        req.on('end', () =>
            sessionHandler.handleRequest(handlers, url, method, body, res, config.limits.dataSize));
    }).listen(config.port);
console.log('listening on port ' + config.port);
