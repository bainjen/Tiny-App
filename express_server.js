const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
//tells express to use ejs for templating engine
app.set('view engine', 'ejs')

const urlDatabase = {
  // shortURL: longURL, 
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//sharing data with urls_index.ejs
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//GET route to render the urls_new.ejs template (given below) in the browser, to present the form to the user; and a POST route to handle the form submission.

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//post request has a body, a get request does not.
app.post("/urls/new", (req, res) => {
  res.render("urls_new");
});

//The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence, so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter. Routes should be ordered from most specific to least specific.

app.get("/urls/:shortURL", (req, res) => {
  //shortURL --> I am assigning a value from the request params, which I have called shortURL --> longURL -->I am accessing a value; 
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };

  // console.log("request object", req);
  // console.log("response object", res);
  console.log(req.params);
  res.render("urls_show", templateVars);
});





//+++++++Where code goes to die. Or, maybe hybernate. Anyway, for my future reference...+++++++++
// const { url, method } = request; 
// const render = require('render');


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