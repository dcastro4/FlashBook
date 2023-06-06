const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const colors = require('colors');
const flash = require('connect-flash');

// Initializations
const app = express();

// Settings
PORT = process.env.PORT || 5555;
app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(flash());
app.use(morgan('dev'));
// app.use(express.urlencoded({extended: false}));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true
}));

// Global Variables
app.use((req, res, next) => {
    next();
});

// Routes
app.use(require('./routes/index'));

app.use('/admin', require('./routes/admin/dashboard'));
app.use('/root', require('./routes/root/dashboard'));
app.use('/books', require('./routes/books'));
app.use(require('./routes/auth'));
app.use('/user', require('./routes/user/card'));
app.use('/user', require('./routes/user/shopping'));
app.use('/user', require('./routes/user/history'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting Server
app.listen(app.get('port'), () => {
    console.log('[SERVER] Server listening on port: '.green, app.get('port'))
})