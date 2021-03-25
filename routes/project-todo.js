var express = require('express');
var jwt_decode = require('jwt-decode');
const generateRandomString = require('generate-random-string')
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET home page. */
router.get('/project-todo', function (req, res, next) {
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
        const todoRef = usersRef.collection('todos')
        const projectRef = usersRef.collection('projects')
        const notificationRef = db.collection('notifications')

        const doc = await usersRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();
        const todos = await todoRef.get();
        const projects = await projectRef.get();

        const todo_list = []
        const project_list = []
        const  notification_list = []

        notifications.forEach(_doc => {

          // console.log(progress);
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        todos.forEach(_doc => {
          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // console.log(_doc.id, '=>', _doc.data());
        });

        projects.forEach(_doc => {
          project_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // console.log(_doc.id, '=>', _doc.data());
        });


        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log('Document data:', doc.data());
          res.render('project-todo', {
            title: ':: To-do list :: Project Todo',
            header: "Todo List",
            uid: doc.id,
            user: doc.data(),
            admin: decoded.admin,
            project_list: project_list,
            todo_list: todo_list,
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

router.post('/project-todo', function (req, res, next) {
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
        const todoRef = db.collection('todos')
        const userTodoRef = usersRef.collection('todos')
        const doc = await usersRef.get();

        const todos = await todoRef.get();

        const project_list = []

        req.body.status = false

        todos.forEach(_doc => {
          project_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // console.log(_doc.id, '=>', _doc.data());
        });

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          req.body.owner = doc.data()
          // console.log(req.body);
          const newMultiFactorUserUid = generateRandomString(28)
          todoRef.doc(newMultiFactorUserUid).set(req.body)
          userTodoRef.doc(newMultiFactorUserUid).set(req.body)
          res.send(true)
          // console.log('Document data:', doc.data());
          // res.render('project-todo', {
          //   title: ':: To-do list :: Project Todo',
          //   header: "Todo List",
          //   uid:doc.id,
          //   user: doc.data(),
          //   admin: decoded.admin,
          //   project_list: project_list
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


router.put('/project-todo', function (req, res, next) {
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
        const todoRef = db.collection('todos')
        const userTodoRef = usersRef.collection('todos')
        const doc = await usersRef.get();

        if (!doc.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // req.body.owner = doc.data()
          console.log(req.body);
          // const newMultiFactorUserUid = generateRandomString(28)
          todoRef.doc(req.body.id).update({ status: req.body.status })
          userTodoRef.doc(req.body.id).update({ status: req.body.status })
          res.send(req.body.status)
          // console.log('Document data:', doc.data());
          // res.render('project-todo', {
          //   title: ':: To-do list :: Project Todo',
          //   header: "Todo List",
          //   uid:doc.id,
          //   user: doc.data(),
          //   admin: decoded.admin,
          //   project_list: project_list
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

module.exports = router;
