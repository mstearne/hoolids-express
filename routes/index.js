var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mysql = require('mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Hooli Development Services', page_heading: "Welcome to Hooli" });
});

/* GET about us page. */
router.get('/about-us', function (req, res) {
  res.render('about', {title: "About Us | Hooli", page_heading: "About Hooli Development Services"});
});

/* GET contact us page with form. */
router.get('/contact-us', function (req, res) {
  res.render('contact', {title: "Contact Us | Hooli", page_heading: "Contact Us"});
});

/* Process the form data from the contact us page that was sent */
router.post('/contact-us-process', function(req,res) {

  // Insert this contact into the database to store a record of the email
  var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    };

    console.log('connected as id ' + connection.threadId);
    var insertData = [req.body.name, req.body.email, (req.body.checkbox).join(), req.body.message];

    connection.query('INSERT INTO contact_submissions (name,email,services,message) VALUES (?,?,?,?)',insertData, function(err, result) {
      if (err){
        console.log("Error on insert into database " + err);
        return;
      }
    });
  });


  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport('smtps://'+process.env.NODEMAILER_USER+':'+process.env.NODEMAILER_PASS+'@smtp.gmail.com');
  var returnValues={title: "Thank You", page_heading: "Thank you for contacting us."};

  // Setup email to send to user
  var mailOptions = {
    to: '"Hooli Development" <mstearne@gmail.com>', // sender address
    from: req.body.name+', '+req.body.email, // list of receivers
    subject: 'Hooli Development Contact From '+req.body.name, // Subject line
    text: req.body.message+"\nInterested in "+(req.body.checkbox).join(), // plaintext body
    html: '<b>'+req.body.message+'</b>'+"<br>Interested in "+(req.body.checkbox).join() // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      returnValues.message = "Oops! ";
    }else{
      returnValues.message = "Success! Thanks for your contact.";
      console.log('Message sent: ' + info.response);
    }
    res.render('thank-you',returnValues);
  });

});

/* GET services page. */
router.get('/our-services', function (req, res) {
  res.render('services');
});


module.exports = router;
