
const express = require("express");
const app = express();
const PORT = 8080;
const cookie = require('cookie-parser')
app.set("view engine", "ejs");
app.use(cookie());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const shortURL = generateShortURL();
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);
});

// redirect to longRIL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (verifyShortUrl(shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send('Does not exist');
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies['user_id']}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  if (verifyShortUrl(shortURL)) {
    let longURL = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL: shortURL, longURL: longURL, user_id: req.cookies['user_id']};
    res.render("urls_show", templateVars);
  } else {
    res.send('does not exist');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const urlToDelete = req.params.id;
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const key = req.params.id;
  urlDatabase[key] = req.body.longURL;
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
  if (userDatabase[req.body.user_id]) {
    const user_id = req.body.user_id;
    res.cookie('user_id', user_id);
  }
  res.status(400).send('Something went wrong, try again')
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  templateVars = { username:req.cookies['username']}
  res.render("urls_register", templateVars);
  res.redirect('/urls');
})

const addUser = newUser => {
  const newUserId = generateShortURL();
  newUser.id = newUserId
  userDatabase[newUserId] = newUser;
  return newUser
}

const checkIfAvail = (newVal, database) => {
  for (user in database) {
    if (!user[newVal]) {
      return null;
    }
  }
  return true;
}

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    res.status(400).send('Email is required');
  } else if (password === '') {
    res.status(400).send('Password is required');
  } else if (!checkIfAvail(email, userDatabase)) {
    res.status(400), send('This email is already registered')
  }
  newUser = addUser(req.body)
  res.cookie('user_id', newUser.id)
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = lowerCase.toUpperCase();
  const numeric = '1234567890';
  const alphaNumeric = lowerCase + upperCase + numeric;
  //alphaNumeric is 62
  let index = Math.round(Math.random() * 100);
  if (index > 61) {
    while (index > 61) {
      index = Math.round(Math.random() * 100);
    }
  }
  return alphaNumeric[index];
};

const generateShortURL = () => {
  let randomString = '';
  while (randomString.length < 6) {
    randomString += generateRandomString();
  }
  return randomString;
};

const verifyShortUrl = URL => {
  return urlDatabase[URL];
};