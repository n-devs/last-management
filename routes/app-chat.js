const express = require('express');
const router = express.Router();
const ConnectService = require('../utils/connectService')
require('firebase/database');

/* GET app-chat */
router.get('/app-chat', function (req, res, next) {
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
          res.render('app-chat', {
            title: ':: To-do List :: Chat',
            header: "Chat",
            uid: uid,
            user: doc.data(),
            service: service,
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
/* POST app-chat */
router.post('/app-chat', function (req, res, next) {
  console.log(req.body);
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
        const myDataRef = service.firebase.database().ref('chat');

        if (!doc.exists) {
          res.redirect('/login')
        } else {
          myDataRef.push(req.body)
          res.send(true)

        }


      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });
  })

});

router.get('/message', function (req, res, next) {
  ConnectService().then(service => {
    const myDataRef = service.firebase.database().ref('chat');

    myDataRef.on('child_added', (data) => {
      res.send(data)
    });
  })
})

module.exports = router;
