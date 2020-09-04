//+++++++SETUP REQUIRE++++++++++++

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

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' },
  a: { longURL: 'https://www.google.ca', userID: 'a' },
  b: { longURL: 'https://www.banff.ca', userID: 'a' },
  c: { longURL: 'https://www.amazon.ca', userID: 'a' },
};


const users = {
  a: {
    id: 'a',
    email: 'a@amail.com',
    password: '$2b$10$8k5NzueKCVAelU5dCC/syeLeXLOywhiQjVW8DHuQJGRJz6LWQZ55S',
  },
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    // password: "dishwasher-funk"
    password: '$2b$10$8k5NzueKCVAelU5dCC/syeLeXLOywhiQjVW8DHuQJGRJz6LWQZ55S',
  },
};


//++++ROUTES++++++

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//homepage
app.get('/', (req, res) => {
  //nothing here yet
  res.redirect('/urls'); //andre
});

//list of logged in user's urls
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const urlsForUserDB = urlsForUser(user_id, urlDatabase);
  // console.log(urlDatabase);
  // console.log('urlsForUserDB: inside urls', urlsForUserDB);
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

//link that redirects to long url page
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

//delete a link off url list
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

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//goes to page to register as a user
app.get('/register', (req, res) => {
  let templateVars = {
    user: req.session.user_id,
  };
  res.render('urls_register', templateVars);
});

//validates registration, sends user to urls
app.post('/register', (req, res) => {
  const user_id = getRandomString(5);
  const userEmail = req.body.email;
  const userPW = req.body.password;
  //if empty strings --> response = 404 statuscode
  if (!userEmail || !userPW || emailExists(userEmail, users)) {
    res.status(400).send('Sorry, your email or password is invalid.');
  } else {
    req.session.user_id = user_id;
    const hashedPassword = bcrypt.hashSync(userPW, 10); //andre
    users[user_id] = {
      id: user_id,
      email: userEmail,
      password: hashedPassword,

    };
    res.redirect('/urls');
  }
});

