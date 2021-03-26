const express = require('express');
const generateRandomString = require('generate-random-string')
const bcrypt = require('bcrypt')
const router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET users listing. */
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'To-do list Register', isvalid: false, message: "" });
});

/* POST register. */
router.post('/register', function (req, res, next) {
  const { displayName, email, password, check } = req.body;

  if (typeof displayName === "undefined" || displayName === "") {
    res.render('register', { title: 'To-do list Register', isvalid: true, message: "กรุณากรอกชื่อ" });
  } else if (typeof email === "undefined" || email === "") {
    res.render('register', { title: 'To-do list Register', isvalid: true, message: "กรุณากรอกอีเมล์" });
  } else if (typeof password === "undefined" || password === "") {
    res.render('register', { title: 'To-do list Register', isvalid: true, message: "กรุณากรอกรหัสผ่าน" });
  } else if (password.length < 7) {
    console.log(password.length);
    res.render('register', { title: 'To-do list Register', isvalid: true, message: "กรุณากรอกรหัสผ่านมากกว่า 8 ตัว" });
  } else if (typeof check === "undefined") {
    res.render('register', { title: 'To-do list Register', isvalid: true, message: "กรุณากรอกกดยอมรับเงื่อนไข" });
  } else {

    const newMultiFactorUserUid = generateRandomString(28)
    const now = new Date().toUTCString()
    const data = {
      uid: newMultiFactorUserUid,
      displayName: displayName,
      email: email,
      photoURL: `assets/images/sm/avatar${Math.floor(Math.random() * 8) + 1}.jpg`,
      emailVerified: true,
      disabled: false,
      customClaims: { admin: true },
      passwordHash: Buffer.from(bcrypt.hashSync(password, 10)),
      tokensValidAfterTime: now,
      metadata: {
        lastSignInTime: now,
        creationTime: now,
        lastRefreshTime: now
      }
    }

    ConnectService().then(service => {
      service.firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
        res.render('register', { title: 'To-do list Register error', isvalid: true, message: "มีบัญชีนี้อยู่แล้ว" })
      }).catch(error => {
        service.admin
          .auth()
          .importUsers([
            {
              uid: newMultiFactorUserUid,
              displayName: displayName,
              email: email,
              emailVerified: true,
              disabled: false,
              customClaims: { admin: true },
              // phoneNumber: phoneNumber,
              passwordHash: Buffer.from(bcrypt.hashSync(password, 10)),
              tokensValidAfterTime: now,
              metadata: {
                lastSignInTime: now,
                creationTime: now,
                lastRefreshTime: now
              }
            }
          ], {
            hash: {
              algorithm: 'BCRYPT'
            }

          }).then(results => {
            results.errors.forEach(indexedError => {
              res.render('register', { title: 'To-do list Register error', isvalid: true, message: "error regoster" });
            })
            const db = service.admin.firestore();

            db.collection('users').doc(newMultiFactorUserUid).set(data);

            res.render('register-completed', { title: 'Register Completed', isvalid: false, message: "" });
          }).catch(error => {
            res.render('register', { title: 'To-do list Register error', isvalid: true, message: error.message });
          })
      })
    })
  }
});

module.exports = router;
