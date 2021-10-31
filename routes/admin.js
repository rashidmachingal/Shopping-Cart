const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

// ==== admin page start ===== //

router.get('/', verifyLogin, function (req, res, next) {
  let admin = req.session.admin
  console.log("Admin@login", admin);
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/view-products', { admin, products, "adminTrue": req.session.adminLoggedIn });
  })

});

// ==== admin page end ===== //


// ==== admin login start ===== //

router.post('/login', (req, res) => {
  productHelpers.adminLogin(req.body).then((response) => {
    console.log("new$$", response);
    if (response.status) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin')
    } else {
      loginErr = req.session.adminLoginErr = "Invalid user name or password"
      res.redirect('/admin/login')
    }
  })
})

router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/')
  } else {
    res.render('admin/admin-login', { "loginErr": req.session.adminLoginErr, "adminTrue": req.session.adminLoggedIn, admin: true })
  }
})

// ==== admin login end ===== //


// ===== admin logout start ====== //

router.get('/logout', (req, res) => {
  req.session.admin = null
  req.session.adminLoggedIn = false;
  res.redirect('/admin/login')
})

// ===== admin logout end ====== //


// ==== add product start ===== //

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { admin: true })
})

router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product")
      } else {
        console.log(err);
      }
    })

  })
})

// ==== add product end ===== //


// ==== delete product start ===== //

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})

// ==== delete product end ===== //


// ==== edit product start ===== //

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  res.render('admin/edit-product', { product, admin: true })
  console.log(product);
})

router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.image) {
      let image = req.files.image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})

// ==== edit product end ===== //


// ==== product serach start  ===== //

router.get('/search/:name',(req,res)=>{
  var regex= new RegExp(req.params.name,'i');
  
})


module.exports = router;
