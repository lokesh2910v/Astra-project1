const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login route
router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: './views' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ gmail: email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        req.login(user, (err) => {
            if (err) return res.status(500).send('Error logging in');
            return res.redirect('/dashboard');
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Google login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/dashboard');
});

// Dashboard
router.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Welcome ${req.user.username}`);
    } else {
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;
