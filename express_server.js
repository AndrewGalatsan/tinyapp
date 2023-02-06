
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require("bcryptjs");

const {getUserByEmail ,addUser, checkIfAvail, generateRandomString, verifyShortUrl, checkOwner, urlsForUser, urlDatabase, userDatabase, currentUser} = require('./helpers');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['userId']
}));



app.set('view engine', 'ejs');



app.use(bodyParser.urlencoded({extended: false}));

// The above code is used as the 'setup' for this file; ie creating and initializing modules and important global variables such as urlDatabase, and userDatabase.


// root - /
// redirects to /urls if logged in, otherwise to /login
app.get("/", (req, res) => {
  const user = currentUser(req.session.userId, userDatabase);
  if (!user) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// register route that redirects you to urls if you're already logged in. Otherwise you will be found in the urls_register page.
app.get("/register", (req, res) => {
  const user = currentUser(req.session.userId, userDatabase);
  if (user.id) {
    res.redirect('/urls');
  } else {
    let templateVars = { currentUser: {} };
    res.render("urls_register", templateVars);
  }
});


// Once you register if your inputted email or password is a blank string, you will get a 400 error. If email is already part of userData, a 400 error 
// will appear that email is already taken.Otherwise a new user will be added to userDatabase and you will be redirected to urls.
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === '') {
    return res.status(400).send('Email is required');
  } 
  if (password === '') {
    return res.status(400).send('Password is required');
  } 
  if (checkIfAvail(email, userDatabase)) {
    return res.status(400).send('This email is already registered');
  } 
    const newUser = addUser(req.body, userDatabase);
    req.session.userId = newUser.id;
    res.redirect('/urls');
  
});

//urls route which if user is not logged in, it pushes the data to urls_error page, otherwise updates templateVars variable and pushes the data to urls_index.
app.get('/urls', (req, res) => {
  const user = req.session.userId
  if (!user) {
    res.render('urls_errors');
  } else {
    const usersLinks = urlsForUser(user, urlDatabase);
    let templateVars = { urls: usersLinks, currentUser: currentUser(req.session.userId, userDatabase) };
    res.render('urls_index', templateVars);
  }
});

// on the urls page if you are not logged in and try to click on something, an error message will be sent. Otherwise you will be redirected
// to the urls ID
  app.post('/urls', (req, res) => {
    const id = req.session.userId
    const longURL = req.body.longURL
    const shortURL = generateRandomString();
    if (!id){
      const errorMessage = 'You must be logged in to do that.';
      return res.status(401).render('urls_errors', {user: userDatabase[req.session.userId], errorMessage});
    }
    urlDatabase[shortURL] = {
      longURL,
      userID:id
    };
    res.redirect(`/urls/${shortURL}`);
  });
   
// login path which if you are logged in, you're redirected to urls, otherwise data of templateVars is pushed to urls_login.
  app.get("/login", (req, res) => {
    const user = currentUser(req.session.userId, userDatabase);
  if (user.id) {
    res.redirect('/urls');
  } else {
    let templateVars = { currentUser: user };
    res.render('login', templateVars);
  }
});

// When typing in login information, if email or password is not correct, you get a 403 error. Otherwise when you login,
// you get redirected to urls.
  app.post("/login", (req, res) => {
    const emailUsed = req.body['email'];
  const pwdUsed = req.body['password'];
    if (getUserByEmail(emailUsed, userDatabase)) {
      const { password, id } = getUserByEmail(emailUsed, userDatabase);
      if (!bcrypt.compareSync(pwdUsed, password)) {
        res.status(403).send('Error 403... please re-enter your password')
      } else {
        req.session.userId = id;
        res.redirect('/urls');
      }
    } else {
      res.status(403).send('Error 403... this email not found')
    }
  });


  app.get("/urls/new", (req, res) => {
    const user = currentUser(req.session.userId, userDatabase);
    if (!user) {
      res.redirect('/login');
    } else {
      let templateVars = { currentUser: user };
      res.render('urls_new', templateVars);
    }
  });

  // urls/id pathway which if the id is valid, but user is not in urlDatabase, there is a string that prints an error message. otherwise it stores
  // the data and puts it to urls_show. Otherwise it prints a string that this url does not exist.
  app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    const user = req.session.userId;
    if (verifyShortUrl(shortURL, urlDatabase)) {
      if (user !== urlDatabase[shortURL].userID) {
        res.send('This id is not yours');
    } else {
      const longURL = urlDatabase[shortURL].longURL;
      let templateVars = { shortURL: shortURL, longURL: longURL, currentUser: currentUser(user, userDatabase)};
      res.render("urls_show", templateVars);
    }
  } else {
    res.send('This url does not exist');
    }  
  });


// redirect to longRIL
app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL]
  if (!longURL){
    return res.status(404).send('URL DOES NOT EXIST')
  }
  res.redirect(longURL)
});


// pathway to delete an id, which redirects to urls if error is not caught.
app.post("/urls/:id/delete", (req, res) => {
  if (!checkOwner(req.session.userId, req.params.id, urlDatabase)) {
    res.send('This id does not belong to you!');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }})
// pathway to edit an id, which redirects to urls if error is not caught.
  app.post("/urls/:id/edit", (req, res) => {
    if (!checkOwner(req.session.userId, req.params.id, urlDatabase)){
      res.send('This id does not belong to you!')
    }
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls')
  });
  
  app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect('/login');
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });





