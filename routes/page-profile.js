var express = require('express');
var jwt_decode = require('jwt-decode');
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET home page. */
router.get('/page-profile', function (req, res, next) {
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
        const notificationRef = db.collection('notifications')

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
          // console.log('Document data:', doc.data());
          res.render('page-profile', {
            title: ':: To-do list :: Page Profile',
            header: "My Profile",
            user: doc.data(),
            admin: decoded.admin,
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

router.post('/update-profile', function (req, res, next) {
  // const { companyName, mobileNumber, email } = req.body;

  console.log(req.body);
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        console.log(uid);
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());
         
          await usersRef.update(req.body);
          // res.render('app-setting', {
          //   title: ':: To-do list:: App Settings',
          //   header: "Settings",
          //   user: doc.data() ,
          //   isvalid: false,
          //   message: ""
          // });
          res.redirect("/page-profile")

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
