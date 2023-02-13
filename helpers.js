const bcrypt = require("bcryptjs");

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const addUser = (newUser, database) => {
  const newUserId = generateRandomString();
  newUser.id = newUserId;
  newUser.password = bcrypt.hashSync(newUser.password, 10);
  database[newUserId] = newUser;
  return newUser;
};

const checkIfAvail = (newVal, database) => {
  for (user in database) {
    if (database[user].email === newVal) {
      return true;
    }
  }
  return null;
}


const generateRandomString = () => {
  let ran = (Math.random() + 1).toString(36).substring(7);
  return ran
};


const verifyShortUrl = (URL, database) => {
  return database[URL];
};

const fetchUserInfo = (email, database) => {
  for (key in database) {
    if (database[key]['email-address'] === email) {
      return database[key]
    }
  }
}

const checkOwner = (userId, urlID, database) => {
  return userId === database[urlID].userID;
};

const urlsForUser = (id, database) => {
  let currentUserId = id;
  let usersURLs = {};
  for (let key in database) {
    if (database[key].userID === currentUserId) {
      usersURLs[key] = database[key];
    }
  }
  return usersURLs;
};

const currentUser = (cookie, database) => {
  for (let ids in database) {
    if (cookie === ids ) {
      return database[ids]
    }
  }
};

const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: 'abcd'},

  "9sm5xK": {longURL: "http://www.google.com", userID: 'abcd'}
};


const userDatabase = {
  'abcd': {id: 'abcd', 'email': 'test@hotmail.com', password: bcrypt.hashSync('1234')},
  
};

module.exports = { getUserByEmail, addUser, checkIfAvail, generateRandomString, verifyShortUrl, fetchUserInfo, checkOwner, urlsForUser, urlDatabase, userDatabase, currentUser};