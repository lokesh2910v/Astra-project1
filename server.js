const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcryptjs'); 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');
require('./config/passport-setup');
const path = require("path");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

mongoose.connect('mongodb+srv://lokeshmbu2004:6fnkI8kUUr2LXW0T@cluster0.udim8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({
    secret: '@Astra2004',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.render('index.ejs'); // Home page
});

app.get('/services', (req, res) => {
    res.render('services.ejs'); // Services page
});

app.get('/courses', (req, res) => {
    res.render('courses.ejs'); // Courses page
});

app.get('/about', (req, res) => {
    res.render('about.ejs'); // About page
});

app.get('/contact', (req, res) => {
    res.render('contact.ejs'); // Contact page
});

app.get('/login', (req, res) => {
    res.render('login.ejs'); // Login page
});

app.get('/signin', (req, res) => {
    res.render('signin.ejs'); // Sign-in page
});

// Signin route
app.post('/signin', async (req, res) => {
    const { gmail, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    const existingUser = await User.findOne({ gmail });
    if (existingUser) {
        return res.status(400).send('User with this Gmail already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ gmail, username, password: hashedPassword });
    await user.save();

    res.redirect('/');
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ gmail: email });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).send('Invalid credentials');
    }

    res.redirect('/'); // Redirect to a dashboard or home page after successful login
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});


app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/redirect', 
    passport.authenticate('google', { failureRedirect: '/login' }), 
    (req, res) => {
        res.redirect('/'); // Ensure it redirects to '/'
    }
);


passport.use(
    new GoogleStrategy({
        clientID: '88602286776-f74qe8hsgc547hqa8pstqk8plhsds0r0.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: '/auth/google/redirect'
    }, async (accessToken, refreshToken, profile, done) => {
        // Check if user already exists in the database
        const currentUser = await User.findOne({ gmail: profile.emails[0].value });

        if (currentUser) {
            done(null, currentUser);
        } else {
            // Create a new user if they don't exist
            const newUser = new User({
                gmail: profile.emails[0].value,
                username: profile.displayName,
                password: null  // or set a default value or modify your schema to accept null values
            });

            await newUser.save();
            done(null, newUser);
        }
    })
);
