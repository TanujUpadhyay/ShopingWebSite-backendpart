const express = require("express");
const router = express.Router();
const {check} = require("express-validator");
const {signout,signup,signin,isSignedIn} = require("../controllers/auth")



router.post("/signup" , [
        check("name","name should be at least 3 char").isLength({min:3}),
        check("email","email is required").isEmail(),
        check("password","password should be atleast 3 char").isLength({min:3}),
] , signup);



router.post("/signin" , [
        check("email","email is required").isEmail(),
        check("password","password  char").isLength({min:3}),
] , signin);




router.get("/signout" , signout);


// router.get("/testroute",isSignedIn,(req,res)=>{
//         res.send("A protected rout");
// });



module.exports = router;


