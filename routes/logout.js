var express = require('express');
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* DELETE logout. */
router.delete('/logout', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().signOut().then(() => {
      // Sign-out successful.
      res.send({
        message: "logout ok!",
        success: true,
        authStatus: false
      })
    }).catch((error) => {
      // An error happened.
      res.send({
        message: "logout error!",
        success: false,
        authStatus: true
      })
    });
  })


});

module.exports = router;
