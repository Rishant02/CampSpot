const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username })
        await User.register(user, password)
        req.flash('success', 'You have succesfully registered')
        res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    const { username } = req.body;
    req.flash('success', `Hey ${username}! Welcome to YeleCamp`)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logOut(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    })
}