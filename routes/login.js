var express = require('express');
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET login. */
router.get('/login', function (req, res, next) {

  res.render('login', { title: 'Todolist Login', isvalid: false, message: "" });
});

router.post('/login', function (req, res, next) {

  const { email, password, check } = req.body;

  if (typeof email === "undefined" || email === "") {
    res.render('login', { title: 'Todolist Login', isvalid: true, message: "กรุณากรอกอีเมล์" });
  } else if (typeof password === "undefined" || password === "") {
    res.render('login', { title: 'Todolist Login', isvalid: true, message: "กรุณากรอกรหัสผ่าน" });
  } else if (password.length < 7) {
    res.render('login', { title: 'Todolist Login', isvalid: true, message: "กรุณากรอกรหัสผ่านมากกว่า 8 ตัว" });
  } else if (typeof check === "undefined") {
    res.render('login', { title: 'Todolist Login', isvalid: true, message: "กรุณากรอกกดยอมรับเงื่อนไข" });
  } else {
    ConnectService().then(service => {
      service.firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in
          // ...
          res.redirect('/')
        })
        .catch((error) => {
          res.render('login', { title: 'Todolist Login', isvalid: true, message: error.message });
        });


    }).catch(error => {

      switch (error.statusCode) {
        case 500:
          res.render('login', { title: 'Todolist Login', isvalid: true, message: error.error });
          break;

        default:
          res.render('login', { title: 'Todolist Login', isvalid: true, message: error.error });
          break;
      }
    })
  }

});



module.exports = router;
