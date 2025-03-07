const { Pool } = require("pg");
require("dotenv").config(); 

module.exports = new Pool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });
