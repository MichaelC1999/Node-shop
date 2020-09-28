const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5f7131ca5ce7bc271e2f791e')
  .then(user => {
    req.user = user;
    next();
  })
    .catch(err => console.log(err));
  });

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://cm172596:XboxMike32@cluster0.ufyip.mongodb.net/shop?retryWrites=true&w=majority')
.then(result => {
  User.findOne().then(user => {
    if(!user){
      const user= new User({
        name: 'Mike',
        email: 'michaelcarroll1999@gmail.com',
        cart: {
          items: []
        }
      });
      user.save()
    }
  })
  console.log('Ligado')
  app.listen(5000)
}).catch(err => {
  console.log(err)
})