const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://cm172596:XboxMike32@cluster0.ufyip.mongodb.net/shop?retryWrites=true&w=majority'
    )
    .then(client => {
      console.log('connected');
      _db = client.db()
      callback();
    })
    .catch(err => {
    console.log(err)
    throw err;
  });
}

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No database'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;


