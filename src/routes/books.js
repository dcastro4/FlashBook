const express = require('express');
const router = express.Router();

const db = require('../database');

router.get('/image/:id', async (req, res) => {
    const img_id = req.params.id;

    const result = await db.query('SELECT * FROM book WHERE ISBN = ?', [img_id]);
    if (result.length > 0) {
        const imageContent = result[0].image;
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(imageContent);
    } else {
        res.send('Image not found');
    }
});

router.get('/', async (req, res) => {
    const search = req.query.search;
    const option = req.query.options;

    const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
    const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
    const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
    const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);

    var books = await db.query('SELECT * FROM book');
    if (search) {
        if (option == 'title') { books = await db.query(`SELECT * FROM book WHERE title LIKE '%${search}%'`); }
        if (option == 'author') { books = await db.query(`SELECT * FROM book WHERE author LIKE '%${search}%'`); }
        if (option == 'ISBN') { books = await db.query(`SELECT * FROM book WHERE ISBN LIKE '%${search}%'`); }
        if (option == 'publisher') { books = await db.query(`SELECT * FROM book WHERE publisher LIKE '%${search}%'`); }

        res.render('./books/list', {books: books, userType: req.session.role, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.render('./books/list', {books: books, userType: req.session.role, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    }
});

router.get('/:id', async (req, res) => {
    const ISBN = req.params.id;
    if (req.session.role != 'admin' && req.session.role != 'root') {
        const cart = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, cart WHERE cart.user = ? AND cart.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const reservation = await db.query('SELECT book.title, book.ISBN, stock.id, stock.state, stock.cost FROM book, stock, reservation WHERE reservation.user = ? AND reservation.id_stock = stock.id AND stock.ISBN = book.ISBN', [req.session.user]);
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const rserv_cost = await db.query('SELECT SUM(stock.cost) AS total FROM reservation, stock WHERE reservation.user = ? AND reservation.id_stock = stock.id', [req.session.user]);
        const result = await db.query('SELECT * FROM book WHERE ISBN = ?', [ISBN]);
        const stock = await db.query('SELECT * FROM stock WHERE ISBN = ?', [ISBN]);
        const book = result[0];
        res.render('./books/bookDetails', {book: book, stock: stock, userType: req.session.role, cart: cart, reservation: reservation, cart_cost: cart_cost[0], rserv_cost: rserv_cost[0]});
    } else {
        res.redirect('/admin/dashboard/book/'+ISBN);
    }
});

router.get('/addToCart/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'user') {
        const stock = await db.query('SELECT * FROM stock WHERE id = ?', [id]);
        const book = stock[0];

        const productinmycart = await db.query('SELECT * FROM cart WHERE id_stock = ? AND user = ?', [id,req.session.user]);
        if (productinmycart.length == 0) {
            const result = await db.query('SELECT * FROM reservation WHERE id_stock = ?', [id]);
            if (result.length == 0) {
                const date = new Date();

                await db.query('INSERT INTO cart VALUES (?,?,?)', [id,req.session.user,date]);
                res.redirect('/books/'+book.ISBN);
            } else { // IT IS ALREADY IN A RESERVATION
                res.redirect('/books/'+book.ISBN);
            }
        } else { // PRODUCT ALREADY IN MY CART
            res.redirect('/books/'+book.ISBN);
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/removeFromCart/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'user') {

        const productinmycart = await db.query('SELECT * FROM cart WHERE id_stock = ? AND user = ?', [id,req.session.user]);
        if (productinmycart.length > 0) {
            await db.query('DELETE FROM cart WHERE id_stock = ? AND user = ?', [id,req.session.user]);
            res.redirect('/books');
        } else { // PRODUCT NOT IN MY CART
            res.redirect('/books');
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/reserve/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'user') {
        const stock = await db.query('SELECT * FROM stock WHERE id = ?', [id]);
        const book = stock[0];

        const result = await db.query('SELECT * FROM reservation WHERE id_stock = ?', [id]);
        if (result.length == 0) {
            const date = new Date();

            await db.query('INSERT INTO reservation VALUES (?,?,?)', [id,req.session.user,date]);
            res.redirect('/books/'+book.ISBN);
        } else { // IT IS ALREADY IN A RESERVATION
            res.redirect('/books/'+book.ISBN);
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/removeFromReservation/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'user') {

        const productinmyreserv = await db.query('SELECT * FROM reservation WHERE id_stock = ? AND user = ?', [id,req.session.user]);
        if (productinmyreserv.length > 0) {
            await db.query('DELETE FROM reservation WHERE id_stock = ? AND user = ?', [id,req.session.user]);
            res.redirect('/books');
        } else { // PRODUCT NOT IN MY CART
            res.redirect('/books');
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;