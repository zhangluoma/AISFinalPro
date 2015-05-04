var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



//========upload code===========================
var db = require('dbHelper'),
    http = require('http'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');

app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = files.file.name.split('.')[0],
            new_path = path.join(process.env.PWD, '/public/uploads/', file_name + '.' + file_ext),
            roomNmber = fields.roomNumber;

        //add to db
        var addFiletoTable = function(){
          db.query("insert into file(roomnumber,filename) values('"+roomNmber+"','"+file_name+"."+file_ext+"')",function(error,results){});
        };
        //test
        var select_all_file_by_roomnumber = function(){
          db.query("select * from file where roomnumber = '"+roomNmber+"'",function(error,results){
            console.log(results);
            console.log("just printed the sql select result.");
          });
        };
        addFiletoTable();
        select_all_file_by_roomnumber();

        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'fail': false});
                    } else {
                        res.status(200);
                        res.redirect("dashboard");
                    }
                });
            });
        });
    });



});
//=============================================




// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'uwotm8' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
