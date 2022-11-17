const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


module.exports = {
  hashPasswordUsingBcrypt: async (plainTextPassword) => {
    return bcrypt.hashSync(plainTextPassword, 10);
  },
  comparePasswordUsingBcrypt: async (pass, hash) => {
    return bcrypt.compareSync(pass, hash);
  },
  jwtSign: async (payload) => {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6d' }
      )
    } catch (error) {
      throw error;
    }
  },
  jwtVerify: async (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
  jwtVerifyRefresh: async (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  },
  generateRandomString: (n) => {
    return crypto.randomBytes(n).toString("hex");
  },
  generateRandom: (n) => {
    var add = 1,
      max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.
    if (n > max) {
      return generate(max) + generate(n - max);
    }
    max = Math.pow(10, n + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;
    return ("" + number).substring(add);
  }
}
