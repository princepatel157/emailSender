const express = require("express");
const app = express();
const router = express.Router();
var mysql = require("mysql");
const sendgrid = require('@sendgrid/mail');
const SENDGRID_API_KEY = "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";
sendgrid.setApiKey(SENDGRID_API_KEY);
const cron = require('node-cron');


app.use(express.json());

// db connection
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "assignment1",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// create table
// con.connect((err) => {
//   var sql =
//     "CREATE TABLE reports (username VARCHAR(255), report VARCHAR(255))";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("Table created");
//   });
// });

//api requests
app.get("/", (req, res) => {
  res.send("hello from backend get request");
});


// adding a user
router.post("/adduser", (req, res) => {
  const { username, email, password,age,gender } = req.body;
  // console.log(username + email + password+age+gender);
  con.connect((err) => {
    var sql = "INSERT INTO users (username,email,password,age,gender) VALUES (?,?,?,?,?)";
    con.query(sql,[username,email,password,age,gender], (err, result) => {
      if (err) throw err;
      else{
        res.send("data inserted");
      }
    });
  });
});

// updating a user
router.put("/updateuser",(req,res)=>{
  const {username,email,password,age,gender}=req.body;

  con.connect((err) => {
    var sql = "UPDATE users SET age=? WHERE username=?";
    con.query(sql,[age,username], (err, result) => {
      if (err) throw err;
      else{
        res.send("data updated");
      }
    });
  });
})

// deleting a user
router.delete("/deleteuser",(req,res)=>{
  const {username,password}=req.body;

  con.connect((err) => {
    var sql = "DELETE FROM users WHERE username=?";
    con.query(sql,[username], (err, result) => {
      if (err) throw err;
      else{
        res.send("data deleted");
      }
    });
  });
})

// getting a user
router.get("/getuser",(req,res)=>{
  const {username}=req.body;

  con.connect((err) => {
    var sql = "SELECT * FROM users WHERE username=?";
    con.query(sql,[username], (err, result) => {
      if (err) throw err;
      else{
        res.send(result);
      }
    });
  });
})


// getting all users
router.get("/getusers",(req,res)=>{

  con.connect((err) => {
    var sql = "SELECT * FROM users";
    con.query(sql, (err, result) => {
      if (err) throw err;
      else{
        res.send(result);
      }
    });
  });
})

//filter user according to age
router.get("/filterage",(req,res)=>{
  var {filter,filterAge}=req.body;

  if(filter==">"){
    var sql="SELECT username FROM users WHERE (age>?)";
  }
  else{
    var sql="SELECT username FROM users WHERE (age<?)";
  }
  con.query(sql,[filterAge],(err,result)=>{
    if(err) throw err;
    else{
      res.send(result);
    }
  })
})

//filter user according to gender
router.get("/filtergender",(req,res)=>{
  var {filterGender}=req.body;

  var sql="SELECT username FROM users WHERE (gender=?)";
  con.query(sql,[filterGender],(err,result)=>{
    if(err) throw err;
    else{
      res.send(result);
    }
  })
})


//email trigger to filtered user
router.get("/sendmail",(req,res)=>{
  var {filter}=req.body;

  var sql="SELECT email FROM users WHERE (gender=?)";
  con.query(sql,[filter],(err,result)=>{
  if(err) throw err;
  else{
    result.forEach((item,index,arr)=>{
      console.log(item);
      sendMail(item.email);
      console.log("email sent")
    })
  }
  })
})


//schedule email for users
router.post("/schedulemail",(req,res)=>{
  var {filter,task}=req.body;

  var sql="SELECT username FROM users WHERE (gender=?)";
  con.query(sql,[filter],(err,result)=>{
  if(err) throw err;
  else{
    var sql2="INSERT INTO tasks(username,task,time) VALUES(?,?,?)";
    var sql3="INSERT INTO reports(username,report) VALUES(?,?)";
    var timing="Task Scheduled at: "+new Date();

    result.forEach((item,index,arr)=>{
      console.log(item.username);
      con.query(sql2,[item.username,task,new Date()],(err,result)=>{
        if(err) throw err;
        else{
          res.send("task scheduled");
        }
      })
      con.query(sql3,[item.username,timing],(err,result)=>{
        if(err) throw err;
        else{
          res.send("reported");
        }
      })
      res.send("tasks scheduled");
    })
  }
  })
})


// getting all tasks
router.get("/gettasks",(req,res)=>{

  con.connect((err) => {
    var sql = "SELECT * FROM tasks";
    con.query(sql, (err, result) => {
      if (err) throw err;
      else{
        res.send(result);
      }
    });
  });
})


// getting all tasks
router.get("/reports",(req,res)=>{
  const {username}=req.body;

  con.connect((err) => {
    var sql = "SELECT * FROM reports WHERE username=?";
    con.query(sql,[username],(err, result) => {
      if (err) throw err;
      else{
        result.forEach((item)=>{
          res.send(item);
        })
      }
    });
  });
})


// deleting a tasks
router.delete("/deletetasks",(req,res)=>{
  const {username}=req.body;

  con.connect((err) => {
    var sql = "DELETE FROM tasks WHERE username=?";
    var sql3="INSERT INTO reports(username,report) VALUES(?,?)";
    var timing="Task Deleted at: "+new Date();
    con.query(sql,[username], (err, result) => {
      if (err) throw err;
      else{
        res.send("tasks deleted");
      }
    });
    con.query(sql3,[username,timing], (err, result) => {
      if (err) throw err;
      else{
        res.send("tasks deleted");
      }
    });
  });
})





//send email function
function sendMail(email){
  const msg = {
    to: email,
    from: 'prince.patel@jungleworks.com',
    subject: 'Sending with SendGrid Is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sendgrid
    .send(msg)
    .then((resp) => {
      console.log('Email sent\n', resp)
    })
    .catch((error) => {
      console.error(error)
    })
    
  }

//express router
app.use(router);

// server
app.listen(5000, () => {
  console.log("running on port 5000");
});
