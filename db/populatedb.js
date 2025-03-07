#! /usr/bin/env node
require("dotenv").config();
const { Client } = require("pg");

const SQL = `


CREATE TABLE IF NOT EXISTS users  (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    membership VARCHAR(10) CHECK (membership IN ('member', 'admin')) NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (firstname, lastname, username, password, membership) VALUES
('John', 'Doe', 'johndoe', 'hashed_password_1', 'member'),
('Jane', 'Smith', 'janesmith', 'hashed_password_2', 'admin'),
('Alice', 'Johnson', 'alicej', 'hashed_password_3', 'member');

INSERT INTO posts (title, text, user_id) VALUES
('First Post', 'This is the first post by .', 1),
('Admin Notice', 'Important notice .', 2),
('Alice''s Thoughts', 'Sharing some ideas.', 3);
`;

const main = async () => {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DB_CONNECTION,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
};

main();
