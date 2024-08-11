const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcryptjs'); 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const User = require('./models/User');
require('./config/passport-setup');

const app = express();

mongoose.connect('mongodb+srv://lokeshmbu2004:6fnkI8kUUr2LXW0T@cluster0.udim8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));

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
    res.sendFile(__dirname + '/views/login.html');
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

    res.send('Sign-in successful! Please log in.');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find user by email (use gmail field)
    const user = await User.findOne({ gmail: email });

    if (!user) {
        // If the user is not found, return an error message
        return res.status(400).send('User not found');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        // If the password is incorrect, return an error message
        return res.status(400).send('Invalid credentials');
    }

    // If both email and password are correct
    res.send('Login successful!');
});

