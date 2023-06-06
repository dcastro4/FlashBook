const bcrypt = require('bcryptjs');
const helpers = {};

helpers.encrypt = async (plain_text) => {
    const salt = await bcrypt.genSalt(10);
    const hashed_text = await bcrypt.hash(plain_text, salt);
    return hashed_text;
};

helpers.compare = async (plain_text, hashed_text) => {
    return await bcrypt.compare(plain_text, hashed_text);
};

module.exports = helpers