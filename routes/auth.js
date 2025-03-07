const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

router.get("/sign-up", authController.getSignUp);
router.post("/sign-up", authController.postSignUp);
router.post("/log-in", passport.authenticate("local", { successRedirect: "/", failureRedirect: "/" }));
router.get("/log-out", authController.logout);
router.get("/become-member", authController.getBecomeMember);
router.post("/become-member", authController.postBecomeMember);

module.exports = router;
