const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
 done(null, user.id);
});

passport.deserializeUser((id, done) => {
 User.findById(id).then((user) => {
     done(null, user);
 });
});

passport.use(
 new GoogleStrategy({
     clientID: '88602286776-f74qe8hsgc547hqa8pstqk8plhsds0r0.apps.googleusercontent.com',
     clientSecret: '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',
     callbackURL: '/auth/google/redirect'
 }, (accessToken, refreshToken, profile, done) => {
     User.findOne({ googleId: profile.id }).then((currentUser) => {
         if(currentUser){
             done(null, currentUser);
         } else {
             new User({
                 googleId: profile.id,
                 username: profile.displayName,
                 email: profile.emails[0].value
             }).save().then((newUser) => {
                 done(null, newUser);
             });
         }
     });
 })
);
