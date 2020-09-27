const getDb = require('../util/database').getDb;
const mongodb = require('mongodb')

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this)
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      
      return cp._id.toString() == product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    console.log(cartProductIndex)
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        _id: new ObjectId(product._id),
        quantity: newQuantity
      });
    }
    
    const updatedCart = {items: updatedCartItems}
    console.log("UPPPP", updatedCart)
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        {_id: new ObjectId(this._id)},
        {$set: {cart: updatedCart}})
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({_id: new ObjectId(userId)})
      .then(user => {
        console.log('user')
        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;
