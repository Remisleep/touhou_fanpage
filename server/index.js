const express = require('express');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose  = require('mongoose');
const { BlogPost } = require('./models.js');

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

mongoose.connect('mongodb://localhost:27017/scores', {useNewUrlparser: true});
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

app.get('/scoreblog/', (req, res) => {
    res.render('scoreblog', {data: req.session});
});

app.get('/scoreblog/writing', (req, res) => {
    res.render('writing', {data: req.session, draft: {}});
});

app.post('/scoreblog/writepost', async (req, res) => {
    console.log(req.body);
    let newPost = new BlogPost(req.body);
    //console.log(user);
    await newPost.save();
    res.redirect('/scoreblog/');
});

app.post('/welcome', (req, res) => {
    req.session.username=req.body.nombre;
    res.send('SUCCESS');
});