const express = require('express');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose  = require('mongoose');
const {BlogPost} = require('./models.js');

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
    var posts = BlogPost.find({}, (error, result) => {
        if(error) {
            console.log(error);
            res.sendStatus(500);
        }
        console.log(posts);
        res.render('scoreblog', {data: req.session, postset: result});
    });
});

app.get('/scoreblog/writing', async (req, res) => {
    res.render('writing', {data: req.session, draft: {}});
});

app.get('/blog/:id', async (req,res) => {
    console.log("step 1");
    var searchID = '';
    console.log("step 2");
    BlogPost.findById({_id: searchID}, (error, result) => {
        if(error) {
            console.log("step 3: error");
            res.redirect('/scoreblog/');
        }
        else if(!result) {
            console.log("step 3: not found");
            res.redirect('/scoreblog/');
        }
        else {
            console.log("step 3: good");
            res.render('entry', {data: req.session, entry: result});
            console.log("step 4");
        }
    })
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

app.put('/blog/update', (req, res)=> {
    console.log(req);
    res.redirect('/scoreblog/')
});

app.delete('/blog/delete', (req, res)=> {
    console.log(req);
    res.redirect('/scoreblog/')
});