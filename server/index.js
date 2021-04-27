const express = require('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const mongoose  = require('mongoose');
const {BlogPost} = require('./models.js');
const bcrypt = require('bcrypt');

//Navagation
const clientPath = path.join(__dirname, '../client/');
const staticPath = path.join(clientPath, '/static/');
const viewsPath = path.join(clientPath, '/views/');

//Basic Server
const app = express();
app.use(express.static(staticPath));
app.use(express.urlencoded({extended: true}));
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

app.use((req, res, next)=> {
    console.log(req.originalUrl);
    next();
});

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

app.post('/welcome', (req, res) => {
    req.session.username=req.body.nombre;
    res.send('SUCCESS');
});


//Login Routes

app.get('/register', (req, res)=> {
    res.render('register', {data: req.session});
});

app.get('/login', (req, res)=> {
    res.render('login', {data: req.session});
});

app.post('/register', async (req, res)=> {
    console.log(req.body);
    
    try {
        let rawpass = req.body.password;
        var hashedpass = await bcrypt.hash(rawpass, 10);
        var User = new User(req.body);
        User.password = hashedpass;
        await User.save();
        res.redirect('/login');
    }
    catch(e) {
        console.log(e);
        res.send("Unable to register");
    }
});

app.post('/login', (req, res)=> {
    console.log(req.body);
    User.findOne({username: req.body.username}, async (error, result)=>{
        if(error) {
            console.log(error);
            res.send("!");
        }
        else if(!result) {
            res.send("User not found");
        }
        else {
            try {
                let match = await bcrypt.compare(req.body.password, result.password);
                if(match) {
                    req.session.username = result.username;
                    req.session.authenticated = true;
                    req.session.isRemi = result.isRemi;
                    res.redirect('/scoreblog/');
                }
                else {
                    res.send('Incorrect Password');
                }
            }
            catch(e) {
                console.log(e);
                res.send('Error');
            }
        }

    })
    res.redirect('/scoreblog/');
});


//Blog Routes

const authenticated = function(req, res, next) {
    if(req.session.authenticated) {
        next();
    }
    else {
        res.redirect('/login');
    }
}

const remi = function(req, res, next) {
    if(req.session.isRemi) {
        next();
    }
    else {
        res.send('Access Denied');
    }
}

app.get('/scoreblog/', async (req, res) => {
    var posts = BlogPost.find({}, (error, result) => {
        if(error) {
            console.log(error);
            res.sendStatus(500);
        }
        //console.log(result);
        res.render('scoreblog', {data: req.session, postset: result});
    });
});

app.get('/scoreblog/write', (req, res) => {
    res.render('writing', {data: req.session, draft: {}});
    console.log("I'm writing a post now");
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
            console.log(result);
            let parsedText = result.body.replace(/\r\n|\r|\n/g,"<br />");
            result.parsedText = parsedText;
            res.render('entry', {data: req.session, entry: result});
        }
    })
});


//Commenting

app.post('/scoreblog/:id/comment', (req, res)=> {
    console.log(req.body);
    BlogPost.findById(req.params.id, (error, result)=> {
        if(error){
            console.log(error);
            res.send('Error');
        }
        else if(!result) {
            res.redirect('/scoreblog/');
        }
        else {
            result.comments.push({author: req.session.username, text: req.body.comment});
            result.save();
            res.redirect(path.join('/scoreblog/', req.params.id+'/'));
        }
    });
});

app.post('/scoreblog/:id/deletecomment/:comment', (req, res)=> {
    console.log(req.body);
    BlogPost.findById(req.params.id, (error, result)=> {
        if(error) {
            console.log(error);
            res.redirect('/');
        }
        else if(!result){
            res.send('Does this comment even exist at all?');
        }
        else {
            result.comments.id(req.params.comment).remove();
            result.save();
            res.redirect('/scoreblog/'+req.params.id+'/');
        }
    });
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