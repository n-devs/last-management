const express = require('express');
const router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET page-profile. */
router.get('/page-profile', function (req, res, next) {
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
          res.render('page-profile', {
            title: ':: To-do list :: Page Profile',
            header: "My Profile",
            user: doc.data(),
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

/* POST update-profile. */
router.post('/update-profile', function (req, res, next) {

  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...

        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();

        if (!doc.exists) {
          res.redirect('/login')
        } else {
          await usersRef.update(req.body);
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
