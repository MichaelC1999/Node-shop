const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport')
const User = require("../models/user");
const crypto = require('crypto')
const { validationResult } = require('express-validator/check')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}))

exports.getLogin = (req, res, next) => {
    req.session.isLoggedIn = false
    req.session.user = null
    let message = req.flash('error')
    if(message.length <= 0){
        message = null;
    } else {
        message = message[0]
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {email: "", password: ""}
    });  
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if(message.length <= 0){
        message = null;
    } else {
        message = message[0]
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        oldInput: {email: "", password: ""},
        errorMessage: message
      });
  };

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors.array())
        return res
            .status(422)
            .render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg
          });
    }

    User.findOne({email: email})
        .then(user => {
            
            if(user){
                bcrypt.compare(password, user.password)
                    .then(doMatch => {
                        if(doMatch){
                            req.session.isLoggedIn = true
                            req.session.user = user
                            if(user.admin){
                                req.session.admin = user.admin
                            }
                            return req.session.save(()=> {
                                res.redirect('/')
                            })
                        } else {
                            return res
                                .status(422)
                                .render('auth/login', {
                                path: '/login',
                                pageTitle: 'Login',
                                errorMessage: 'Invalid password',
                                oldInput: {email: email}
                            });
                        }
                    }) 
            } else {
                
                return res
                    .status(422)
                    .render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Email not found, try again',
                        oldInput: {email: email, password: password}
                    });
            }
        })    
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors.array())
        return res
            .status(422)
            .render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            oldInput: { email: email, password: password},
            errorMessage: errors.array()[0].msg
          });
    }
    

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [], cartTotal: 0}
            })
            return user.save()
        })
        .then(result=> {
            res.redirect('/login')
            return transporter.sendMail({
                to: email,
                from:'Michaelcarroll1999@gmail.com',
                subject: 'New user in Shop',
                html: '<h1>Thank you for signing up! Log in and start shopping! <link></h1>'
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

exports.getReset = (req, res, next) => {
    
    let message = req.flash('error')
    if(message.length <= 0){
        message = null;
    } else {
        message = message[0]
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
      });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer)=> {
        if (err) {
            console.log(err)
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
            .then(user=> {
                if(!user) {
                    req.flash('error', 'No user found with this Email address')
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                user.save();
            })
            .then(result => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from:'Michaelcarroll1999@gmail.com',
                    subject: 'Password reset',
                    html: `
                        <p>You requested a password reset on your account.</p>
                        <p>If this wasn't you, please ignore this email.</p>
                        <p><a href="http://localhost:3000/reset/${token}" >Click this link</a> to set a new password.</p>
                    `
                })
            })
            .catch(err=> {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            if(!user){
                throw new Error('Something went wrong with new password')
            }
            let message = req.flash('error')
            if(message.length <= 0){
                message = null;
            } else {
            message = message[0]
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err=> {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });   
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let resetUser;

    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
        .then(user => {
            if(!user){
                throw new Error('Could not find user')
            }
            resetUser = user
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            if(!hashedPassword){
                throw new Error('password could not be hashed')
            }
            resetUser.password = hashedPassword;
            resetUser.resetToken = null
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save()
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}