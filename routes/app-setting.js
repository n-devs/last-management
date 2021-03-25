var express = require('express');
var jwt_decode = require('jwt-decode');
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET home page. */
router.get('/app-setting', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...

        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const notificationRef = db.collection('notifications')

        const doc = await usersRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();

        const  notification_list = []

        notifications.forEach(_doc => {

          // console.log(progress);
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })
       
        });
        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          console.log('Document data:', doc.data());
          res.render('app-setting', {
            title: ':: To-do list:: App Settings',
            header: "Settings",
            user: doc.data(),
            admin: decoded.admin,
            isvalid: false,
            message: "",
            notification_list:notification_list
          });
        }


      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });
  })

});

router.post('/update-password', function (req, res, next) {
  const { email, password, newPassword, confirmPassword } = req.body;
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());

          service.firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              // Signed in
              // var user = userCredential.user;
              if (newPassword === confirmPassword) {
                service.firebase.auth().currentUser.updatePassword(newPassword).then(function () {
                  // Update successful.
                  res.render('app-setting', {
                    title: ':: To-do list:: App Settings',
                    header: "Settings",
                    user: doc.data(),
                    admin: decoded.admin,
                    isvalid: false,
                    message: ""
                  });

                }).catch(function (error) {
                  // An error happened.
                  res.render('app-setting', {
                    title: ':: To-do list:: App Settings',
                    header: "Settings",
                    user: doc.data(),
                    admin: decoded.admin,
                    isvalid: true,
                    message: error.message
                  });
                });
              } else {
                res.render('app-setting', {
                  title: ':: To-do list:: App Settings',
                  header: "Settings",
                  user: doc.data(),
                  admin: decoded.admin,
                  isvalid: true,
                  message: "รหัสไม่ตรงกัน"
                });
              }
            }).catch((error) => {
              res.render('app-setting', {
                title: ':: To-do list:: App Settings',
                header: "Settings",
                user: doc.data(),
                admin: decoded.admin,
                isvalid: true,
                message: "รหัสไม่ถูกต้อง"
              });
            })

        }


      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });


  })
})

router.post('/update-company', function (req, res, next) {
  const { companyName, mobileNumber, email } = req.body;


  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());

          if (companyName === '') {
            res.render('app-setting', {
              title: ':: To-do list:: App Settings',
              header: "Settings",
              user: doc.data(),
              admin: decoded.admin,
              isvalid: true,
              message: "กรุนากรอก Company Name"
            });
          } else if (mobileNumber === '') {
            res.render('app-setting', {
              title: ':: To-do list:: App Settings',
              header: "Settings",
              user: doc.data(),
              admin: decoded.admin,
              isvalid: true,
              message: "กรุนากรอก Mobile Number"
            });
          } else if (email === '') {
            res.render('app-setting', {
              title: ':: To-do list:: App Settings',
              header: "Settings",
              user: doc.data(),
              admin: decoded.admin,
              isvalid: true,
              message: "กรุนากรอก Email"
            });
          } else {
            await usersRef.update(req.body);
            // res.render('app-setting', {
            //   title: ':: To-do list:: App Settings',
            //   header: "Settings",
            //   user: doc.data() ,
            //   isvalid: false,
            //   message: ""
            // });
            res.redirect("/app-setting")
          }

        }


      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });


  })

})

module.exports = router;
