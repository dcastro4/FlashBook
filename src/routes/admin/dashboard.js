const express = require('express');
const router = express.Router();
const path = require('path');
const validator = require(path.join(__dirname, '..', '..', 'lib', 'validator'));

const multer = require('multer');
const fs = require('fs');
const upload = multer({dest: path.join(__dirname, '..', '..', 'public', 'images', 'books')});

const db = require(path.join(__dirname, '..', '..', 'database'));

router.get('/dashboard', async (req, res) => {
    if (req.session.role == 'admin') {
        const books = await db.query('SELECT * FROM book');
        // const books = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
        res.render('./admin/dashboard', {books: books, userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard/addBook', async (req, res) => {
    if (req.session.role == 'admin') {
        // const books = await db.query('SELECT * FROM book');
        res.render('./admin/addBook', {userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard/stores', async (req, res) => {
    if (req.session.role == 'admin') {
        const stores = await db.query('SELECT * FROM store');
        // const books = await db.query('SELECT * FROM book');
        res.render('./admin/dashboard_stores', {option: true, stores: stores, userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard/stores/add', async (req, res) => {
    // res.render('./admin/addStore', {option: true});
    if (req.session.role == 'admin') {
        await db.query('INSERT INTO store SET ?', [req.body]);
        // const books = await db.query('SELECT * FROM book');
        res.redirect('/admin/dashboard/stores');
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard/stores/update/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'admin') {
        const stores = await db.query('SELECT * FROM store');
        const store = await db.query('SELECT * FROM store WHERE id = ?', [id]);
        res.render('./admin/dashboard_stores', {store: store[0], stores: stores, userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard/stores/update/:id', async (req, res) => {
    const id = req.params.id;
    const store = req.body;
    if (req.session.role == 'admin') {
        const saved_store = await db.query('SELECT * FROM store WHERE id = ?', [id]);
        store.id_warehouse = saved_store.id_warehouse; // DON'T CHANGE THE WAREHOUSE
        await db.query('UPDATE store SET ? WHERE id = ?', [store, id]);
        res.redirect('/admin/dashboard/stores');
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard/stores/remove/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'admin') {
        await db.query('DELETE FROM store WHERE id = ?', [id]);
        res.redirect('/admin/dashboard/stores');
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard/addBook', upload.single('image'), async (req, res) => {
    const book = req.body;
    
    book.image = null;
    if (req.file) {
        const imagePath = req.file.path;
        const imageContent = fs.readFileSync(imagePath);
        book.image = imageContent;
    }

    const books = await db.query('SELECT * FROM book WHERE ISBN = ?', [book.ISBN]);
    if (books.length == 0) {
        await db.query('INSERT INTO book SET ?', [book]);
        res.redirect('/admin/dashboard');
    } else {// ELSE: BOOK ISBN ALREADY EXISTS
        res.redirect('/admin/dashboard/addBook');
    }
});

router.get('/dashboard/addCopy', async (req, res) => {
    if (req.session.role == 'admin') {
        // const books = await db.query('SELECT * FROM book');
        res.render('./admin/addCopy', {userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard/addCopy/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'admin') {
        // const books = await db.query('SELECT * FROM book');
        res.render('./admin/addCopy', {userType: req.session.role, ISBN: id});
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard/addCopy', async (req, res) => {
    const stock = req.body;

    const books = await db.query('SELECT * FROM book WHERE ISBN = ?', [stock.ISBN]);
    if (books.length > 0) {
        await db.query('INSERT INTO stock SET ?', [stock]);
        res.redirect('/admin/dashboard/book/'+stock.ISBN);
    } else {// ELSE: NO BOOK ISBN ASOCIATED WITH THIS
        res.redirect('/admin/dashboard');
    }
});

router.get('/dashboard/book/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'admin') {
        
        const result = await db.query('SELECT * FROM book WHERE ISBN = ?', [id]);
        const book = result[0];
        const stock = await db.query('SELECT * FROM stock WHERE ISBN = ?', [id]);
        if (result.length > 0) {
            res.render('./admin/bookDetails', {book: book, stock: stock, userType: req.session.role});
        } else {
            res.send('Book not found');
        }
    } else {
        res.redirect('/books/'+id);
    }
});

router.get('/dashboard/editBook/:id', async (req, res) => {
    const id = req.params.id;
    if (req.session.role == 'admin') {
        const book = await db.query('SELECT * FROM book WHERE ISBN = ?', [id]);

        if (book.length > 0) {
            const currentDate = book[0].publication_date;
            var formattedDate;
            if (currentDate == '0000-00-00 00:00:00') { // CHANGE THE DATE VALIDATION FOR FUTURE UPGRADES
                formattedDate = Date('0000-00-00');
            } else {
                formattedDate = currentDate.toISOString().split('T')[0];
            }
            book[0].publication_date = formattedDate;
            res.render('./admin/editBook', {book: book[0], userType: req.session.role});
        } else {
            res.send('Book not found');
        }
    } else {
        res.redirect('/books/'+id);
    }
});

router.post('/dashboard/editBook/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    
    const books = await db.query('SELECT * FROM book WHERE ISBN = ?', [id]);
    if (books.length > 0) {
        const book = books[0];
        var image = book.image;
        if (req.file) {
            const imagePath = req.file.path;
            image = fs.readFileSync(imagePath);
        }
        req.body.image = image;
        await db.query('UPDATE book SET ? WHERE ISBN = ?', [req.body, id]);
        res.redirect('/admin/dashboard');
    } else {// ELSE: BOOK ISBN ALREADY EXISTS
        res.redirect('/admin/dashboard/editBook/'+id);
    }
});

router.get('/dashboard/removeBook/:id', async (req, res) => {
    id = req.params.id;
    if (req.session.role == 'admin') {
        await db.query('DELETE FROM book WHERE ISBN = ?', [id]);
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/books/'+id);
    }
});

router.get('/dashboard/removeCopy/:id', async (req, res) => {
    id = req.params.id;
    const copy = await db.query('SELECT * FROM stock WHERE id = ?', [id]);
    const ISBN = copy[0].ISBN;
    if (req.session.role == 'admin') {
        await db.query('DELETE FROM stock WHERE id = ?', [id]);
        res.redirect('/admin/dashboard/book/'+ISBN);
    } else {
        res.redirect('/books/'+ISBN);
    }
});

router.get('/dashboard/outOfStock', async (req, res) => {
    if (req.session.role == 'admin') {
        const q = 'SELECT * FROM book WHERE ISBN NOT IN (SELECT ISBN FROM stock)'
        const books = await db.query(q);
        res.render('./admin/out_of_stock', {userType: req.session.role, books});
    } else {
        res.redirect('/books');
    }
});

module.exports = router;