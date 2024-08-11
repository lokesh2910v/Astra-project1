
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gmail: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function() { return !this.googleId; } // Only required if not signing in with Google
    },
    googleId: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;





