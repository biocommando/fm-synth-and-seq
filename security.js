
const crypto = require('crypto');

const hash = value => {
    const hasher = crypto.createHash('sha512');
    hasher.update(value);
    return hasher.digest('hex');
}

const createSecureToken = () => {
    const buf = Buffer.alloc(32);
    return crypto.randomFillSync(buf).toString('hex');
};

module.exports = {
    hash,
    createSecureToken
};
