var express = require('express');
var jwt_decode = require('jwt-decode');
var router = express.Router();
const ConnectService = require('../utils/connectService')
require('firebase/database');

/* GET home page. */
router.get('/app-chat', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        // console.log(user);
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
          res.render('app-chat', {
            title: ':: To-do List :: Chat',
            header: "Chat",
            uid: uid,
            user: doc.data(),
            admin: decoded.admin,
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

router.post('/app-chat', function (req, res, next) {
  console.log(req.body);
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        // console.log(user);
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const doc = await usersRef.get();
        const myDataRef = service.firebase.database().ref('chat');
        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());
          myDataRef.push(req.body)
          res.send(true)
          // res.render('app-chat', {
          //   title: ':: To-do List :: Chat',
          //   header: "Chat",
          //   user: doc.data(),
          //   admin: decoded.admin,
          //   chat: service.database().ref('chat')
          // });
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
