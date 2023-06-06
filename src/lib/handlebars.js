// handlebars-helpers.js

const Handlebars = require('handlebars');

// Define 'eq' helper
Handlebars.registerHelper("eq", function(value1, value2, options) {
    return value1 == value2;
});

module.exports = Handlebars;
