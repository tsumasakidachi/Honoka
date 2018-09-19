// Standard Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Settings
var settings = require('./settings.json');

// Database
var mysql = require('mysql').createConnection(
    {
        host: settings.database.host,
        user: settings.database.user,
        password: settings.database.password,
        database: settings.database.database,
        charset: 'utf8mb4'
    });

// Modules
var lineRepository = require('./repositories/lineRepository.js')(mysql);
var minecraftServiceProxy = require('./services/minecraftServiceProxy.js')(lineRepository);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// データ リポジトリ
app.use(function (req, res, next) {
    req.minecraft = minecraftServiceProxy;
    req.line = lineRepository;

    next();
});

// ルーティング
var reposRouter = require('./routes/reposRouter.js');
app.use('/.repos', reposRouter);

app.get('/', (req, res) => {
    res.render('mainPage', {
        userName: req.minecraft.userName,
        hostName: req.minecraft.hostName
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('errorPage');
});

module.exports = app;
