const connectService = require("./connectService");
// const getIdToken =require('./getIdToken')

//เช็คว่าทำการเข้าสู่ระบบมาหรือยัง?
function isLoggedIn(url) {

  return (req, res, next) => {
    connectService().then(service => {
      if (req.url == url) {
        service.firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            var uid = user.uid;
            // ...
            res.redirect(url);
          } else {
            // User is signed out
            // ...
            res.redirect("/login");
          }
        });
      } else {
        res.redirect("/login");
      }
    })

  };
}

module.exports = isLoggedIn