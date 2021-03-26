const express = require('express');
const generateRandomString = require('generate-random-string')
const router = express.Router();
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
/* GET home page. */
router.get('/app-contact', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const contactRef = usersRef.collection('contacts')
        const notificationRef = db.collection('notifications')

        const notifications = await notificationRef.where('uid', '==', uid).get();
        const doc = await usersRef.get();
        const snapshot = await contactRef.get();

        const  notification_list = []
        const sub_user = []

        notifications.forEach(_doc => {

          // console.log(progress);
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })
       
        });

        snapshot.forEach(_doc => {
          if (uid === _doc.id) {
            sub_user.push({ ..._doc.data(), ["uid"]: _doc.id, ["myUser"]: true })
          } else {
            sub_user.push({ ..._doc.data(), ["uid"]: _doc.id, ["myUser"]: false })
          }

        });

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          console.log(sub_user);
          res.render('app-contact', {
            title: 'To-do List Contact',
            header: "Contact",
            user: doc.data(),
            contacts: sub_user,
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

router.post('/app-contact', multer.single('avatar'), function (req, res, next) {

  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
        const newuid = generateRandomString(20);
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const contactRef = usersRef.collection('contacts').doc(newuid)
        const doc = await usersRef.get();


        if (!doc.exists) {
          res.redirect('/login')
        } else {

          const storage = service.firebase.storage();
          const bucket = storage.ref();
          const folder = 'profile'
          const fileName = `${folder}/${newuid}`
          const fileUpload = bucket.child(fileName);

          fileUpload.put(req.file.buffer, { contentType: `${req.file.mimetype}` }).then((snapshot) => {

            fileUpload.getDownloadURL().then(url => {

              contactRef.set({
                displayName: req.body.displayName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                address: req.body.address,
                photoURL: url,
              })

              res.redirect('/app-contact')

            });
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

router.delete('/app-contact', function (req, res, next) {

  const { id } = req.query;

  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const contactRef = usersRef.collection('contacts').doc(id)
        const doc = await usersRef.get();
       

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          const storage = service.firebase.storage();
          const bucket = storage.ref();
          const folder = 'profile'
          const fileName = `${folder}/${id}`
          const fileUpload = bucket.child(fileName);


          fileUpload.delete().then(() => {
            // File deleted successfully
            contactRef.delete()

            res.send(true)
            // res.redirect('/app-contact')
          }).catch((error) => {
            // Uh-oh, an error occurred!
            contactRef.delete()
            // res.redirect('/app-contact')
            res.send(true)
          })


        }


      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });
  })

});

module.exports = router;
