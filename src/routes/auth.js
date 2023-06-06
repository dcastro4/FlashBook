const express = require('express');
const validator = require('../lib/validator');
const router = express.Router();
const helpers = require('../lib/helpers');

const db = require('../database');
const { route } = require('./books');

router.get('/login', (req, res) => {
    if (req.session.isLoggedIn == true) {
        res.redirect('/');
    } else {
        res.render('./auth/login', {userType: req.session.role});
    }
});

router.post('/login', async (req, res) => {
    const user = req.body;
    const role = await validator.isLoginOk(user);

    if (role != undefined) {
        if (role == '') { // INVALID PASSWORD
            res.redirect('/login');
        } else { // OK
            req.session.user = user.username;
            req.session.password = user.password;
            req.session.isLoggedIn = true;
            req.session.role = role;

            if (req.session.role == 'user') { res.redirect('/books'); }
            if (req.session.role == 'admin') { res.redirect('/admin/dashboard'); }
            if (req.session.role == 'root') { res.redirect('/root/dashboard'); }
        }
    } else { // USERNAME DOESN'T EXIST
        console.log('User doesn\'t exist');
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.get('/signup', (req, res) => {
    if (req.session.isLoggedIn == true) {
        res.redirect('/');
    } else {
        res.render('./auth/signup', {userType: req.session.role});
    }
});

router.post('/signup', async (req, res) => {
    
    const roots = await db.query('SELECT * FROM root WHERE root = ?', [req.body.user]);
    const admins = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.body.user]);
    const users = await db.query('SELECT * FROM user WHERE user = ?', [req.body.user]);

    if (roots.length == 0 && admins.length == 0 && users.length == 0) {
        req.body.password = await helpers.encrypt(req.body.password);
        await db.query('INSERT INTO user SET ?', [req.body]);
        res.redirect('/login');
    } else { // USERNAME ALREADY EXISTS
        res.redirect('/signup');
    }
});

router.get('/profile', async (req, res) => {
    if (req.session.isLoggedIn == true) {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);
        var users;
        if (req.session.role == 'root') { users = await db.query('SELECT * FROM root WHERE root = ?', [req.session.user]); }
        if (req.session.role == 'admin') { users = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.session.user]); }
        if (req.session.role == 'user') { users = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]); }
        // console.log(req.session.role, users);
        res.render('./auth/profile', {user: users[0], userType: req.session.role, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.redirect('/login');
    }
});

router.post('/profile/changePassword', async (req, res) => {
    const old_password = req.body.current_password;
    var new_password = req.body.new_password;    

    if (req.session.isLoggedIn == true) {
        var users;
        if (req.session.role == 'root') { users = await db.query('SELECT * FROM root WHERE root = ?', [req.session.user]); }
        if (req.session.role == 'admin') { users = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.session.user]); }
        if (req.session.role == 'user') { users = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]); }
        const user = users[0];
        console.log(user);
        if (users.length > 0) {
            const compare = await helpers.compare(old_password, user.password);
            if (compare == true) {
                new_password = await helpers.encrypt(new_password);
                if (req.session.role == 'root') { await db.query('UPDATE root SET ? WHERE root = ?', [{password: new_password}, req.session.user]); }
                if (req.session.role == 'admin') { await db.query('UPDATE administrator SET ? WHERE admin = ?', [{password: new_password}, req.session.user]); }
                if (req.session.role == 'user') { await db.query('UPDATE user SET ? WHERE user = ?', [{password: new_password}, req.session.user]); }
                
                req.session.destroy();
                res.redirect('/login');
            } else {
                res.redirect('/profile');
            }
        } else {
            res.redirect('/logout');
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/profile/edit', async (req, res) => {
    if (req.session.isLoggedIn == true) {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);
        if (req.session.role != 'root') {
            var users;
            if (req.session.role == 'admin') { users = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.session.user]); }
            if (req.session.role == 'user') { users = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]); }
            const user = users[0];
            if (users.length > 0) {
                const currentDate = user.date_birth;
                const formattedDate = currentDate.toISOString().split('T')[0];
                user.date_birth = formattedDate;
                res.render('./auth/editProfile', {userType: req.session.role, user: user, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
            } else {
                res.redirect('/logout');
            }
        } else {
            res.redirect('/profile');
        }
    } else {
        res.redirect('/login');
    }
});

router.post('/profile/edit', async (req, res) => {
    if (req.session.isLoggedIn == true) {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);
        if (req.session.role != 'root') {
            var users;
            if (req.session.role == 'admin') {
                if (req.session.user != req.body.admin) {
                    users = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.body.admin]);
                    if (users.length == 0) {
                        users = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.session.user]);
                        const password = users[0].password; // DON'T CHANGE THE PASSWORD
                        req.body.password = password;
                        await db.query('UPDATE administrator SET ? WHERE admin = ?', [req.body, req.session.user]);
                        req.session.user = req.body.admin;
                        res.redirect('/profile');
                    } else {
                        res.render('./auth/editProfile', {userType: req.session.role, user: user, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
                    }
                } else {
                    users = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.session.user]);
                    const password = users[0].password; // DON'T CHANGE THE PASSWORD
                    req.body.password = password;
                    await db.query('UPDATE administrator SET ? WHERE admin = ?', [req.body, req.session.user]);
                    req.session.user = req.body.user;
                    res.redirect('/profile');
                }
            }
            if (req.session.role == 'user') {
                if (req.session.user != req.body.user) {
                    users = await db.query('SELECT * FROM user WHERE user = ?', [req.body.user]);
                    if (users.length == 0) {
                        users = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]);
                        const password = users[0].password; // DON'T CHANGE THE PASSWORD
                        req.body.password = password;
                        await db.query('UPDATE user SET ? WHERE user = ?', [req.body, req.session.user]);
                        res.redirect('/profile');
                    } else {
                        res.render('./auth/editProfile', {userType: req.session.role, user: user, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
                    }
                } else {
                    users = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]);
                    const password = users[0].password; // DON'T CHANGE THE PASSWORD
                    req.body.password = password;
                    await db.query('UPDATE user SET ? WHERE user = ?', [req.body, req.session.user]);
                    res.redirect('/profile');
                }
            }
        } else {
            res.redirect('/profile');
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;