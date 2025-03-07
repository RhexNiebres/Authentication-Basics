const bcrypt = require("bcryptjs");
const pool = require("../db/pool");

exports.getSignUp = (req, res) => {
  res.render("sign-up-form");
};

exports.postSignUp = async (req, res, next) => {
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("Username already exists.");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const role = req.body.membership === "admin" ? "admin" : "member";

    await pool.query(
      "INSERT INTO users (firstname, lastname, username, password, membership) VALUES ($1, $2, $3, $4, $5)",
      [
        req.body.firstname,
        req.body.lastname,
        req.body.username,
        hashedPassword,
        role,
      ]
    );

    res.redirect("/");
  } catch (err) {
    return next(err);
  }
};

exports.getBecomeMember = (req, res) => {
  res.render("memberForm");
};

exports.postBecomeMember = async (req, res, next) => {
  if (!req.user) return res.status(401).send("Unauthorized");

  if (req.body.password === process.env.MEMBER_SECRET) {
    try {
      await pool.query("UPDATE users SET membership = 'member' WHERE id = $1", [
        req.user.id,
      ]);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  } else {
    res.send(`<script>alert("Wrong password"); window.location.href="/become-member";</script>`);
  }
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
