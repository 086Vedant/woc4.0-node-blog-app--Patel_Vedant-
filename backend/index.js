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

dotenv.config({path:'config.env'})
const port = process.env.PORT || 8080
//mongodb connection
connectDB()


app.set('view engine', 'ejs')

// add assets
app.use('/CSS',express.static(path.resolve(__dirname,"views/CSS")))
app.use('/Img',express.static(path.resolve(__dirname,"Img")))

app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.get('/', (req, res) => {
  db.collection('posts').find().toArray()

  .then(results =>{
    res.render('index.ejs',{posts: results})
  })
  .catch(error => console.error(error))
})

//app.get('/',services.homeRoutes )

// app.get('/blogpost', (req, res) => {

//   const result = PostModel.findById(req.query.id)
//   .then(result =>{
//     res.render('blogpost.ejs',{post: result})
//     console.log(result)
//   })
//   .catch(error => console.error(error))

// })

app.get('/blogpost', (req, res) => {

  //const result = PostModel.findById(req.query.id)
  axios.get('http://localhost:3000/api/users',{params: {id: req.query.id}})
  .then(response =>{
    res.render('blogpost.ejs',{post: response.data})
    console.log(response.data)
  })
  .catch(error => console.error(error))

})

app.get('/contact', (req, res) => {
  res.render('contact.ejs', {})
})

app.get('/search', (req, res) => {
  res.render('search.ejs', {})
})

const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
      cb(null,"images");
    },
    filename: (req,file,cb)=>{
      cb(null, "hello.jepg");
    },
});

const upload = multer({storage: storage});
app.post("/api/upload", upload.single("file"), (req,res) =>{
  res.status(200).json("File has been uploded");
});

app.use(authRoute);
app.use(userRoute);
app.use(PostRoute);
app.use(categoryRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

