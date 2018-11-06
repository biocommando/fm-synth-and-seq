
const security = require('./security');
// Sessions are supposed to be pretty much single-use sessions
let sessions = [];

const createSession = () => {
    const token = security.createSecureToken();
    const session = { token, lastUpdated: Date.now() };
    sessions.push(session);
    return session;
};

const getSession = token => sessions.find(session => session.token === token);

const invalidateSession = token => {
    const found = getSession(token);
    if (found) {
        found.lastUpdated = Date.now();
    }
    return !!found;
};

const endSession = userName => {
    const lengthBefore = sessions.length;
    sessions = sessions.filter(session => !session.user || session.user.name !== userName);
    return lengthBefore > sessions.length;
}

setInterval(() => {
    const expireSince = Date.now() - 60000;
    const sessionCount = sessions.length;
    sessions = sessions.filter(session => session.lastUpdated > expireSince);
    console.log(`expired ${sessionCount - sessions.length} old sessions`);
}, 5 * 60000);


const handleRequest = (handlers, url, method, data, res, dataSizeLimit = 1e6) => {
    const getQueryParams = () => {
        return Array
            .from(new URL(`origin://host${url}`).searchParams.entries())
            .map(sp => ({ [sp[0]]: sp[1] }))
            .reduce((a, b) => ({ ...a, ...b }), {});
    };
    console.log('requesting', method, url);
    const authenticatedUser = session => {
        if (session) session.lastUpdated = Date.now();
        console.log('found session', session);
        return session && session.user ? session.user : undefined;
    };
    const respond = (result, code = 200) => {
        res.writeHead(code, { 'Content-Type': 'text/json' });
        res.end(JSON.stringify({ ...result, success: code === 200 }));
    };
    try {
        const endpoint = url.split('?')[0];
        const handler = handlers.find(h => h.method === method && h.endpoint === endpoint);
        if (handler) {
            if (data !== undefined) {
                if (data.length > dataSizeLimit) {
                    throw 'too much data';
                }
                data = JSON.parse(data);
            } else {
                data = getQueryParams();
            }
            const loggableData = {...data};
            if (loggableData.pass) {
                loggableData.pass = '********';
            }
            console.log('parsed payload', loggableData);

            let user;
            if (!handler.anonymous) {
                const session = sessions.find(session => session.token === data.token);
                if (!session) {
                    return respond({ code: 'INVALID_SESSION', message: 'Invalid session.' }, 401);
                }
                if (!handler.unauthenticated) {
                    user = authenticatedUser(session);
                    if (!user) {
                        return respond({ code: 'UNAUTHENTICATED', message: 'Unauthenticated.' }, 401);
                    }
                }
            }
            return handler.callback(respond, data, user);
        }
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - Not found</h1><p>The server cannot respond to a ${method.bold()} request to ${url.bold()}.</p>`);
    }
    catch (e) {
        console.log(e);
        res.writeHead(500, { 'Content-Type': 'text/json' });
        res.end(JSON.stringify({ code: 'SERVER_ERROR', message: 'Server error or malformed request.' }));
    }
};

module.exports = {
    handleRequest,
    createSession,
    getSession,
    endSession,
    invalidateSession
}
