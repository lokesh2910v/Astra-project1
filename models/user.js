
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    gmail: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String } // This field is used for Google login
});

const User = mongoose.model('User', userSchema);

module.exports = User;





