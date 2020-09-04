//+++++++DEPENDENCIES/IMPORTS/SETUP++++++++++++

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, getUserById, urlsForUser, emailExists, getRandomString } = require('./helpers');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['suzy'],
  })
);
app.set('view engine', 'ejs');


//+++++DATA OBJECTS +++++++++

//removed test data
const urlDatabase = {};
const users = {};


//++++ROUTES++++++

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//homepage
app.get('/', (req, res) => {
  return res.redirect('/login');
});

//index of logged in user's urls
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const urlsForUserDB = urlsForUser(user_id, urlDatabase);
  //need to add error message - checking to see whether user has been assigned a cookie
  if (!user_id) {
    return res.redirect('/login');
  }

  const user = getUserById(user_id, users); //return an object

  if (!user) {
    return res.redirect('/login');
  } else {
    const templateVars = {
      urls: urlsForUserDB,
      user: user,
    };
    res.render('urls_index', templateVars);
  }
});

//create a new shortened url
app.get('/urls/new', (req, res) => {
  const user_id = req.session.user_id;
  const user = getUserById(user_id, users);

  if (user === null) {
    return res.redirect('/login');
  }

  let templateVars = {
    urls: urlDatabase,
    user: user,
  };

  res.render('urls_new', templateVars);
});

//handles user input form submission
app.post('/urls', (req, res) => {
  let tempShortUrl = getRandomString(6);
  const user_id = req.session.user_id;
  urlDatabase[tempShortUrl] = {
    longURL: req.body.longURL,
    userID: user_id,
  };
  res.redirect('/urls');
});

//contains link that redirects to long url page
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!user) {
    return res.redirect('/login');
  }

  if (shortURL) {
    const templateVars = {
      user,
      shortURL,
      longURL,
    };

    return res.render('urls_show', templateVars);
  }
  return res.send('Error, URL does not exist');
});

//deletes a link off url list
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    return res.redirect('/login');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

//login page for registered user
app.get('/login', (req, res) => {
  let templateVars = {
    user: null,
  };
  res.render('urls_login', templateVars);
});

//redirect to user's existing list of urls
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPW = req.body.password;

  if (!userEmail || !userPW) {
    return res.send('must fill out valid email and password');
  }
  const user = getUserByEmail(userEmail, users);
  if (user === null) {
    return res.send('No user found with that email.');
  }
  if (!bcrypt.compareSync(userPW, user.password)) {
    return res.send('Username or password incorrect: please try again');
  } else {

    const user_id = users.user_id;
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

//handles user logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//goes to page to register as a new user
app.get('/register', (req, res) => {
  let templateVars = {
    user: req.session.user_id,
  };
  res.render('urls_register', templateVars);
});

//validates registration, sends user to list of urls
app.post('/register', (req, res) => {
  const user_id = getRandomString(5);
  const userEmail = req.body.email;
  const userPW = req.body.password;
  //if empty strings --> response = 404 statuscode
  if (!userEmail || !userPW || emailExists(userEmail, users)) {
    res.status(400).send('Sorry, your email or password is invalid.');
  } else {
    req.session.user_id = user_id;
    const hashedPassword = bcrypt.hashSync(userPW, 10);
    users[user_id] = {
      id: user_id,
      email: userEmail,
      password: hashedPassword,

    };
    res.redirect('/urls');
  }
});

//credit is due to Andre, Thai, and Jae in my cohort, and many, many mentors whom cumulatively have spent hours helping me structure, debug, and understand my code. This would not have been possible in this week-long timeframe without their guidance.