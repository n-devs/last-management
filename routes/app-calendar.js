const express = require('express');
const router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET app-calendar page. */
router.get('/app-calendar', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
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

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        todos.forEach(_doc => {
          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })
        });

        if (!doc.exists) {
          res.redirect('/login')
        } else {
          res.render('app-calendar', {
            title: 'To-do List Calendar',
            header: "Calendar",
            user: doc.data(),
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

/* GET todo-list. */
router.get('/todo-list', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...

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

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        todos.forEach(_doc => {
          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })
        });

        if (!doc.exists) {

          res.redirect('/login')
          
        } else {

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
