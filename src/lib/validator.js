const db = require('../database');
const helpers = require('../lib/helpers');

const helper = {}
helper.isLoginOk = async (user) => { // BUSCA EL USUARIO Y DEVUELVE ROOT O ADMIN O USER O UNDEFINEDz
    var users = await db.query('SELECT * FROM root WHERE root = ?', [user.username]);
    if (users.length > 0) {
        const person = users[0];
        const password_compare = await helpers.compare(user.password, person.password);
        if (password_compare == true) {
            return 'root';
        }
        return '';
    }

    users = await db.query('SELECT * FROM administrator WHERE admin = ?', [user.username]);
    if (users.length > 0) {
        const person = users[0];
        const password_compare = await helpers.compare(user.password, person.password);
        if (password_compare == true) {
            return 'admin';
        }
        return '';
    }

    users = await db.query('SELECT * FROM user WHERE user = ?', [user.username]);
    if (users.length > 0) {
        const person = users[0];
        const password_compare = await helpers.compare(user.password, person.password);
        if (password_compare == true) {
            return 'user';
        }
        return '';
    }
};

helper.isAdminOk = async (admin) => {
    var roots = await db.query('SELECT * FROM root WHERE root = ?', [admin.username]);
    var admins = await db.query('SELECT * FROM administrator WHERE admin = ?', [admin.username]);
    var users = await db.query('SELECT * FROM user WHERE user = ?', [admin.username]);

    if (roots.length > 0 || admins.length > 0 || users.length > 0) {
        return 'admin-name already taken';
    }
    if (admin.admin.replace(' ', '') == '') {
        return 'admin-name should contain something';
    }
    if (admin.password.length < 6) {
        return 'password too short';
    }
    if (admin.DNI) {
        return 'DNI invalid';
    }
    if (admin.first_name.replace(' ', '') == '') {
        return 'first-name should not contain spaces';
    }
    if (admin.last_name.replace(' ', '') == '') {
        return 'last-name should contain something';
    }
    if (admin.place_birth.replace(' ', '') == '') {
        return 'place-of-birth should contain something';
    }
    if (admin.address.replace(' ', '') == '') {
        return 'address should contain something';
    }
    return true;
};

module.exports = helper;