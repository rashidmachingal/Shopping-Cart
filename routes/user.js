const { response, Router } = require('express');
var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var productHelpers = require('../helpers/product-helpers');
const session = require('express-session');
const { USER_COLLECTION } = require('../config/collections');

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// ==== home page start ===== //

router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  console.log(user);

  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount });
  })

});

// ==== home page end ===== //


// ==== user login start ===== //

router.get('/login', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {

    res.render('user/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
})

router.post('/login', (req, res) => {
  userHelpers.DoLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    } else {
      req.session.userLoginErr = "Invalid user name or password"
      res.redirect('/login')
    }
  })
})

// ==== user login end ===== //


// ==== user signup start ===== //

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})

// ==== user signup end ===== //


// ==== user logout start ===== //

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false;
  res.redirect('/')
})

// ==== user logout end ===== //


// ==== user cart start ===== //

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let cartValue = 0
  if (products.length > 0) {
    cartValue = await userHelpers.getTotalAmount(req.session.user._id)
  }

  console.log(products);
  let user = req.session.user._id
  console.log(user);
  res.render('user/cart', { products, user: req.session.user, cartValue })
})

// ==== user cart end ===== //


// ==== add to cart start ===== //

router.get('/add-to-cart/:id', (req, res) => {
  console.log("api called");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

// ==== add to cart end ===== //


// ==== remove product from cart start ===== //

router.post('/remove-product-from-cart', (req, res) => {
  userHelpers.removeProductFromCart(req.body).then((response) => {
    console.log(req.body);
    res.json(response)
  })
})

// ==== remove product from cart end ===== //


// ==== change product quantity start ===== //

router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    console.log(req.body);
    res.json(response)
  })
})

// ==== change product quantity end ===== //


// ==== place order start ===== //

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
}),

  router.post('/place-order', async (req, res) => {
    console.log(req.body);
    let products = await userHelpers.getCartProductsList(req.body.userId)
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if (req.body['payment-method'] == 'COD') {
        res.json({ codSuccess: true })
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response)
        })
      }

    })
  }),

// ==== place order end ===== //


// ==== order success start ===== //

  router.get('/order-success', (req, res) => {
    res.render('user/order-success', { user: req.session.user })
  }),

// ==== order success end ===== // 


// ==== order page start ===== //

  router.get('/orders', async (req, res) => {
    let orders = await userHelpers.getUserOrders(req.session.user._id)
    res.render('user/orders', { user: req.session.user, orders })
    console.log(orders);
  })

// ==== order page end ===== //


// ==== verify payment start ===== //

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('payment successfully');
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: "payment failed" })
  })

})

// ==== verify payment end ===== //


// ==== veiw order products start ===== //

router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })
  console.log(products);
})

// ==== veiw order products end ===== //

module.exports = router;
