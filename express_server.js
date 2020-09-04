//+++++++SETUP REQUIRE++++++++++++

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')      //andre

//+++++++++MIDDLEWARE+++++++++

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());

//++++++FUNCTIONS+++++++

//create a random 6 character string for short url 
const getRandomString = (numOfChars) => {
  let randomCharsStr = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < numOfChars; i++) {
    randomCharsStr += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomCharsStr;
};

//create a function to look up if email already exist (return boolean?)
const emailExists = (emailAddress) => {
  for (const user in users) {
    if (emailAddress === users[user].email) {
      return true;
    }
  }
}

const getUserById = (id) => {
  const user = users[id];
  if (user) {
    return user;
  }
  return null;
};

const getUserByEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return null;
}


//+++++DATA OBJECTS +++++++++

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  a: { longURL: "https://www.google.ca", userID: "a" },
  b: { longURL: "https://www.banff.ca", userID: "a" },
  c: { longURL: "https://www.amazon.ca", userID: "a" }

};

const users = {
  "a": {
    id: "a",
    email: "a@amail.com",
    password: '11'
  },
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlsForUser = (id) => {
  let userURLdata = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLdata[url] = urlDatabase[url];
    }
  }
  return userURLdata;
}
// console.log('urlsForUser: check this one ========', urlsForUser('a'))


//++++ROUTES++++++

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//homepage
app.get('/', (req, res) => {
  //nothing here yet
  res.redirect('/urls')     //andre
});

//list of logged in user's urls
app.get('/urls', (req, res) => {
  const user_id = req.cookies.user_id;
  console.log("WHAT DOES THIS RETURN US:", user_id);
  //need to add error message - checking to see whether user has been assigned a cookie
  if (!user_id) {
    return res.redirect('/login');
  }

  const user = getUserById(user_id); //return an object  

  if (!user) {
    return res.redirect('/login');
  }
  // if (user_id) {
  //  const user = getUserById(user_id);
  // let templateVars = { urls: urlsForUserDB, user:  }
  // }
  console.log(urlDatabase);
  const urlsForUserDB = urlsForUser(user_id)
  console.log('urlsForUserDB: line 124', urlsForUserDB)

  let templateVars = {
    urls: urlsForUserDB,
    // urls: urlDatabase,
    user: user
  };

  res.render('urls_index', templateVars);
});

//create a new shortened url 
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = getUserById(user_id);
  // console.log('user', user);
  // console.log('user_id', user_id);
  // let templateVars =
  // {
  //   urls: urlDatabase,
  //   // username: user_id
  //   user_id: users.email
  // };

  if (user === null) {
    return res.redirect('/login');
  }

  let templateVars = {
    urls: urlDatabase,
    user: user
  };

  res.render("urls_new", templateVars);
});

// app.post("/urls/new", (req, res) => {
//   res.redirect("/urls");
// });


//handles user input form submission
app.post("/urls", (req, res) => {
  // console.log(req.body);  //shows value to set to longURL string
  let tempShortUrl = getRandomString(6);
  const user_id = req.cookies.user_id;
  urlDatabase[tempShortUrl] = {
    longURL: req.body.longURL,
    user_id: user_id
  }
  // console.log("is it me?", urlDatabase)
  // res.redirect(`/urls/${tempShortUrl}`);
  res.redirect('/urls');
});

//link that redirects to long url page
app.get('/u/:shortURL', (req, res) => {
  // if (req.params.shortURL) {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL)
});

app.get("/urls/:shortURL", (req, res) => {
  //shortURL --> I am assigning a value from req.params, which I have called shortURL; longURL -->I am accessing a value; 
  const user = users[req.cookies.user_id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!user) {
    return res.redirect('/login');
  };

  if (shortURL) {
    const templateVars = {
      user,
      shortURL,
      longURL
    };

    return res.render("urls_show", templateVars);
  }
  return res.send('Error, URL does not exist');

});

//delete a link off url list
app.post("/urls/:shortURL/delete", (req, res) => {
  //req.params allows access to variables in url
  const user = req.cookies.user_id;
  if (!user) {
    return res.redirect('/login');
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});


app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls")
});

//login page for registered user
app.get("/login", (req, res) => {
  let templateVars = {
    user: null
    // user_id: req.cookies['user_id'],
    // email: req.params.email,
  };
  res.render("urls_login", templateVars);
});

//redirect to user's existing list of urls
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPW = req.body.password;
  // const user_id = users['user_id'];
  // res.cookie('user_id', user_id);
  //if statements 
  if (!userEmail || !userPW) {
    return res.send('must fill out valid email and password');
  }
  const user = getUserByEmail(userEmail)
  if (user === null) {
    return res.send('No user found with that email.');
  }

  if (user.password !== userPW) {
    return res.send('Username or password incorrect: please try again');
  } else {                  //andre added "else" from line 258 - 264

    const user_id = users.user_id;
    res.cookie('user_id', user.id);
    res.redirect("/urls");

  }
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//goes to page to register as a user
app.get("/register", (req, res) => {
  let templateVars = {
    // urls: urlDatabase,
    user: req.cookies.user_id,
    // email: req.params.email, /// andre commented out
    // password: req.params.password
  };
  res.render("urls_register", templateVars);
});

//validates registration, sends user to urls 
app.post('/register', (req, res) => {

  const user_id = getRandomString(5);
  const userEmail = req.body.email;
  const userPW = req.body.password;
  //if empty strings --> response = 404 statuscode
  if (!userEmail || !userPW || emailExists(userEmail)) {
    res.status(400).send('Sorry, your email or password is invalid.')
    console.log(users);

  } else {
    const hashedPassword = bcrypt.hashSync(userPW, 10)     //andre
    users[user_id] = {
      id: user_id,
      email: userEmail,
      password: hashedPassword,  //andre
      // password: userPW,      //jen to be removed this line
    };

    //move inside else stat
    res.cookie('user_id', user_id);
    res.redirect("/urls");
  }
});


//++++++++++DAY ONE SUMMARY OF FUNCTIONALITY+++++++++++++++++


//+++++++Where code goes to die. Or, maybe hybernate. Anyway, for my future reference...+++++++++
// const { url, method } = request; 
// const render = require('render');

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });

  //the templateVars object contains the string 'Hello World' under the key greeting. We then pass the templateVars object to the template called hello_world.

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });

//In our hello_world.ejs file, we can display the 'Hello World!' string stored in the templateVars object by calling the key greeting:
// <!-- This would display the string "Hello World!" -->
// <h1><%= greeting %></h1>

//example of html addition
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//example of how they don't connect

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });


//I think this was a mistake
// app.post("/urls/new", (req, res) => {
//   res.render("urls_new");
// });

//showed us how the app would post ok every time we input text into box and logged it to console.
// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send("Ok");         // Respond with 'Ok' (we will replace this)
//   res.redirect
// });

//WED, 9/2
// from post / register
    // res.status = 400;
    // console.log(res.statusCode)
    // res.status(400).send('Sorry, your email or password is invalid.')
    // console.log('404 code will go here')
    // console.log('already exists!')
    //if email already exist --> response = 404 statuscode
    //create an email lookup helper function DRY code
    // console.log(users[user_id]);