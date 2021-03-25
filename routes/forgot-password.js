var express = require('express');
var router = express.Router();
const ConnectService = require('../utils/connectService')
/* GET users listing. */
router.get('/forgot-password', function (req, res, next) {

  res.render('forgot-password', { title: 'Forgot Password', isvalid: false, message: ""  });
})

router.post('/forgot-password', function (req, res, next) {
  const { email } = req.body;
  // res.render('forgot-password', { title: 'Forgot Password' });
  ConnectService().then(service => {

    service.firebase.auth().sendPasswordResetEmail(email).then(function () {

      res.render('forgot-password-completed', { title: 'Forgot Password Completed', isvalid: false, message: ""  });

    }).catch(function (error) {
      // An error happened.

      res.render('forgot-password', { title: 'Forgot Password Error', isvalid: true, message: error.message  });

    });

  });
})

module.exports = router;
