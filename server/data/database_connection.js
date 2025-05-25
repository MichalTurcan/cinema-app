const mysql = require("mysql2/promise");
require("dotenv").config();

const dbHost = process.env.DB_HOST
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
const dbName = process.env.DB_NAME
const dbPort = process.env.DB_PORT

const pool = mysql.createPool({
    host: dbHost,
    database: dbName,
    user: dbUser,
    password: dbPass,
    port: dbPort
})
  

module.exports = pool;