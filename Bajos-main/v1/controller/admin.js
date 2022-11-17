const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Model = require("../../models");
const validations = require('../validation');
const utility = require("../../utility").commonFunction;
const messages = require('../../utility/messages').APP_MESSAGES;
const responses = require('../../utility/response')
const constant = require('../../utility/constant');

//onboarding
exports.register = register;
exports.login = login;
// profile management
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
// profile management
exports.addCategory = addCategory;
exports.getAllCategory = getAllCategory;
exports.deleteCategory = deleteCategory;
//Raw Material management
exports.addRawMaterial = addRawMaterial;
exports.getAllRawMaterial = getAllRawMaterial;
exports.getRawMaterialById = getRawMaterialById;
exports.editRawMaterial = editRawMaterial;
exports.deleteRawMaterial = deleteRawMaterial;
//product management
exports.addProduct = addProduct;
exports.getAllProduct = getAllProduct;
exports.getProductById = getProductById;
exports.editProduct = editProduct;
exports.deleteProduct = deleteProduct;
exports.reduceQuantity = reduceQuantity;
//contractor management
exports.addContractor = addContractor;
exports.getAllContractor = getAllContractor;
exports.getContractorById = getContractorById;
exports.editContractor = editContractor;
exports.deleteContractor = deleteContractor;
//contractor management
exports.createProduction = createProduction;
exports.listManufacteringProducts = listManufacteringProducts;
exports.recieveProduct = recieveProduct;
exports.detailedReport = detailedReport;

/* HELPER FUNCTION */
function calculateExpectedProductQty(data) {
  let qty = 0;



  return qty
}

/* ON BOARDING */

async function register(req, res, next) {
  try {
    await validations.admin.validateRegister(req)
    //API LOGIC//

    const findUser = await Model.admin.findOne({ phone: req.body.phone })
    if (findUser) throw messages.DUPLICATE_PHONE
    req.body.passwordHash = await utility.hashPasswordUsingBcrypt(req.body.password)

    // Add record to database
    const user = await Model.admin.create(req.body);
    if (!user) throw messages.SOMETHING_WENT_WRONG

    // create jwt token and refresh token
    const token = await utility.jwtSign({
      _id: user._id
    })

    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.CREATED, token, messages.SIGNUP_SCCESS)
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    await validations.admin.validateLogin(req)
    //API LOGIC//

    //varify email
    let user = await Model.admin.findOne({ phone: req.body.phone });
    if (!user) throw messages.PHONE_UNREGISTERED

    // check password 
    const match = await utility.comparePasswordUsingBcrypt(req.body.password, user.passwordHash);
    if (!match) throw messages.INCORRECT_PASSWORD

    // Assign token
    const token = await utility.jwtSign({
      _id: user._id,
    });

    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, token, messages.LOGIN_SCCESS)

  } catch (error) {
    next(error);
  }
}

/* PROFILE MANAGEMENT */

async function getProfile(req, res, next) {
  try {
    //API LOGIC//

    let dataToSend = await Model.admin.findOne({ _id: ObjectId(req.user._id) }).lean();
    delete dataToSend.passwordHash
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    //API LOGIC//

    let dataToSend = await Model.admin.findOneAndUpdate({ _id: ObjectId(req.user._id) }, req.body, { new: true }).lean();
    delete dataToSend.passwordHash
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    await validations.admin.validateChangePassword(req, "body", req.user.forResetPassword)
    //API LOGIC//

    if (!req.user.forResetPassword) {
      //Check old password 
      const match = await utility.comparePasswordUsingBcrypt(req.body.oldPassword, req.user.passwordHash)
      if (!match) throw messages.INCORECT_OLD_PASSWORD
      //Update db and send response
      await Model.admin.findByIdAndUpdate(req.user._id, { $set: { passwordHash: await utility.hashPasswordUsingBcrypt(req.body.password) } })
      return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, {}, messages.PASSWORD_CHANGE_SUCCESS)
    }
    //Update db and send response in case of forgot password
    await Model.admin.findByIdAndUpdate(req.user._id, { $set: { passwordHash: await utility.hashPasswordUsingBcrypt(req.body.password) } })
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, {}, messages.PASSWORD_CHANGE_SUCCESS)
  } catch (error) {
    next(error);
  }
}
/* CATEGORY MANAGEMENT */

async function addCategory(req, res, next) {
  try {
    //API LOGIC//

    let dataToSend = await Model.category.create(req.body);
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.ADD_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getAllCategory(req, res, next) {
  try {
    //API LOGIC//

    const list = await Model.category.find()
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, list, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    //API LOGIC//

    await Model.category.findOneAndRemove({ _id: ObjectId(req.query.id) });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, {}, messages.DELETE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

/* RAW MATERIAIL MANAGEMENT */

async function addRawMaterial(req, res, next) {
  try {
    await validations.admin.validateAddRawMaterial(req)
    //API LOGIC//

    let dataToSend = await Model.rawMaterial.create(req.body);
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.ADD_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getAllRawMaterial(req, res, next) {
  try {
    const dataToSend = {};
    await validations.admin.validateListAllRawMaterial(req)
    //API LOGIC//
    let page = parseInt(req.query.page) || 0;
    let limit = parseInt(req.query.limit) || 10;

    const count = await Model.rawMaterial.countDocuments({});
    let list = await Model.rawMaterial.find({}).skip(page * limit).sort({ createdAt: -1 })

    dataToSend.list = list || [];
    dataToSend.count = count;
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getRawMaterialById(req, res, next) {
  try {
    await validations.admin.validateGetRawMaterialById(req)
    //API LOGIC//

    let dataToSend = await Model.rawMaterial.findOne({ _id: ObjectId(req.query.id) })
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function editRawMaterial(req, res, next) {
  try {
    await validations.admin.validateEditRawMaterial(req)
    //API LOGIC//

    let dataToSend = await Model.rawMaterial.findOneAndUpdate({ _id: ObjectId(req.body.id) }, req.body, { new: true });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.UPDATE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function deleteRawMaterial(req, res, next) {
  try {
    await validations.admin.validateDeleteRawMaterial(req)
    //API LOGIC//

    await Model.rawMaterial.findOneAndRemove({ _id: ObjectId(req.query.id) });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, {}, messages.DELETE_SUCCESS)
  } catch (error) {
    next(error);
  }
}
/* PRODUCT MANAGEMENT */

async function addProduct(req, res, next) {
  try {
    await validations.admin.validateAddProduct(req)
    //API LOGIC//

    let dataToSend = await Model.product.create(req.body);
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.ADD_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getAllProduct(req, res, next) {
  try {
    await validations.admin.validateListAllProduct(req)
    //API LOGIC//
    const dataToSend = {};
    let page = parseInt(req.query.page) || 0;
    let limit = parseInt(req.query.limit) || 10;

    const count = await Model.product.countDocuments({});
    let list = await Model.product.find({}).skip(page * limit).sort({ createdAt: -1 })
      .populate("contains.rawMaterial")

    dataToSend.list = list || [];
    dataToSend.count = count;
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    await validations.admin.validateGetProductById(req)
    //API LOGIC//

    let dataToSend = await Model.product.findOne({ _id: ObjectId(req.query.id) })
      .populate("contains.rawMaterial")

    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function editProduct(req, res, next) {
  try {
    await validations.admin.validateEditProduct(req)
    //API LOGIC//

    let dataToSend = await Model.product.findOneAndUpdate({ _id: ObjectId(req.body.id) }, req.body, { new: true });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.UPDATE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await validations.admin.validateDeleteProduct(req)
    //API LOGIC//

    await Model.product.findOneAndRemove({ _id: ObjectId(req.query.id) });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, {}, messages.DELETE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function reduceQuantity(req, res, next) {
  try {
    await validations.admin.validateReduceQuantity(req)
    //API LOGIC//

    let dataToSend = await Model.product.findOneAndUpdate({ _id: ObjectId(req.body.id) }, { $inc: { availableQty: -parseInt(req.body.quantity) } }, { new: true });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.UPDATE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

/* CONTRACTOR MANAGEMENT */

async function addContractor(req, res, next) {
  try {
    await validations.admin.validateAddContractor(req)
    //API LOGIC//

    let dataToSend = await Model.contractor.create(req.body);
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.ADD_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getAllContractor(req, res, next) {
  try {
    await validations.admin.validateListAllContractor(req)
    //API LOGIC//
    const dataToSend = {};
    let page = parseInt(req.query.page) || 0;
    let limit = parseInt(req.query.limit) || 10;

    const count = await Model.contractor.countDocuments({});
    let list = await Model.contractor.find({}).skip(page * limit).sort({ createdAt: -1 })

    dataToSend.list = list || [];
    dataToSend.count = count;
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function getContractorById(req, res, next) {
  try {
    await validations.admin.validateGetContractorById(req)
    //API LOGIC//

    let dataToSend = await Model.contractor.findOne({ _id: ObjectId(req.query.id) })
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function editContractor(req, res, next) {
  try {
    await validations.admin.validateEditContractor(req)
    //API LOGIC//

    let dataToSend = await Model.contractor.findOneAndUpdate({ _id: ObjectId(req.body.id) }, req.body, { new: true });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.UPDATE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function deleteContractor(req, res, next) {
  try {
    await validations.admin.validateDeleteContractor(req)
    //API LOGIC//

    await Model.contractor.findOneAndRemove({ _id: ObjectId(req.query.id) });
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, {}, messages.DELETE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

/* MANUFACTURING MANAGEMENT */

async function createProduction(req, res, next) {
  try {
    // await validations.admin.validateCreateProduction(req)
    //API LOGIC//
    let productData = await Model.product.findOne({ _id: ObjectId(req.body.productId) })
      .populate("contains.rawMaterial")
    let contain = productData.contains
    for (let i = 0; i < req.body.rawMaterial.length; i++) {
      let expectedQty;
      let expectedProductQty;
      let costPerPcs = 0;
      let rawMaterial = await Model.rawMaterial.findOne({ _id: ObjectId(req.body.rawMaterial[i].materialId) })
      //match product data and add expected quantity
      contain.forEach((e) => {
        if (req.body.rawMaterial[i].materialId == e.rawMaterial._id) {
          expectedQty = req.body.rawMaterial[i].quantityAssigned % e.rawQuantity;
          req.body.rawMaterial[i].expectedQuantity = expectedQty
          expectedProductQty = Math.floor(req.body.rawMaterial[i].quantityAssigned / e.rawQuantity)
          costPerPcs += req.body.rawMaterial[i].quantityAssigned * req.body.rawMaterial[i].price
        }
      })
      req.body.expectedProductQty = expectedProductQty
      req.body.costPerPcs = costPerPcs + (req.body.labourCost * expectedProductQty)
      //reduce raw material qty from db
      rawMaterial.quantityAvailable = rawMaterial.quantityAvailable - req.body.rawMaterial[i].quantityAssigned
      rawMaterial.save()
    }
    req.body.productAssignedOn = new Date();
    const dataToSend = await Model.manufacturing.create(req.body);

    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.ADD_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function listManufacteringProducts(req, res, next) {
  try {
    // await validations.admin.validateListManufacteringProducts(req)
    //API LOGIC//
    const dataToSend = {};
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const count = await Model.manufacturing.countDocuments({});
    const list = await Model.manufacturing.find({}).skip(page * limit).sort({ createdAt: -1 })
      .populate("contractorId", "name")
      .populate("productId", "name")
      .populate("rawMaterial.materialId", "name")
    dataToSend.list = list || [];
    dataToSend.count = count;
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function recieveProduct(req, res, next) {
  try {
    // await validations.admin.validateRecieveProduct(req)
    //API LOGIC//
    req.body.productRecievedOn = new Date();
    let dataToSend = await Model.manufacturing.findOneAndUpdate({ _id: ObjectId(req.body.id) }, req.body, { new: true })
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function detailedReport(req, res, next) {
  try {
    // await validations.admin.validateDetailedReport(req)
    //API LOGIC//

    let dataToSend = await Model.manufacturing.find({})
      .populate("contractorId", "name")
      .populate("productId", "name")
      .populate("rawMaterial.materialId", "name")
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.UPDATE_SUCCESS)
  } catch (error) {
    next(error);
  }
}