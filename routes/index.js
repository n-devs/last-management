var express = require('express');
var jwt_decode = require('jwt-decode');
// var isLoggedIn = require('../utils/isLoggedIn');
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET home page. */

router.get('/', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {

  
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        // const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const userRef = db.collection('users').doc(uid);
        const usersRef = db.collection('users')
        const projectRef = userRef.collection('projects')
        const notificationRef = db.collection('notifications')
        const todosRef = db.collection('todos')
        const _user = await userRef.get();

        const users = await usersRef.get();

        const projects = await projectRef.get();

        const notifications = await notificationRef.where('uid', '==', uid).get();

        const users_list = []
        const project_list = []

        const notification_list = []

        function Progress(projectId) {
        console.log("projectId",projectId);
          return new Promise(async (resolve, reject) => {
            const todo = await todosRef.where('projectId', '==', projectId).get();
            // console.log(_doc.id, '=>', _doc.data());
            const todoAll = []
            const todoStatus = []
            todo.forEach(docTodo => {


              todoAll.push({
                id: docTodo.id,
                ...docTodo.data()
              })

              if (docTodo.data().status === true) {
                todoStatus.push({
                  id: docTodo.id,
                  ...docTodo.data()
                })
              }
              // console.log(docTodo.id, '=>', docTodo.data());
            });

            if (isNaN((todoStatus.length / todoAll.length) * 100)) {
              resolve({ _progress: 0, todos: todoAll.length, title: "Planned" })
            } else {
              if ((todoStatus.length / todoAll.length) * 100 === 100) {
                resolve({ _progress: (todoStatus.length / todoAll.length) * 100, todos: todoAll.length, title: "Completed" })
              } else {
                resolve({ _progress: (todoStatus.length / todoAll.length) * 100, todos: todoAll.length, title: "In Progress" })
              }

            }

          })

        }

        notifications.forEach(_doc => {

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        users.forEach(_doc => {
          if (_doc.id !== uid) {
            users_list.push({ ["uid"]: _doc.id, ..._doc.data(), ["owner"]: _user.data() })
          }
        });

        projects.forEach(_doc => {
          project_list.push({ ["uid"]: _doc.id, ..._doc.data() })
        });




        if (!_user.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {

          const project = []

          if(project_list.length === 0) {
            res.render('index', {
              title: 'Project Dashboard',
              header: "Dashboard",
              user: _user.data(),
              // admin: decoded.admin,
              users_list: users_list,
              project_list: [],
              notification_list: notification_list.length === 0 ? []:notification_list
            });
          }else{
            project_list.map(_project => {
              Progress(_project.uid).then(_progress => {
                project.push({ ..._project, ["progress"]: `${_progress._progress}`, ["todos"]: _progress.todos, ["title"]: _progress.title })
                // console.log(_progress);
                console.log(5);
                if (project.length === project_list.length) {

                  console.log(notification_list);
                  console.log(6);
                  res.render('index', {
                    title: 'Project Dashboard',
                    header: "Dashboard",
                    user: _user.data(),
                    // admin: decoded.admin,
                    users_list: users_list,
                    project_list: project,
                    notification_list: notification_list
                  });
                }
              })
            })
          }
      
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
