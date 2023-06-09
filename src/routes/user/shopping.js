const express = require('express');
const router = express.Router();
const path = require('path');
const helpers = require(path.join(__dirname, '..', '..', 'lib', 'helpers'));
const validator = require(path.join(__dirname, '..', '..', 'lib', 'validator'));

const db = require(path.join(__dirname, '..', '..', 'database'));

router.post('/cart/buy', async (req, res) => {
    if (req.session.role == 'user') {
        const cart_cost = await db.query('SELECT SUM(stock.cost) AS total FROM cart, stock WHERE cart.user = ? AND cart.id_stock = stock.id', [req.session.user]);
        const user_card = await db.query('SELECT * FROM depositor, card WHERE depositor.user = ? AND depositor.card_number = card.number', [req.session.user]);
        if (user_card.length > 0) {
            if (cart_cost[0].total <= user_card[0].balance) {
                const cart_books = await db.query('SELECT * FROM cart WHERE user = ?', [req.session.user]);

                for (let book of cart_books) {
                    var stock_book = await db.query('SELECT * FROM stock WHERE id = ?', [book.id_stock]);
                    var something = await db.query('SELECT * FROM history WHERE user = ? AND ISBN = ? AND state = ?', [req.session.user, stock_book[0].ISBN, stock_book[0].state]);
                    if (something.length > 0) {
                        var row = {'user': req.session.user, 'ISBN': stock_book[0].ISBN, 'date': new Date(), 'quantity': something[0].quantity + 1, 'state': stock_book[0].state};
                        await db.query('UPDATE history SET ? WHERE user = ? AND ISBN = ? AND state = ?', [row, req.session.user, stock_book[0].ISBN, stock_book[0].state]);
                    } else { // NO BOOK
                        var row = {'user': req.session.user, 'ISBN': stock_book[0].ISBN, 'date': new Date(), 'quantity': 1, 'state': stock_book[0].state};
                        await db.query('INSERT INTO history SET ?', [row]);
                    }
                    await db.query('DELETE FROM stock WHERE id = ?', [book.id_stock]);
                }
                await db.query('UPDATE card SET balance = ? WHERE number = ?', [user_card[0].balance - cart_cost[0].total, user_card[0].card_number]);
            } else { // CARD VALUE IS NOT ENOUGH

            }
            res.redirect('/books');
        } else { // NO CREDIT CARD, ADD ONE
            res.redirect('/user/card');
        }
    } else {
        res.redirect('/');
    }
});

module.exports = router;