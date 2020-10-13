const express = require('express');
const authController = require('../controllers/auth')
const router = express.Router();
const { check, body } = require('express-validator/check')
const User = require('../models/user');

router.get('/login', authController.getLogin)
router.post('/login', 
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .normalizeEmail()
    ], 
    authController.postLogin)

router.post('/logout', authController.postLogout)
router.get('/signup', authController.getSignup);
router.post('/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, {req}) => {
                return User.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exists. Use a different one or login.')
                        } 
                    })
            })
            .normalizeEmail(),
        body('password', 'Password must be between 5 and 20 characters, and only letters/numbers')
            .isLength({min: 5, max: 20})
            .isAlphanumeric(),
        body('confirmPassword').custom((value, { req }) => {
            if(value !== req.body.password){
                throw new Error('Passwords have to match!');                                                                                                                                                                                                                  
            }
            return true;
        })
    ],
    authController.postSignup
);

router.get('/reset', authController.getReset)
router.post('/reset', authController.postReset)
router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)

module.exports = router;