var express = require('express');
var jwt_decode = require('jwt-decode');
// var isLoggedIn = require('../utils/isLoggedIn');
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET home page. */
router.get('/app-calendar', function (req, res, next) {
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
        const todoRef = usersRef.collection('todos')
        const notificationRef = db.collection('notifications')
        const doc = await usersRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();
        const todos = await todoRef.get();

        const notification_list = []
        const todo_list = []

        notifications.forEach(_doc => {

          // console.log(progress);
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        todos.forEach(_doc => {
          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // console.log(_doc.id, '=>', _doc.data());
        });

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());
          res.render('app-calendar', {
            title: 'To-do List Calendar',
            header: "Calendar",
            user: doc.data(),
            admin: decoded.admin,
            todo_list: todo_list,
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


router.get('/todo-list', function (req, res, next) {
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
        const todoRef = usersRef.collection('todos')
        const notificationRef = db.collection('notifications')
        const doc = await usersRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();
        const todos = await todoRef.get();

        const notification_list = []
        const todo_list = []

        notifications.forEach(_doc => {

          // console.log(progress);
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        todos.forEach(_doc => {
          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // console.log(_doc.id, '=>', _doc.data());
        });

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());
          // res.render('app-calendar', {
          //   title: 'To-do List Calendar',
          //   header: "Calendar",
          //   user: doc.data(),
          //   admin: decoded.admin,
          //   todo_list: todo_list,
          //   notification_list: notification_list
          // });

          res.send(todo_list)
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
