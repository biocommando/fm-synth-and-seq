const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})
client.connect()
//client.query('CREATE TABLE fm_seq.data ( id bigint, data text )')
//client.query('CREATE SCHEMA fm_seq')
//client.query('insert into fm_seq.data (id, data) values (1, \'{"users":[],"data":[]}\')')


let database;
let receivedUpdates = false;

const connect = () => {
    client.query('select * from fm_seq.data where id = 1').then((res) => {
        database = JSON.parse(res.rows[0].data);
    });
};

const persist = () => {
    if (receivedUpdates) {
        client.query('update fm_seq.data set data = $1', [JSON.stringify(database)]);
        receivedUpdates = false;
        return true;
    }
    return false;
};

const getUser = (userName) => {
    let user;
    user = database.users.find(user => user.name === userName);
    user && (user.lastAccessed = Date.now());
    return user ? { ...user } : undefined;
};

const createUser = (userName, password, userCountLimit = 1000) => {
    if (database.users.length >= userCountLimit) {
        throw "cannot add more users";
    }
    if (!getUser(userName)) {
        database.users.push({
            name: userName,
            pass: password,
            created: Date.now(),
            lastAccessed: Date.now()
        });
        receivedUpdates = true;
    }
}

const getData = (user, id) => {
    const found = database.data.find(d => d.owner === user.name && d.id === id);
    return found ? { name: found.name, object: found.object, modified: found.modified } : undefined;
};

const getDataList = user => {
    return database.data.filter(d => d.owner === user.name).map(found => ({ name: found.name, id: found.id, modified: found.modified }));
}

const setData = (user, id, data, fileLimit = 1000) => {
    if (!id) {
        if (!getUser(user.name)) {
            console.log('saving failed because username ' + user.name + ' not found');
            return false;
        }
        if (getDataList(user).length >= fileLimit) {
            console.log('saving failed because file limit reached');
            return false;
        }

        id = '$' + database.data.length; // $ is just to make it obvious that id's are strings
        database.data.push({
            owner: user.name,
            created: Date.now(),
            modified: Date.now(),
            ...data,
            id
        });
        receivedUpdates = true;
        return true;
    }
    const found = database.data.find(d => d.owner === user.name && d.id === id);
    if (found) {
        Object.keys(data).forEach(key => key !== 'id' && (found[key] = data[key]));
        found.modified = Date.now();
        receivedUpdates = true;
    }
    return !!found;
};

const deleteData = (user, id) => {
    if (getData(user, id)) {
        database.data = database.data.filter(d => d.id !== id);
        receivedUpdates = true;
        return true;
    }
    return false;
}

const getSharedData = shareToken => {
    const found = database.data.find(d => d.shareToken && d.shareToken === shareToken);
    return found ? { name: found.name, object: found.object, owner: found.owner, modified: found.modified } : undefined;
}

module.exports = {
    connect,
    persist,
    getUser,
    createUser,
    getDataList,
    getData,
    setData,
    deleteData,
    getSharedData
};
