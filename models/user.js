const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  admin: Boolean,
  cart: {
    items: [{
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }}],
    cartTotal: {
      type: Number,
      required: true
    }
  }
})

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp._id.toString() == product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      _id: product._id,
      price: product.price,
      quantity: newQuantity
    });
  }

  let cartTotalCost = 0

  const updatedCart = {
    items: updatedCartItems,
    cartTotal: cartTotalCost
  }

  this.cart = updatedCart
  
  for(item in this.cart.items){
    cartTotalCost += this.cart.items[item].quantity * this.cart.items[item].price
  }

  this.cart.cartTotal = cartTotalCost;

  return this.save();
}

userSchema.methods.removeFromCart = function(productId) {
  const productRemoveIndex = this.cart.items.findIndex(cp => {
    return cp._id.toString() == productId.toString()
  })

  const amtToRemove = this.cart.items[productRemoveIndex].price * this.cart.items[productRemoveIndex].quantity

  this.cart.items.splice(productRemoveIndex, 1)
  this.cart.cartTotal = this.cart.cartTotal - amtToRemove

  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {items: [], cartTotal: 0};
  return this.save();
}

module.exports = mongoose.model('User', userSchema)

