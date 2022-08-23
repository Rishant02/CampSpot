const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.flash('success', 'You have succesfully registered')
        res.redirect('/login')
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }

}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    const { username } = req.body;
    req.flash('success', `Hey ${username}! Welcome to YeleCamp`)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    })
})
module.exports = router;