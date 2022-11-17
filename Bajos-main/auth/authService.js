const Utility = require("../utility").commonFunction;
const Model = require('../models');
const mongoose = require('mongoose');
const sendFailResponse = require("../utility/response").sendFailResponse;
const message = require("../utility/messages").APP_MESSAGES

let adminAuth = async (req, res, next) => {
  try {
    if (req.headers['authorization'] || req.headers['x-access-token']) {

      let accessTokenFull = req.headers['authorization'] || req.headers['x-access-token'];
      if (accessTokenFull.startsWith('Bearer ')) {
        accessTokenFull = accessTokenFull.slice(7, accessTokenFull.length);
      }

      const decodeData = await Utility.jwtVerify(accessTokenFull);
      if (!decodeData) throw message.INVALID_TOKEN

      const userData = await Model.admin.findOne({ _id: mongoose.Types.ObjectId(decodeData._id) })

      if (userData) {
        req.user = userData
        if (decodeData.forResetPassword) req.user.forResetPassword = true;
        next()
      } else {
        throw message.INVALID_CREDENTAILS
      }
    } else {
      throw message.AUTH_TOKEN_MISSING
    }
  } catch (e) {
    next(e)
  }
}

module.exports = {
  adminAuth : adminAuth
}
