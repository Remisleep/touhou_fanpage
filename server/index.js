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

app.get('/scoreblog/', async (req, res) => {
    var posts = BlogPost.find({}, (error, result) => {
        if(error) {
            console.log(error);
            res.sendStatus(500);
        }
        console.log(result);
        res.render('scoreblog', {data: req.session, postset: result});
    });
});

app.get('/scoreblog/write', (req, res) => {
    res.render('writing', {data: req.session, draft: {}});
    console.log("I'm writing a post now");
});

app.get('/scoreblog/:id/', (req,res) => {
    console.log(req.params.id);
    var searchID = req.params.id;
    BlogPost.findById(searchID, (error, result) => {
        if(error) {
            res.redirect('/scoreblog/');
        }
        else if(!result) {
            res.status(404);
        }
        else {
            res.render('entry', {data: req.session, entry: result});
        }
    })
});

app.post('/scoreblog/writepost', async (req, res) => {
    console.log(req.body);
    try{
        let newPost = new BlogPost(req.body);
        await newPost.save();
        res.redirect('/scoreblog/');
    }
    catch(e){
        res.redirect('/scoreblog/write');
    }
});

app.post('/welcome', (req, res) => {
    req.session.username=req.body.nombre;
    res.send('SUCCESS');
});

app.get('/scoreblog/:id/edit', (req,res) => {
    BlogPost.findById(req.params.id, (error, result)=> {
        if(error){
            res.redirect('/scoreblog/');
        }
        else if(!result){
            res.redirect('/scoreblog/');
        }
        else{
            res.render('writing', {data: req.session, draft: result});
        }
    })
});

app.post('/scoreblog/:id/edit', (req, res)=> {
    BlogPost.findById(req.params.id, (error, result)=> {
        if(error){
            console.log(error);
            res.status(500);
        }
        else if(result) {
            result.title = req.body.title;
            result.body = req.body.body;
            result.save();
            res.redirect('/scoreblog/');
        }
        else { 
            res.redirect('/scoreblog/');
        }
    });
});

app.get('/scoreblog/:id/delete', (req, res)=> {
    BlogPost.deleteOne({_id: req.params.id}, (error, result)=> {
        if(error){
            console.log(error);
        }
        res.redirect('/scoreblog/');
    });
});