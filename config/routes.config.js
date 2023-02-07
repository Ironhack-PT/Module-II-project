const express = require('express');
const passport = require("passport")
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require("../middlewares/auth.middleware")

const GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
  

router.get('/', (req, res, next) => {
    res.render('misc/index')
  })


//SIGNUP

router.get('/register',  authMiddleware.isNotAuthenticated, authController.register)
router.post("/register", authMiddleware.isNotAuthenticated, authController.doRegister)


//LOGIN

router.get('/login',  authMiddleware.isNotAuthenticated, authController.login)
router.post('/login', authMiddleware.isNotAuthenticated, authController.doLogin)
router.get('/login/google', passport.authenticate('google-auth', { scope: GOOGLE_SCOPES }))
router.get('/auth/google/callback', authController.doLoginGoogle)


//PROFILE

router.get("/profile", authMiddleware.isAuthenticated, authController.profile)

module.exports = router;