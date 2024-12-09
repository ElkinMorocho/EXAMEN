const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sistemalibros',
    password: 'grupo4',
    port: 5432,
});

module.exports = Libro;