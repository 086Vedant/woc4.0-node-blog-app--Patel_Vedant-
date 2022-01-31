const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const multer = require('multer');
const path = require('path');

//FOR images
//Define storage for Images
const storage = multer.diskStorage({
    //destination of files
    destination: function(request,file,callback){
      callback(null,path.join(__dirname+'/Image'));  
    },

    filename: function(request,file,callback){
        callback(null,new Date().getTime() + '-' +file.originalname);
    },

});

//upload parameters for multer
const upload = multer({

    storage: storage,
    limits:{
     fieldSize: 1024*1024*3,
    },
  });

//CREATE POST
router.post("/newpost", upload.single('image')  , async(req,res)=>{
   
     const newPost = new Post({
        title: req.body.title,
        username: req.body.username,
        desc: req.body.desc,
        categories: req.body.categories,
        image: req.file.filename
     });
    try{
        const savedPost = await newPost.save(); 
        res.redirect('/contact?message=post is sucessfully saved');
    }
    catch(err)
    {
        res.status(500).json(err);
    }
});

//UPDATE POST
router.post("/updatePost", async(req,res)=>{
    const id = req.query.id;
    try{
        const post = await Post.findById(req.query.id);
        if(post.username == req.body.username) {

            try{
                const updatedPost = await Post.findByIdAndUpdate(req.query.id,{
                    $set: req.body,
                },
                    { new: true }
                );
                res.redirect(`/blogpost?id=${id}`);  //blogpost?id=<%=req.query.id%>
               // res.status(200).json(updatedPost);
            }

            catch(err){
                res.status(500).json(err);
            }
        }

        else{
            res.status(401).json("You can update only your posts!");
        }
    }
    catch(err){
        res.status(500).json(err);
    }
    
});


//DELETE POST
router.get("/DELETE", async(req,res)=>{

    if(req.session.user)
    {
        try{
            const post = await Post.findById(req.query.id);
            if(post.username == req.session.user.username) {
    
                try{
                    await post.delete();
                   // res.status(200).json("Post has been deleted...");
                      res.redirect('/?delete_message=Post has been deleted...')  
                }
    
                catch(err){
                    res.status(500).json(err);
                }
            }
    
            else{
                //res.status(401).json("You can delete only your posts!");
                res.redirect('/blogpost?delete_message=You can delete only your posts!&id='+req.query.id)
                
            }
        }
        catch(err){
            res.status(500).json(err);
        }
    }
    
    else
    {
        res.redirect('/Signup');
    }
    
});

//GET POST
router.get("/api/users", async(req,res)=>{
    try{
        const id = req.query.id;
        const post = await Post.findById(id);
        res.status(200).json(post);
        
    }
    catch(err){
        res.status(500).json(err);
    }

});

//GET ALL POST
router.get("/api/search", async(req,res)=>{
    const username = req.query.username;
    const title_post = req.query.username;
    var search_message = '';
    var posts;
    try{
        
        if(username){
            posts = await Post.find({username});
        }  
        
        if(posts.length==0){
            posts = await Post.find({
                title: {
                    $in: [title_post],
                },
            });
        }   
        
        if(posts.length==0){
            
            search_message = 'search not found';
        }
        res.send({posts: posts ,search_message:search_message});
    }
    catch(err){
      res.status(500).json(err);
    }
});


module.exports = router;