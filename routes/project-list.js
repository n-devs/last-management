var express = require('express');
var jwt_decode = require('jwt-decode');
const generateRandomString = require('generate-random-string')
var router = express.Router();
const ConnectService = require('../utils/connectService')

/* GET home page. */
router.get('/project-list', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
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

        const  notification_list = []

        function Progress(projectId) {

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

          // console.log(progress);
          notification_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // // ,["progress"]: (todoStatus.length / todoAll.length) *100
          // console.log(todoStatus.length, todoAll.length, todo.length);


        });

        users.forEach(_doc => {
          if (_doc.id !== uid) {
            users_list.push({ ["uid"]: _doc.id, ..._doc.data(), ["owner"]: _user.data() })
          }

          // console.log(_doc.id, '=>', _doc.data());
        });

        projects.forEach(_doc => {


          // console.log(progress);
          project_list.push({ ["uid"]: _doc.id, ..._doc.data() })
          // // ,["progress"]: (todoStatus.length / todoAll.length) *100
          // console.log(todoStatus.length, todoAll.length, todo.length);


        });

       


        if (!_user.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          // console.log(project_list);
          // console.log('Document data:', users_list);
          // const progress = []
          const project = []

          if(project_list.length === 0) {
            res.render('project-list', {
              title: ':: To-do list :: Project List',
              header: "Project",
              user: _user.data(),
              admin: decoded.admin,
              users_list: users_list,
              project_list: project,
              notification_list:notification_list
            });
          }else{
            project_list.map(_project => {
              Progress(_project.uid).then(_progress => {
                project.push({ ..._project, ["progress"]: `${_progress._progress}`,["todos"]:_progress.todos })
                // console.log(_progress);
  
                if(project.length === project_list.length) {
                  console.log(notification_list);
  
                  res.render('project-list', {
                    title: ':: To-do list :: Project List',
                    header: "Project",
                    user: _user.data(),
                    admin: decoded.admin,
                    users_list: users_list,
                    project_list: project,
                    notification_list:notification_list
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

router.get('/user-list', function (req, res, next) {
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const userRef = db.collection('users').doc(uid);
        const usersRef = db.collection('users')
        const _user = await userRef.get();

        const users = await usersRef.get();

        const users_list = []

        users.forEach(_doc => {
          if (_doc.id !== uid) {
            users_list.push({ ["uid"]: _doc.id, ..._doc.data(), ["owner"]: _user.data() })
          }

          // console.log(_doc.id, '=>', _doc.data());
        });

        if (!_user.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          console.log('Document data:', users_list);
          // res.render('project-list', {
          //   title: ':: To-do list :: Project List',
          //   header: "Project",
          //   user: _user.data(),
          //   admin: decoded.admin,
          //   users_list: users_list

          // });

          res.send(users_list)
        }


      } else {
        // User is signed out
        // ...
        res.redirect('/login')
      }
    });
  })

});

router.post('/project-list', function (req, res, next) {

  console.log(req.body);
  ConnectService().then(service => {
    service.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        var uid = user.uid;
        // ...
        const decoded = jwt_decode(user._lat)
        const db = service.admin.firestore();
        const userRef = db.collection('users').doc(uid);
        const usersRef = db.collection('users')
        const projectRef = db.collection('projects')
        const notificationRef = db.collection('notifications')
        const userProjectRef = userRef.collection('projects')
        const _user = await userRef.get();

        const users = await usersRef.get();

        const users_list = []

        users.forEach(_doc => {
          if (_doc.id !== uid) {
            users_list.push({ ["uid"]: _doc.id, ..._doc.data(), ["owner"]: _user.data() })
          }

          // console.log(_doc.id, '=>', _doc.data());
        });

        if (!_user.exists) {
          // console.log('No such document!');
          res.redirect('/login')
        } else {
          const newMultiFactorUserUid = generateRandomString(28)
          // console.log('Document data1:',users_list);
          projectRef.doc(newMultiFactorUserUid).set(req.body)
          userProjectRef.doc(newMultiFactorUserUid).set(req.body)
        

          req.body.users.map((__user) => {
  
            usersRef.doc(__user.uid).collection('projects').doc(newMultiFactorUserUid).set(req.body)
            notificationRef.doc().set({
              uid:__user.uid,
              title: `New Project ${req.body.projectName}`,
              detail: `create by ${req.body.owner.displayName}`,
              photoURL : req.body.owner.photoURL
            });
          })
          res.send(true)
          // res.render('project-list', {
          //   title: ':: To-do list :: Project List',
          //   header: "Project",
          //   user: _user.data(),
          //   admin: decoded.admin,
          //   users_list: JSON.stringify(users_list)

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
