const express = require('express');
const router = express.Router();
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
        const db = service.admin.firestore();
        const userRef = db.collection('users').doc(uid);
        const usersRef = db.collection('users')
        const projectRef = userRef.collection('projects')
        const myTodolistRef = userRef.collection('todos')
        const notificationRef = db.collection('notifications')
        const todosRef = db.collection('todos')

        const _user = await userRef.get();
        const users = await usersRef.get();
        const projects = await projectRef.get();
        const todos = await myTodolistRef.get();
        const notifications = await notificationRef.where('uid', '==', uid).get();

        const users_list = []
        const project_list = []
        const todo_list = []
        const notification_list = []

        function Progress(projectId) {
          return new Promise(async (resolve, reject) => {
            const todo = await todosRef.where('projectId', '==', projectId).get();
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
            });

            if (isNaN((todoStatus.length / todoAll.length) * 100)) {
              resolve({ _progress: 0, todos: todoAll.length, title: "Planned" })
            } else {
              if ((todoStatus.length / todoAll.length) * 100 === 100) {
                resolve({ _progress: Math.floor((todoStatus.length / todoAll.length) * 100), todos: todoAll.length, title: "Completed" })
              } else {
                resolve({ _progress: Math.floor((todoStatus.length / todoAll.length) * 100), todos: todoAll.length, title: "In Progress" })
              }

            }

          })

        }

        notifications.forEach(_doc => {

          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });


        todos.forEach(_doc => {

          todo_list.push({ ["uid"]: _doc.id, ..._doc.data() })

        });

        users.forEach(_doc => {
          if (_doc.id !== uid) {
            users_list.push({ ["uid"]: _doc.id, ..._doc.data(), ["owner"]: _user.data() })
          }
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

        if (!_user.exists) {
          res.redirect('/login')
        } else {

          const project = []

          if (project_list.length === 0) {
            res.render('index', {
              title: 'Project Dashboard',
              header: "Dashboard",
              user: _user.data(),
              users_list: users_list,
              project_list: [],
              notification_list: notification_list.length === 0 ? [] : notification_list
            });
          } else {
            project_list.map(_project => {
              Progress(_project.uid).then(_progress => {
                project.push({ ..._project, ["progress"]: `${_progress._progress}`, ["todos"]: _progress.todos, ["title"]: _progress.title })

                if (project.length === project_list.length) {

                  res.render('index', {
                    title: 'Project Dashboard',
                    header: "Dashboard",
                    user: _user.data(),
                    users_list: users_list,
                    project_list: project,
                    notification_list: notification_list,
                    todo_list: todo_list
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
