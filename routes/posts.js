const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../controllers/authMiddleware");

router.post("/add-text", authMiddleware.isAuthenticated, postController.addPost);
router.post("/delete-post/:id", authMiddleware.isAdmin, postController.deletePost);

module.exports = router;
