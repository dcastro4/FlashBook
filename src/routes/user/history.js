const express = require('express');
const router = express.Router();
const path = require('path');
const helpers = require(path.join(__dirname, '..', '..', 'lib', 'helpers'));
const validator = require(path.join(__dirname, '..', '..', 'lib', 'validator'));

const db = require(path.join(__dirname, '..', '..', 'database'));

router.get('/history', async (req, res) => {
    if (req.session.role == 'user') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);

        const mybooks = await db.query('SELECT * FROM book, history WHERE book.ISBN = history.ISBN AND user = ? ORDER BY history.date DESC', [req.session.user]);

        res.render('./user/history', {mybooks, userType: 'user', cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.redirect('/login');
    }
});

module.exports = router;