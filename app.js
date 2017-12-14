var settings = require("./settings.json");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var database = require("./services/database.js");
var linesRepository = require("./repositories/linesRepository.js");
var minecraft = require("./services/minecraft.js");

var connection = require('./routes/connection.js');
var lineRouter = require("./routes/line.js");
var propertiesRouter = require("./routes/properties.js");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// データ リポジトリ
app.use(function (req, res, next) {
    req.minecraft = minecraft;
    req.line = linesRepository;
    // req.block = block;
    // req.entity = entity;
    next();
});

app.use('/repositories/connection', connection);
app.use("/repositories/lines", lineRouter);
app.use("/repositories/properties", propertiesRouter);
app.get("/", (req, res) => {
    res.render("linePage", {
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
