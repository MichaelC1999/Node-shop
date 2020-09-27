const getDb = require('../util/database').getDb;
const mongodb = require('mongodb')

class Product {
  constructor(title, imageUrl, price, description, id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
    this.userId = userId;
    this._id = id;
  }

  save() {
    const db = getDb();
    let dbOp;
    if(this._id){
      dbOp = db.collection('products').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: this })
    } else {
      dbOp = db.collection('products').insertOne(this)
    }
    
    return dbOp
      .then(result => {
      console.log(result)
    })
    .catch(err => {
      console.log(err)
    });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then(products => {
        console.log('p', products);
        return products;
      })
      .catch(err => {
        console.log(err)
      });
  }

  static findById(prodId) {
    const db = getDb();
    console.log('input: ', prodId, 'class user: ', this.userId, 'class product: ', this._id)
    return db
      .collection('products')
      .find({_id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => {
        console.log(err);
      })
  }

  static deleteById(prodId) {
    const db = getDb();
    console.log('prod model delete prod ID: ', prodId)
    return db
      .collection('products')
      .deleteOne({_id: new mongodb.ObjectId(prodId)})
      .then(result=> {
        console.log("deleted")
      })
      .catch(err => {
        console.log(err)
      })
  }
}



module.exports = Product;
