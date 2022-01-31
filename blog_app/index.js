const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./server/database/connection')
const app = express();
const authRoute = require("./server/route/auth");
const userRoute = require("./server/route/users");
const PostRoute = require("./server/route/posts");
const categoryRoute = require("./server/route/categories");
const multer = require('multer');
const { db } = require('./server/models/User');
const services = require('../api/services/rander')
const PostModel = require("../api/server/models/Post");
const axios = require('axios');
const { response } = require('express');
const bodyparse = require('body-parser');
const session = require('express-session');
let keyArray = [];
keyArray[0] =0;



dotenv.config({path:'config.env'})
const port = process.env.PORT || 8080
//mongodb connection
connectDB()

//parse request to body-parse
app.use(bodyparse.urlencoded({extended:true}));
app.set('view engine', 'ejs')

// add assets
app.use('/CSS',express.static(path.resolve(__dirname,"views/CSS")))
app.use('/Img',express.static(path.resolve(__dirname,"Img")))
app.use('/Image',express.static(path.resolve(__dirname,"server/route/Image")))
app.use(express.static('public'))
// app.use('/public',express.static(path.resolve(__dirname,"public")))

app.use(express.json());
// app.use(bodyParser.json())
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

function ISlogin(rq,rs,tored=true)
{
    if(!rq)
    {
      if(tored) rs.redirect('/Signup');
      return false;
    }
    return true;
}

app.use(session({
  secret: '12345',
  resave: true,
  saveUninitialized: true
}));


app.get('/', (req, res) => {

  var delete_message ='';
  var login_user = ''; 
  if(req.session.user) login_user = req.session.user.username;
  
  if(req.query.delete_message != 'undefined') 
    delete_message = req.query.delete_message;

  //if(req.session.user) ISginUp  =1;
  db.collection('posts').find().toArray()

  .then(results =>{
    res.render('index.ejs',{posts: results , delete_message:delete_message,login_user:login_user});
  })
  .catch(error => console.error(error))
})



// app.get('/blogpost', (req, res) => {

//   const result = PostModel.findById(req.query.id)
//   .then(result =>{
//     res.render('blogpost.ejs',{post: result})
//     console.log(result)
//   })
//   .catch(error => console.error(error))

// })

app.get('/blogpost', (req, res) => {
  
  var login_user = '';
  var delete_message = ''; 
  var edit_message ='';
  if(req.query.delete_message != 'undefined') delete_message = req.query.delete_message;
  if(req.query.edit_message  != 'undefined') edit_message = req.query.edit_message;
    if(req.session.user)login_user = req.session.user.username;
  
  axios.get('http://localhost:3000/api/users',{params: {id: req.query.id}})
  .then(function(response){ 
    res.render('blogpost.ejs',{post: response.data, login_user:login_user,delete_message:delete_message , edit_message:edit_message})
    //console.log(response.data)
  })
  .catch(error => console.error(error))

})

app.get('/contact', (req, res) => {
  var login_user = ''; 
  var post_message = '';
  
  if(!ISlogin(req.session.user,res))return ;
  if( req.session.user)login_user = req.session.user.username;
  if(req.query.message!='undefined')  post_message = req.query.message;

  res.render('contact.ejs', {login_user:login_user,  post_message: post_message})
})

app.get('/Signup', (req, res) => {
  var login_user = ''; 
  var message = '';

  if(req.session.user)login_user = req.session.user.username;   
  if(req.query.error != 'undefined') message = req.query.error; 
  res.render('Signup.ejs', {login_user:login_user, message: message})
})

app.get('/LOGIN', (req, res) => {
  var Error = '';
  var login_user = ''; 
  if(req.query.err != 'undefined' && req.query.err=='Invalid') 
    Error='Invalid username or bad password. Please try again';

  if(req.session.user) login_user = req.session.user.username;
  res.render('LOGIN.ejs', {Error:Error,login_user:login_user})
})

app.get('/quot', (req, res) => {
  var login_user = ''; 
  if(!ISlogin(req.session.user,res)) return ;
  if( req.session.user)login_user = req.session.user.username;

  const result = PostModel.findById(req.query.id)
    .then(result =>{
        if(result.username==req.session.user.username)
        res.render('UpdatePost.ejs',{post: result ,login_user:login_user})
        
        else
        res.redirect('/blogpost?edit_message=You can edit only your posts!&id='+result._id)             
     })
     .catch(error => console.error(error))  
})


app.post('/search', (req, res) => {
  var login_user = ''; 
  if(req.session.user)login_user = req.session.user.username;

  axios.get('http://localhost:3000/api/search',{params: {username: req.body.search_input}})
  .then(function(response){
    res.render('search.ejs', {posts: response.data.posts , search_message: response.data.search_message,login_user:login_user}) 
  })
  .catch(error => console.error(error))
})

app.get('/userdetail', (req,res)=> {

  var login_user = ''; 
  if(req.session.user) login_user = req.session.user.username;
  
  axios.get('http://localhost:3000/getuserpost',{params: {username: req.query.user}})
  .then(function(response){
    res.render('userdetail.ejs',{posts:response.data.posts ,login_user:login_user,message: response.data.message });
  })
  .catch(error => console.error(error))
})

app.get('/logout',(req,res) => {
  req.session.destroy();
  res.redirect('/');
});



app.use(authRoute);
app.use(userRoute);
app.use(PostRoute);
app.use(categoryRoute);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

