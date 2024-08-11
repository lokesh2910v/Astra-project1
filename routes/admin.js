const router = require('express').Router();

router.get('/dashboard', (req, res) => {
 if (req.isAuthenticated() && req.user.isAdmin) {
     res.sendFile('admin.html', { root: './views' });
 } else {
     res.redirect('/');
 }
});

module.exports = router;
