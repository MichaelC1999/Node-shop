module.exports = (req, res, next) => {
    if(!req.user.admin) {
        req.flash('error', 'Only Admins have permission to do that')
        return res.redirect('/')
    }
    next();
}