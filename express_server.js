//+++++++SETUP REQUIRE++++++++++++

const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt'); //andre
const cookieSession = require('cookie-session'); //andre

//+++++++++MIDDLEWARE+++++++++

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cookieSession({
		name: 'session',
		keys: ['suzy'],
	})
); //andre
app.set('view engine', 'ejs');
//app.use(cookieParser());

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
};

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
};

//+++++DATA OBJECTS +++++++++

const urlDatabase = {
	b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
	i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' },
	a: { longURL: 'https://www.google.ca', userID: 'a' },
	b: { longURL: 'https://www.banff.ca', userID: 'a' },
	c: { longURL: 'https://www.amazon.ca', userID: 'a' },
};
const urlsForUser = (id) => {
	let userURLdata = {};
	for (const url in urlDatabase) {
		if (id === urlDatabase[url].userID) {
			userURLdata[url] = urlDatabase[url];
		}
	}
	return userURLdata;
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

// console.log('urlsForUser: check this one ========', urlsForUser('a'))

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
	const urlsForUserDB = urlsForUser(user_id);
	console.log(urlDatabase);
	console.log('urlsForUserDB: inside urls', urlsForUserDB);
	//need to add error message - checking to see whether user has been assigned a cookie
	if (!user_id) {
		return res.redirect('/login');
	}

	const user = getUserById(user_id); //return an object

	if (!user) {
		return res.redirect('/login');
	} else {
		const templateVars = {
			urls: urlsForUserDB,
			// urls: urlDatabase,
			user: user,
		};
		res.render('urls_index', templateVars);
	}
});

//create a new shortened url
app.get('/urls/new', (req, res) => {
	const user_id = req.session.user_id;
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
		user: user,
	};

	res.render('urls_new', templateVars);
});

// app.post("/urls/new", (req, res) => {
//   res.redirect("/urls");
// });

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
	// if (req.params.shortURL) {
	const shortURL = req.params.shortURL;
	const longURL = urlDatabase[shortURL].longURL;
	res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
	//shortURL --> I am assigning a value from req.params, which I have called shortURL; longURL -->I am accessing a value;
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
	//req.params allows access to variables in url
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
		// user_id: req.cookies['user_id'],
		// email: req.params.email,
	};
	res.render('urls_login', templateVars);
});

//redirect to user's existing list of urls
app.post('/login', (req, res) => {
	const userEmail = req.body.email;
	const userPW = req.body.password;
	// const user_id = users['user_id'];
	// res.cookie('user_id', user_id);
	//if statements
	if (!userEmail || !userPW) {
		return res.send('must fill out valid email and password');
	}
	const user = getUserByEmail(userEmail);
	if (user === null) {
		return res.send('No user found with that email.');
	}

	// if (user.password !== userPW) {
	if (!bcrypt.compareSync(userPW, user.password)) {
		//andre
		return res.send('Username or password incorrect: please try again');
	} else {
		//andre added "else" from line 258 - 264

		const user_id = users.user_id;
		req.session.user_id = user.id; //andre
		// res.cookie('user_id', user.id);
		res.redirect('/urls');
	}
});

app.post('/logout', (req, res) => {
	req.session = null;
	//res.clear('user_id');
	res.redirect('/urls');
});

//goes to page to register as a user
app.get('/register', (req, res) => {
	let templateVars = {
		// urls: urlDatabase,
		user: req.session.user_id,
		// email: req.params.email, /// andre commented out
		// password: req.params.password
	};
	res.render('urls_register', templateVars);
});

//validates registration, sends user to urls
app.post('/register', (req, res) => {
	const user_id = getRandomString(5);
	const userEmail = req.body.email;
	const userPW = req.body.password;
	//if empty strings --> response = 404 statuscode
	if (!userEmail || !userPW || emailExists(userEmail)) {
		res.status(400).send('Sorry, your email or password is invalid.');
	} else {
		req.session.user_id = user_id;
		const hashedPassword = bcrypt.hashSync(userPW, 10); //andre
		users[user_id] = {
			id: user_id,
			email: userEmail,
			password: hashedPassword, //andre
			// password: userPW,      //jen to be removed this line
		};

		//move inside else stat
		//res.cookie('user_id', user_id);
		res.redirect('/urls');
	}
});