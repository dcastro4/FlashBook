const express = require('express');
const router = express.Router();

const db = require('../database');

router.get('/', async (req, res) => {
    
    const new_books = await db.query('SELECT book.* FROM book, stock WHERE book.ISBN = stock.ISBN ORDER BY stock.date_entry DESC');
    const romance_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Romance']);
    const adventure_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Adventure']);
    const poetry_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Poetry']);
    const scifi_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['SciFi']);
    const fantasy_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Fantasy']);
    const mistery_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Mistery']);
    const horror_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Horror']);
    const science_books = await db.query('SELECT DISTINCT book.* FROM book, stock WHERE book.ISBN = stock.ISBN AND book.genre = ?', ['Science']);

    if (req.session.role == 'user') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);
        res.render('', {new_books, romance_books, adventure_books, poetry_books, fantasy_books, mistery_books, scifi_books, horror_books, science_books, userType: req.session.role, cart, reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.render('', {new_books, romance_books, adventure_books, poetry_books, fantasy_books, mistery_books, scifi_books, horror_books, science_books, userType: req.session.role});
    }
});

module.exports = router;