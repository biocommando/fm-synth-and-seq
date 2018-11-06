// This is supposed to be a self-contained object for using the data store service

const createId = (id, idMap) => {
    const htmlId = `dataStoreServerApi_${id}_${Date.now().toString(31)}`;
    idMap[id] = () => document.getElementById(htmlId);
    return htmlId;
}
let container = {};
document.body.innerHTML += `<div id=${createId('container', container)}></div>`;
container = container.container;

let user;
let pass;
let token;

const request = (method, url, body, onReady, onError) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                onReady && onReady(JSON.parse(xhttp.responseText));
            } else {
                onError && onError(this.status, JSON.parse(xhttp.responseText))
            }
        }
    };
    xhttp.timeout = 1000;
    if (method === 'GET') {
        xhttp.open("GET", url + (body ? '?' + Object.keys(body).map(key => key + '=' + body[key]).join('&') : ''), true);
        xhttp.send();
    } else {
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(body));
    }
}

const showMsgOnError = (code, data) => alert(data.message);

const login = onReady => {
    container().childElementCount === 0 && request('GET', '/session', { token }, data => {
        token = data.token;
        if (data.authenticated) {
            return onReady();
        }
        if (user === undefined) {
            const idMap = {};
            container().innerHTML += `
                <div id="${createId('modal', idMap)}" style="${['min-height: 140px;',
                    'min-width: 400px;',
                    'background-color: white;',
                    'border: 3px dotted black;',
                    'padding: 20px;',
                    'font-size: 18px;',
                    'position: fixed;',
                    'margin-top: -70px;',
                    'margin-left: -200px;',
                    'top: 50%;',
                    'left: 50%;',].join('')}">
                    <div id="${createId('error', idMap)}" style="color:red;white-space:wrap;"></div>
                    <div style="font-weight:bold">Login to service</div>
                    <div style="margin:10px">
                        User name <input id="${createId('userName', idMap)}"/>
                    </div>
                    <div style="margin:10px">
                        Password <input type="password" id="${createId('password', idMap)}"/>
                    </div>
                    <div style="margin:10px">
                        <button id="${createId('login', idMap)}">Login</button> | <button id="${createId('signup', idMap)}">Signup</button>
						| <button id="${createId('cancel', idMap)}">Cancel</button>
                    </div>
                </div>
                `;
            const click = (url) => {
                return () => {
                    const inputUser = idMap.userName().value;
                    const inputPass = idMap.password().value;
                    request('POST', url, { user: inputUser, pass: inputPass, token }, () => {
                        user = inputUser;
                        pass = inputPass;
                        onReady();
                        idMap.modal().remove();
                    }, (code, data) => idMap.error().innerText = 'Error: ' + data.message);
                }
            }
            idMap.userName().focus();
            idMap.password().onkeypress = (e) => {
                if(e.key === 'Enter') {
                    click('/login')();
                }
                return true;
            };
            idMap.login().onclick = click('/login');
            idMap.signup().onclick = click('/register');
            idMap.cancel().onclick = () => idMap.modal().remove();
        } else {
            request('POST', '/login', { user, pass, token }, onReady, err => {
                showMsgOnError(err);
                user = undefined;
                login(onReady);
            });
        }
    });
};

const logout = (onReady) => data => {
    request('POST', '/logout', { token });
    onReady(data);
};

const getDirectory = onReady => {
    login(() => {
        request('GET', '/directory', { token }, onReady, showMsgOnError);
    });
};

const setData = (id, data, onReady) => {
    login(() => {
        request('POST', '/data', { token, id, ...data }, onReady, showMsgOnError);
    });
};

const getData = (id, onReady) => {
    login(() => {
        request('GET', '/data', { token, id }, onReady, showMsgOnError);
    });
};

const deleteData = (id, onReady) => {
    login(() => {
        request('POST', '/delete', { token, id }, onReady, showMsgOnError);
    });
};

const createShareToken = (id, onReady) => {
    login(() => {
        request('POST', '/share', { token, id }, onReady, showMsgOnError);
    });
};

const getSharedData = (shareToken, onReady) => {
    request('GET', '/share', { shareToken }, onReady, showMsgOnError);
};

module.exports = {
    getDirectory,
    setData,
    getData,
    deleteData,
    createShareToken,
    getSharedData
};
