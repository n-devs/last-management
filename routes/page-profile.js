const express = require('express');
const router = express.Router();
const generateRandomString = require('generate-random-string')
const ConnectService = require('../utils/connectService')
const Multer = require('multer');

require('firebase/storage');
global.XMLHttpRequest = require("xhr2");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

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

        const notification_list = []

        notifications.forEach(_doc => {

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        if (!doc.exists) {
          res.redirect('/login')
        } else {
          res.render('page-profile', {
            title: ':: To-do list :: Page Profile',
            header: "My Profile",
            uid: doc.id,
            user: doc.data(),
            notification_list: notification_list

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
router.post('/update-profile',multer.single('photoURL'), function (req, res, next) {

  ConnectService().then(async service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User

      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });
    console.log(req.body);
    let uid = req.body.uid;
    // ...
    const newuid = generateRandomString(20);
    const db = service.admin.firestore();
    const usersRef = db.collection('users').doc(uid);
    const doc = await usersRef.get();

    if (!doc.exists) {
      res.redirect('/login')
    } else {
      const storage = service.firebase.storage();
      const bucket = storage.ref();
      const folder = 'profile'
      const fileName = `${folder}/${newuid}`
      const fileUpload = bucket.child(fileName);

      if (typeof req.file === "undefined") {
        req.body.photoURL = doc.data().photoURL;
        await usersRef.update(req.body);
        res.redirect("/page-profile")
      } else {
        fileUpload.put(req.file.buffer, { contentType: `${req.file.mimetype}` }).then((snapshot) => {

          fileUpload.getDownloadURL().then(async url => {
            req.body.photoURL = url;
            await usersRef.update(req.body);
            res.redirect("/page-profile")
          })
        })
      }

    }
  })
})


module.exports = router;
