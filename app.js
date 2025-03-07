const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db/pool");
const { body, validationResult } = require("express-validator");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());

//index route
app.get("/", async (req, res, next) => {
  try {
    // Query posts with associated username (joining posts and users)
    const postsResult = await pool.query(`
      SELECT posts.id, posts.text, users.username, users.membership 
      FROM posts 
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.timestamp DESC
    `);
    const posts = postsResult.rows;
    res.render("index", { user: req.user, posts: posts });
  } catch (err) {
    next(err);
  }
});

//sign up route
app.get("/sign-up", (req, res) => res.render("sign-up-form"));
app.post("/sign-up", async (req, res, next) => {
  console.log("Received form data:", req.body);
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [req.body.username]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .send("Username already exists. Please choose another.");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const role = req.body.membership === "admin" ? "admin" : "member"; // Default to "member"
    await pool.query(
      "INSERT INTO users (firstname, lastname, username, password, membership) VALUES ($1, $2,$3,$4,$5)",
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
});
//posts
app.post("/add-text", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }
  try {
    await pool.query(
      "INSERT INTO posts (title, text, user_id) VALUES ($1, $2, $3)",
      ["User Post", req.body.postText, req.user.id]
    );
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

//delete function for post
app.post("/delete-post/:id", async (req, res, next) => {
  if (!req.user || req.user.membership !== "admin") {
    return res.status(403).send("Unauthorized");
  }

  console.log("Attempting to delete post with ID:", req.params.id); // Debugging step

  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);

    if (post.rows.length === 0) {
      console.log("Post not found!");
      return res.status(404).send("Post not found");
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    console.log("Post deleted successfully");
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting post:", err);
    next(err);
  }
});

app.get("/become-member", (req, res) => {
  res.render("memberForm");
});

//become a member route
app.post("/become-member", async (req, res, next) => {
  const password = req.body.password;
  const secretPassword = process.env.MEMBER_SECRET; 
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  if (password === secretPassword) {
    try {
      await pool.query("UPDATE users SET membership = 'member' WHERE id = $1", [
        req.user.id,
      ]);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  } else {
    res.send(
      `<script>alert("Wrong password"); window.location.href="/become-member";</script>`
    );
  }
});


//first function
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post(
  "/create-user",
  [
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("passwordConfirmation")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords do not match"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.send("User created successfully!");
  }
);

app.listen(process.env.APP_PORT, () =>
  console.log(`app listening on port ${process.env.APP_PORT}!`)
);
