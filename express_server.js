//+++++++DEPENDENCIES/SETUP++++++++++++

const express = require('express');
const app = express();
const PORT = 8080;
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

// const urlDatabase = {};
// const users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i245bv: { longURL: "https://www.youtube.ca", userID: "bb1234" },
  i245G3: { longURL: "https://www.yahoo.ca", userID: "bb1234" }
};

const users = {
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user@example.com',
    // password: 'purple-monkey-dinosaur',
    password: '$2a$10$mRA0PJmaZUXtGuDmGeISg.f0LqvbbfAm1zRNRwFSFCk85FaULZhX6', // for helpersTest.js
  },
  bb1234: {
    id: 'bb1234',
    email: 'user2@example.com',
    // password: 'dishwasher-funk',
    password: '$2a$10$drF4E9kLAsNW18wTmuGBtuTxmhb2ydfFuxyKMxJ7Qf1bo/psRMVPG', // for helpersTest.js
  },
};

//++++ROUTES++++++

//homepage
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//allows new user to register
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('urls_register', templateVars);

  }

});

//validates registration, sends user to list of urls
app.post('/register', (req, res) => {
  const userID = getRandomString(6);
  const userEmail = req.body.email;
  const userPW = req.body.password;
  if (!userEmail || !userPW || emailExists(userEmail, users)) {
    res.status(400).send('⚠️ Sorry, your email or password is invalid ⚠️');
  } else {
    req.session.user_id = userID;
    const hashedPassword = bcrypt.hashSync(userPW, 10);
    users[userID] = {
      id: userID,
      email: userEmail,
      password: hashedPassword,
    };
    res.redirect('/urls');
  }
});

//login page for registered user
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render('urls_login', templateVars);

  }

});

//redirect to user's existing list of urls
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPW = req.body.password;
  const userID = getUserByEmail(userEmail, users);
  if (!userEmail || !userPW) {
    return res.status(400).send('⚠️ must fill out valid email and password ⚠️');
  }
  const user = getUserByEmail(userEmail, users);
  if (user === null) {
    return res.status(400).send('⚠️ No user found with that email ⚠️');
  }
  if (!bcrypt.compareSync(userPW, user.password)) {
    return res.status(400).send('⚠️ Username or password incorrect: please try again ⚠️');
  } else {

    req.session.user_id = userID.id;
    res.redirect('/urls');
  }
});

//handles user logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//list of logged in user's urls
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const urlsForUserDB = urlsForUser(userID, urlDatabase);
  const user = getUserById(userID, users); //return an object
  if (!user) {
    return res.redirect('/login');
  } else {
    const templateVars = {
      urls: urlsForUserDB,
      user: users[userID],
    };
    return res.render('urls_index', templateVars);
  }
});

//handles user input form submission
app.post('/urls', (req, res) => {
  const shortURL = getRandomString(6);
  const userID = req.session.user_id;
  if (getUserById(userID, users)) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(400).send('⚠️users who are not logged in are unable to save urls⚠️');
  }
});

app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const user = getUserById(userID, users);
  if (user === null) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[userID],
  };
  res.render('urls_new', templateVars);
});

//contains link that redirects to long url page
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    return res.redirect(urlDatabase[shortURL].longURL);
  }
  return res.status(400).send('⚠️ this tiny link does not exist ⚠️');
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {};
  if (!userID) {
    templateVars.user = null;
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    const shortURL = req.params.shortURL;
    if (userURLs[shortURL]) {
      const longURL = urlDatabase[shortURL].longURL;
      templateVars.user = users[userID];
      templateVars.longURL = longURL;
      templateVars.shortURL = shortURL;
    } else {
      templateVars.user = users[userID];
      templateVars.shortURL = null;
    }
  }
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id
  if (!userID) {
    return res.status(400).send('⚠️ inaccessible ⚠️');
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    if (userURLs[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    } else {
      return res.status(400).send('⚠️ inaccessible ⚠️');
    }
  }
});

//deletes a link off url list
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('⚠️ inaccessible ⚠️');
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    const urlToDelete = req.params.shortURL;
    if (userURLs[urlToDelete]) {
      delete urlDatabase[urlToDelete];
      res.redirect('/urls');
    } else {
      return res.status(400).send('⚠️ inaccessible ⚠️');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});