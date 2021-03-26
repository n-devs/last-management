const express = require('express');
const jwt_decode = require('jwt-decode');
const router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET app-setting. */
router.get('/app-setting', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...

        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const notificationRef = db.collection('notifications')

        const doc = await usersRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();

        const  notification_list = []

        notifications.forEach(_doc => {

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })
       
        });
        if (!doc.exists) {
          res.redirect('/login')
        } else {
          console.log('Document data:', doc.data());
          res.render('app-setting', {
            title: ':: To-do list:: App Settings',
            header: "Settings",
            user: doc.data(),
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

/* POST update-password. */
router.post('/update-password', function (req, res, next) {
  const { email, password, newPassword, confirmPassword } = req.body;
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();
        const notificationRef = db.collection('notifications')
        const notifications = await notificationRef.where('uid', '==', uid).get();

        const  notification_list = []

        notifications.forEach(_doc => {

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })
       
        });
        if (!doc.exists) {
          res.redirect('/login')
        } else {

          service.firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
              // Signed in
              if (newPassword === confirmPassword) {
                service.firebase.auth().currentUser.updatePassword(newPassword).then(function () {
                  // Update successful.
                  res.render('app-setting', {
                    title: ':: To-do list:: App Settings',
                    header: "Settings",
                    user: doc.data(),
                    isvalid: false,
                    message: "",
                    notification_list:notification_list
                  });

                }).catch(function (error) {
                  // An error happened.
                  res.render('app-setting', {
                    title: ':: To-do list:: App Settings',
                    header: "Settings",
                    user: doc.data(),
                    isvalid: true,
                    message: error.message,
                    notification_list:notification_list
                  });
                });
              } else {
                res.render('app-setting', {
                  title: ':: To-do list:: App Settings',
                  header: "Settings",
                  user: doc.data(),
                  isvalid: true,
                  message: "รหัสไม่ตรงกัน",
                  notification_list:notification_list
                });
              }
            }).catch((error) => {
              res.render('app-setting', {
                title: ':: To-do list:: App Settings',
                header: "Settings",
                user: doc.data(),
                isvalid: true,
                message: "รหัสไม่ถูกต้อง",
                notification_list:notification_list
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

/* POST update-company. */
router.post('/update-company', function (req, res, next) {
  const { companyName, mobileNumber, email } = req.body;


  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();

        if (!doc.exists) {
          res.redirect('/login')
        } else {

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
