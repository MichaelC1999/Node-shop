const Product = require('../models/product');
const { validationResult } = require('express-validator/check')
const {cloudinary} = require('../util/cloudinary');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null

  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image){
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add product',
      editing: false,
      hasError: true,
      product: {
        title: title, 
        price: price,
        description: description
      },
      errorMessage: 'Image file must be uploaded'
    });
  }

  let imagePath = ""

  try {
    const uploadedResponse = await cloudinary.uploader.upload(image.path, {
      upload_preset: 'dev_setups'
    })
    imagePath = uploadedResponse.url
  } catch(err) {
    console.log(err)
  }


  const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors.array())
        return res
            .status(422)
            .render('admin/edit-product', {
            path: '/admin/add-product',
            pageTitle: 'Add product',
            editing: false,
            hasError: true,
            product: {
              title: title, 
              price: price,
              description: description
            },
            errorMessage: errors.array()[0].msg
          });
    }


  
    const product = new Product({
      title: title,
      imageUrl: imagePath,
      price: price,
      description: description,
      userId: req.user._id
    })

  product
    .save()  
    .then(result => {
        res.redirect('/admin/products');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    throw new Error('Not in edit mode')
  }
  const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
      if (!product) {
        throw new Error('No product found')
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: null
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body._id;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;


  const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors.array())
        return res
            .status(422)
            .render('admin/edit-product', {
            path: '/edit-product',
            pageTitle: 'Edit product',
            editing: true,
            hasError: true,
            product: {
              title: updatedTitle, 
              price: updatedPrice,
              description: updatedDesc
            },
            errorMessage: errors.array()[0].msg
          });
    }

    let imagePath = ""

    try {
      const uploadedResponse = await cloudinary.uploader.upload(image.path, {
        upload_preset: 'dev_setups'
      })
      console.log(uploadedResponse)
      imagePath = uploadedResponse.url
    } catch(err) {
      console.log(err)
    }

  Product.findById(prodId)
    .then(product=> {

      if(!product){
        throw new Error('No product found')
      }

      product.imageUrl = imagePath
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;

      
      return product.save()
  })
  .then(result => {
    res.redirect('/admin/products');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  Product
    .find()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
          });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

