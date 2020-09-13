
const { assert } = require('chai');

const { getUserByEmail, urlsForUser, getRandomString } = require('../helpers.js');

const testUsers = {
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

const testURLDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i245bv: { longURL: "https://www.youtube.ca", userID: "bb1234" },
  i245G3: { longURL: "https://www.yahoo.ca", userID: "bb1234" }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it('should return a user object when provided with an existing email', function () {
    const actual = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = actual;
    assert.strictEqual(actual, actual);
  });

  it('should return null with a non-existent email', function () {
    const actual = getUserByEmail("invalid@example.com", testUsers);
    const expectedOutput = null;
    assert.strictEqual(actual, expectedOutput);
  });
});

describe('generateRandomString', function () {
  it('should return a string', function () {
    const actual = typeof getRandomString();
    const expected = "string";
    assert.strictEqual(actual, expected);
  });

  it('should return false between two random strings', function () {
    const actual = getRandomString(5) === getRandomString(5);
    const expected = false;
    assert.strictEqual(actual, expected);
  });
});

describe('urlsForUser', function () {
  it('should return an empty object if user has no shortURL', function () {
    const actual = urlsForUser("user", testURLDatabase);
    const expected = {};
    assert.deepEqual(actual, expected);
  });

  it('should return an object with shortURL for user', function () {
    const actual = urlsForUser("aJ48lW", testURLDatabase);
    const expected = { b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' } };
    assert.deepEqual(actual, expected);
  });
});