const bcrypt = require('bcrypt');

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
    if (!user[newVal]) {
      return null;
    }
  }
  return true;
}


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



module.exports = { getUserByEmail, addUser, checkIfAvail, generateRandomString, verifyShortUrl, fetchUserInfo, checkOwner, urlsForUser};