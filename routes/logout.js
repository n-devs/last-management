var express = require('express');
var router = express.Router();
const ConnectService = require('../utils/connectService')
/* GET users listing. */
router.delete('/logout', function (req, res, next) {
  console.log(1);
  ConnectService().then(service => {
    console.log(2);
    service.firebase.auth().signOut().then(() => {
      // Sign-out successful.
      console.log(3);
      res.send({
        message: "logout ok!",
        success: true,
        authStatus: false
      })
    }).catch((error) => {
      // An error happened.
      console.log(4);
      res.send({
        message: "logout error!",
        success: false,
        authStatus: true
      })
    });
  })


});

module.exports = router;
