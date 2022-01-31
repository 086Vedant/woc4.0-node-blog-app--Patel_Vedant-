const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");



let keyArray = [];
keyArray[0] =0;
// index 0 : login and not login

//REGISTER
var Users = [];
router.post("/register", async(req,res)=>{

        try {

            if(!req.body.username || !req.body.password){
                res.redirect('/Signup?error=Invalid details!');
             } 

            else{
                 const USER = await User.findOne({username: req.body.username,});
                 if(USER)
                 {
                    res.redirect('/Signup?error=User Already Exists! Login or choose another user id');
                 }

                 else{
                    const salt = await bcrypt.genSalt(10);
                    const hashedPass = await bcrypt.hash(req.body.password,salt);
            
                    const newUser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password : hashedPass
                    });
                   
                    const user = await newUser.save();
                    req.session.user = user;
                    res.redirect('/Signup?error=You are logged in');
                 }
            }     
        }
    
        catch(err)
        {
            //res.status(500).json("User Already Exists! Login or choose another user id");
            console.log(err);
        }
     

});

//LOGIN
router.post("/login",async(req,res)=>{

     if(!req.body.username || !req.body.password){
         res.redirect('/LOGIN');
      }

    else{
        try{
             const user = await User.findOne({username: req.body.username,});

            if(user)
            {
                const validated = await bcrypt.compare(req.body.password , user.password);
                if( validated)
                {
                    req.session.user = user;
                    keyArray[0] = 1;
                    const {password,...others} = user._doc;                 
                    res.redirect('/LOGIN?err=valid');          
                }
                // else res.status(400).json("Wrong credentials!");   
                else res.redirect('/LOGIN?err=Invalid');             
            }
           // else res.status(400).json("Wrong credentials!");  
           else res.redirect('/LOGIN?err=Invalid');                            
        }
    
        catch(err) {
            console.log(err)
           // res.status(500).json(err);
        }

    }
});


module.exports = router;
