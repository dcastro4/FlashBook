const express = require('express');
const router = express.Router();

const db = require('../database');

router.get('/', async (req, res) => {
    if (req.session.role == 'user') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);
        res.render('', {userType: req.session.role, cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.render('', {userType: req.session.role});
    }
});

module.exports = router;