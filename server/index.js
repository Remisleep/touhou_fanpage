const express = require('express');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

//Navagation
const clientPath = path.join(__dirname, '../client/');
const staticPath = path.join(clientPath, '/static/');
const viewsPath = path.join(clientPath, '/views/');

//Basic Server
const app = express();
app.use(express.static(staticPath));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    name: 'bullet',
    secret: 'easierthanitlooks',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000*60*60*24*3,
    }
}));

app.listen(2000);

//Setting Views
app.set('view engine', 'ejs');
app.set('views', viewsPath);

//Visitor Counter
var x = 0;
const counter = function(req, res, next){
    x++;
    console.log(x);
    next();
}
//app.use(counter);


//Routes

app.get('/', function(req, res) {
    res.render('index', {data: req.session});
});

app.get('/gameplay', function (req, res) {
    res.render('gameplay', {data: req.session});
});

app.get('/scoreblog', function (req, res) {
    res.render('scoreblog', {data: req.session});
});

app.get('/writing', function (req, res) {
    res.render('writing', {data: req.session});
});

app.get('/scoreblog/entry', function (req, res) {
    res.render('entry', {data: req.session, entry: {}});
});

app.post('/welcome', (req, res) => {
    console.log(req.body);
    req.session.username=req.body.nombre;
    res.send('SUCCESS');
});

app.post('/writeblogpost', (req, res)=> {
    console.log(req.body);
    res.redirect('/');
});