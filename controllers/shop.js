const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product
    .find()
    .countDocuments()
    .then(numProducts => {
      totalItems=numProducts;

      return Product.find().skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        totalProducts: totalItems,
        page: page,
        nextPage: page+1,
        prevPage: page-1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        hasPrevPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        isAdmin: req.session.admin
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products',
    });
  })
  .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product
    .find()
    .countDocuments()
    .then(numProducts => {
      totalItems=numProducts;

      return Product.find().skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        totalProducts: totalItems,
        page: page,
        nextPage: page+1,
        prevPage: page-1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        hasPrevPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        isAdmin: req.session.admin
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
  .populate('cart.items._id')
  .execPopulate()
  .then(user => {
    const products = user.cart.items;
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products,
      totalCost: user.cart.cartTotal,
    });
  })
  .catch(err => console.log(err));
  
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err=>{
    console.log(err)
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
  .removeFromCart(prodId)
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};


exports.getCheckoutSuccess = (req, res, next) => {
  req.user
  .populate('cart.items._id')
  .execPopulate()
  .then(user => {
    if(!user){
      throw new Error('user not found')
    }
    const products = user.cart.items.map(i=> {
      return {quantity: i.quantity, product: {...i._id._doc}}
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products,
      totalCost: user.cart.cartTotal
    })
    order.save();
  })
  .then(result => {
    return req.user.clearCart();
  })
  .then(()=> {
    res.redirect('/orders');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getOrders = (req, res, next) => {
  
  Order.find({'user.userId': req.user._id})
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        throw new Error('No order found.');
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        throw new Error('Unauthorized');
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice- ', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      pdfDoc.text(orderId)
      order.products.forEach(prod => {
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + order.totalCost);

      pdfDoc.end();
      
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};