const path = require('path');
const { check, body } = require('express-validator/check')

const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, isAdmin, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, isAdmin,
    [   
        check('title', 'Title must be longer than 3 characters')
            .isString()
            .isLength({min: 3})
            .trim(),
        check('price', 'Please put in a number in 0.00 format')
            .isFloat(),
        check('description', 'Please write a description between 5 and 400 characters')
            .isLength({min: 5, max: 400})
            .trim()
    ],
    adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, isAdmin, adminController.getEditProduct);

router.post('/edit-product', isAuth, isAdmin,
    [   
        check('title', 'Title must be longer than 3 characters')
            .isString()
            .isLength({min: 3})
            .trim(),
        check('price', 'Please put in a number in 0.00 format')
            .isFloat(),
        check('description', 'Please write a description between 5 and 400 characters')
            .isLength({min: 5, max: 400})
            .trim()
    ],
    adminController.postEditProduct);


module.exports = router;
