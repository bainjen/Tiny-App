//+++++++SETUP REQUIRE++++++++++++

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

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

//+++++DATA OBJECTS +++++++++

const urlDatabase = {
  // shortURL: longURL, 
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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


//++++SERVER REQUESTS && RESPONSES++++++

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  // console.log(user_id);
  // console.log(users);
  // console.log(users[user_id].email);
  let templateVars =
  {
    urls: urlDatabase,
    username: user_id,
    email: users[user_id].email
  };
  res.render('urls_index', templateVars);
});

//GET route to render the urls_new.ejs template (user form)
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars =
  {
    urls: urlDatabase,
    username: user_id
  };
  res.render("urls_new", templateVars);
});

//handles user input form submission
app.post("/urls", (req, res) => {
  // console.log(req.body);  //shows value to set to longURL string
  let tempShortUrl = getRandomString(6); 
  urlDatabase[tempShortUrl] = req.body.longURL; 
  // let templateVars = {
  //   username: req.cookies['user_id'],
  //   shortURL: tempShortUrl,
  //   longURL: req.body.longURL
  // };
  res.redirect(`/urls/${tempShortUrl}`);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  //shortURL --> I am assigning a value from req.params, which I have called shortURL; longURL -->I am accessing a value; 
  const user_id = req.cookies['user_id'];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    username: user_id
  }; 
  res.render("urls_show", templateVars);
  // console.log("request object", req);
  // console.log("response object", res);
  // console.log(req.params);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  //req.params allows access to variables in url
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});


app.post("/urls/:shortURL", (req, res) => {
 urlDatabase[req.params.shortURL] = req.body.longURL;
 res.redirect("/urls")
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.user_id);
  res.redirect("/urls");
});
 
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
 });

 app.get("/register", (req, res) => {
   let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies['user_id'],
    email: req.params.email,
    password: req.params.password
   }; 
   //not certain I have the right template vars yet. 
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  const user_id = getRandomString(5); 
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password,
  };
  // console.log(userID);
  // console.log(req.body.email);
  // console.log(req.body.password);
  // console.log(newUser);
  // console.log('user database', users);
  console.log(users[user_id]);
  res.cookie('user_id', user_id);
  res.redirect("/urls");
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