const express = require("express");
const router = express.Router();
const pool = require("../db/pool"); 

router.get("/", async (req, res, next) => {
  try {
    const postsResult = await pool.query(`
      SELECT posts.id, posts.text, users.username, users.membership 
      FROM posts 
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.timestamp DESC
    `);
    res.render("index", { user: req.user, posts: postsResult.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
