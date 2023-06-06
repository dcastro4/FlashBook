const express = require('express');
const router = express.Router();
const path = require('path');
const helpers = require(path.join(__dirname, '..', '..', 'lib', 'helpers'));
const validator = require(path.join(__dirname, '..', '..', 'lib', 'validator'));

const db = require(path.join(__dirname, '..', '..', 'database'));

router.get('/card', async (req, res) => {
    if (req.session.role == 'user') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);

        const username = req.session.user;
        const user_card = await db.query('SELECT * FROM depositor WHERE user = ?', [username]);
        const user = await db.query('SELECT * FROM user WHERE user = ?', [username]);
        var card;
        if (user_card.length > 0) {
            card = await db.query('SELECT * FROM card WHERE number = ?', [user_card[0].card_number]);
            card = card[0];
        }

        res.render('./user/card', {card: card, userType: 'user', cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0], user: user[0]});
    } else {
        res.redirect('/profile');
    }
});

router.post('/card/add', async (req, res) => {
    if (req.session.role == 'user') {
        const card = req.body;
        const cards = await db.query('SELECT * FROM card WHERE number = ?', [card.number]);
        if (cards.length == 0) {
            await db.query('INSERT INTO card SET ?', [card]);
            await db.query('INSERT INTO depositor SET ?', [{'user': req.session.user, 'card_number': card.number}]);
            res.redirect('/user/card');
        } else {
            const username = req.session.user;
            const user = await db.query('SELECT * FROM user WHERE user = ?', [username]);

            const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
            const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
            const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
            const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);

            card.CCV = card.ccv;
            res.render('./user/card', {card: null, userType: 'user', user: user[0], cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
        }
        // const cards = await db.query('SELECT * FROM card WHERE number = ?', []);
    } else {
        res.redirect('/profile');
    }
});

router.get('/card/update/:number', async (req, res) => {
    if (req.session.role == 'user') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);

        const card_number = req.params.number;
        const card = await db.query('SELECT * FROM card WHERE number = ?', [card_number]);
        const user = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]);
        res.render('./user/update_card', {user: user[0], card: card[0], userType: 'user', cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.redirect('/');
    }
});

router.post('/card/update/:number', async (req, res) => {
    if (req.session.role == 'user') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);

        const card_number = req.params.number;
        const card = req.body;
        const cards = await db.query('SELECT * FROM card WHERE number = ?', [card_number]);
        if (cards.length > 0) {
            const saved_card = await db.query('SELECT card.number, depositor.user FROM card, depositor WHERE card.number = depositor.card_number AND depositor.user <> ? AND card.number = ?', [req.session.user, card.number]);
            if (saved_card.length == 0) {
                await db.query('UPDATE card SET ? WHERE number = ?', [card, card_number]);
                res.redirect('/user/card');
            } else { // SOMEONE ALREADY HAS THAT CARD NUMBER
                const user = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]);
                card.CCV = card.ccv;
                res.render('./user/update_card', {user: user[0], card: card, userType: 'user', cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
            }
        } else { // NO CARD WITH THAT NUMBER
            const user = await db.query('SELECT * FROM user WHERE user = ?', [req.session.user]);
            card.CCV = card.ccv;
            res.render('./user/update_card', {user: user[0], card: card, userType: 'user', cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
        }
    } else {
        res.redirect('/');
    }
});

router.get('/card/delete/:number', async (req, res) => {
    if (req.session.role == 'user') {
        const card_number = req.params.number;
        await db.query('DELETE FROM card WHERE number = ?', [card_number]);
        res.redirect('/user/card');
    } else {

    }
});

module.exports = router;