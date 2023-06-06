const express = require('express');
const router = express.Router();
const path = require('path');
const helpers = require(path.join(__dirname, '..', '..', 'lib', 'helpers'));
const validator = require(path.join(__dirname, '..', '..', 'lib', 'validator'));

const db = require(path.join(__dirname, '..', '..', 'database'));

router.get('/dashboard', async (req, res) => {
    if (req.session.role == 'root') {
        const admins = await db.query('SELECT * FROM administrator');
        res.render('./root/dashboard', {option: true, admins: admins, userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard', async (req, res) => {
    const admin_fields = await validator.isAdminOk(req.body);
    if(admin_fields == true) {
        req.body.password = await helpers.encrypt(req.body.password);
        await db.query('INSERT INTO administrator SET ?', [req.body])
        res.redirect('/root/dashboard');
    }
});

router.get('/dashboard/remove/:id', async (req, res) => {
    if (req.session.role == 'root') {
        await db.query('DELETE FROM administrator WHERE admin = ?', [req.params.id]);
        res.redirect('/root/dashboard');
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard/update/:id', async (req, res) => {
    if (req.session.role == 'root') {
        const admins = await db.query('SELECT * FROM administrator');
        var admin = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.params.id]);
        admin = admin[0];
        const currentDate = admin.date_birth;
        const formattedDate = currentDate.toISOString().split('T')[0];
        admin.date_birth = formattedDate;
        res.render('./root/dashboard', {option: false, admin: admin, admins: admins, userType: req.session.role});
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard/update/:id', async (req, res) => {
    var admin = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.params.id]);
    admin = admin[0];
    req.body.password = admin.password; // DON'T CHANGE THE PASSWORD
    const admin_fields = await validator.isAdminOk(req.body);
    if(admin_fields == true) {
        const something = await db.query('SELECT * FROM administrator WHERE admin = ?', [req.params.id]);
        if (something.length > 0) {
            await db.query('UPDATE administrator SET ? WHERE admin = ?', [req.body, req.params.id])
            res.redirect('/root/dashboard');
        } else { // ADMIN DOESN'T EXIST, CREATE IT FIRST
            res.redirect('/root/dashboard');
        }
    }
});

module.exports = router;