const pool = require("../db/pool");

exports.addPost = async (req, res, next) => {
  try {
    await pool.query(
      "INSERT INTO posts (title, text, user_id) VALUES ($1, $2, $3)",
      ["User Post", req.body.postText, req.user.id]
    );
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
