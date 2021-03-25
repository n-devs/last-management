var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var registerRouter = require('./routes/register');
var pageProfileRouter = require('./routes/page-profile');
var pageSearchRouter = require('./routes/page-search');
var appContactRouter = require('./routes/app-contact');
var appChatRouter = require('./routes/app-chat');
var appCalendarRouter = require('./routes/app-calendar');
var projectListRouter = require('./routes/project-list');
var projectTaskboardRouter = require('./routes/project-taskboard');
var projectTodoRouter = require('./routes/project-todo');
var forgotPasswordRouter = require('./routes/forgot-password');
var appSettingRouter = require('./routes/app-setting');
// var isLoggedIn =require('./utils/isLoggedIn')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', [
  indexRouter, usersRouter, loginRouter,
  registerRouter, forgotPasswordRouter, pageProfileRouter,
  logoutRouter, pageSearchRouter, appCalendarRouter,
  appContactRouter, appChatRouter,projectListRouter,
  projectTaskboardRouter,projectTodoRouter,appSettingRouter
]);
// app.use('/', [loginRouter,registerRouter,forgotPasswordRouter]);
// app.use('/users', usersRouter);
// app.use('/login', loginRouter);
// app.use('/register', registerRouter);
// app.use('/forgot-password', forgotPasswordRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
