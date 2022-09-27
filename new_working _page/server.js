const express = require('express');
const app = express();
const cookieParser = require("cookie-parser"); //cookie-parser is a middleware which parses cookies attached to the client request object.
const sessions = require('express-session'); //used to create and manage a session middleware.
const http = require('http'); //The Built-in HTTP Module
const parseUrl = require('body-parser');
const mysql = require('mysql');
let encodeUrl = parseUrl.urlencoded({ extended: false });

const { encode } = require('punycode');
const crypto = require("crypto"); //Crypto is a module in Node. js which deals with an algorithm that performs data encryption and decryption. 


let algorithm = "sha256";


// To serve static files such as images, CSS files, 
app.use(express.static(__dirname));

app.use(cookieParser());


//session middleware
app.use(sessions({
    secret: "thisismysecrctekey",  //secret a string or array used for signing cookies.
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
    resave: false
}));




//connecting mysql DB to server 
var con = mysql.createConnection({
    host: "localhost",
    user: "root", // my username
    password: "diot35", // my password
    database: "beacon_application"
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/sign-up.html');
    })

app.post('/sign-up', encodeUrl, (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var password = req.body.password;
    
    
	// Creating the digest in hex encoding
	 password = crypto.createHash(algorithm).update(password).digest("hex");
    

    con.connect(function(err) {
        if (err){
            console.log(err);
        };
        
        // checking user already registered or no
        con.query(`SELECT * FROM beacon_data WHERE email = '${email}' AND password  = '${password}'`, function(err, result){
          
            if(err){
                console.log(err);
            };
            if(Object.keys(result).length > 0){
                res.sendFile(__dirname + '/templates/failReg.html');
            }else{
            //creating user page in userPage function
            function userPage(){
                // We create a session for the dashboard (user page) page and save the user data to this session:
                req.session.user = {
                    name: name,
                    email: email,
                    phone: phone,
                    password: password
                   
                };

                res.sendFile(__dirname + '/templates/sign-in.html');
            }
            
   
          // inserting new user data
         var sql = `INSERT INTO beacon_data (name, email, phone, password) VALUES ('${name}', '${email}', '${phone}', '${password}')`;
         con.query(sql, function (err, result){
                  if (err){
                        console.log(err);
                    }else{
                        // using userPage function for creating user page
                        userPage();
                    };
                });
			 }

        });
    });


});


app.get("/sign-in", (req, res)=>{
    res.sendFile(__dirname + "/templates/sign-in.html");
});

app.post("/sign-in", encodeUrl, async(req, res)=>{
    var email = req.body.email;
    var password = req.body.password;
    
    
    	password = crypto.createHash(algorithm).update(password).digest("hex");


    
con.connect(function(err) {     
        if(err){
            console.log(err);
        };  
        
con.query(`SELECT * FROM beacon_data WHERE email = '${email}' AND password = '${password}'`, function (err, result) {
          
          if(err){
            console.log(err);
          };
          

         function userPage(){
            // We create a session for the dashboard (user page) page and save the user data to this session:
            req.session.user = {     
                email: result[0].email,             
                password : password
               
            };

           res.sendFile(__dirname + '/templates/product.html');
           
            
        }
	
        if(Object.keys(result).length > 0){
            userPage();
        }else{
            res.sendFile(__dirname + '/templates/failLog.html');
        }
        
         app.get('/index',function(req,res){      
   	 res.sendFile(__dirname + '/templates/index.html');
   	 });
   	 
   	 
   	 
   	  app.get('/product',function(req,res){      
   	 res.sendFile(__dirname + '/templates/product.html');
   	 });
   	 
   	 
   	
   	  app.get('/contact',function(req,res){      
   	 res.sendFile(__dirname + '/templates/contact.html');
   	 });


        });
    });
});

  






app.listen(4000, ()=>{
console.log("Server running on port 4000");
});
