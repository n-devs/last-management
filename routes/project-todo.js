const express = require('express');
const generateRandomString = require('generate-random-string')
const router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET project-todo. */
router.get('/project-todo', function (req, res, next) {
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
        const projectRef = usersRef.collection('projects')
        const notificationRef = db.collection('notifications')

        const doc = await usersRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();
        const todos = await todoRef.get();
        const projects = await projectRef.get();

        const todo_list = []
        const project_list = []
        const notification_list = []

        notifications.forEach(_doc => {
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        todos.forEach(_doc => {
          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })
        });

        projects.forEach(_doc => {
          const _u = []
          _doc.data().users.map(async _myUser => {
            const myUser = await db.collection('users').doc(_myUser.uid).get();
            _u.push(myUser.data())
            //  console.log('myUser',myUser.data());
          })
          project_list.push({ ["uid"]: _doc.id, ..._doc.data(), ["users"]: _u })
        });


        if (!doc.exists) {
          res.redirect('/login')
        } else {
          res.render('project-todo', {
            title: ':: To-do list :: Project Todo',
            header: "Todo List",
            uid: doc.id,
            user: doc.data(),
            project_list: project_list,
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

/* POST project-todo. */
router.post('/project-todo', function (req, res, next) {
  ConnectService().then(async service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        res.redirect('/login')
      }
    });

  console.log(req.body);
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    let uid = req.body.ownerId;
    // ...
    const db = service.admin.firestore();
    const usersRef = db.collection('users').doc(uid);
    const todoRef = db.collection('todos')
    const userTodoRef = usersRef.collection('todos')
    const doc = await usersRef.get();

    const todos = await todoRef.get();

    const project_list = []

    req.body.status = false

    todos.forEach(_doc => {
      project_list.push({ ["uid"]: _doc.id, ..._doc.data() })
    });

    if (!doc.exists) {
      res.redirect('/login')
    } else {
      req.body.owner = doc.data()
      const newMultiFactorUserUid = generateRandomString(28)
      todoRef.doc(newMultiFactorUserUid).set(req.body)
      userTodoRef.doc(newMultiFactorUserUid).set(req.body)
      res.send(true)

    }

  })

});

/* PUT project-todo. */
router.put('/project-todo', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        let uid = user.uid;
        // ...
        const db = service.admin.firestore();
        const usersRef = db.collection('users').doc(uid);
        const todoRef = db.collection('todos')
        const userTodoRef = usersRef.collection('todos')
        const doc = await usersRef.get();

        if (!doc.exists) {
          res.redirect('/login')
        } else {
          todoRef.doc(req.body.id).update({ status: req.body.status })
          userTodoRef.doc(req.body.id).update({ status: req.body.status })
          res.send(req.body.status)

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
