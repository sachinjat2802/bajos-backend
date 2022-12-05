const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {CrudOperations}=require("../../utility/moongodbCrud")
const Model = require("../../models");
const validations = require('../validation');
const utility = require("../../utility").commonFunction;
const messages = require('../../utility/messages').APP_MESSAGES;
const responses = require('../../utility/response')
const constant = require('../../utility/constant');
const { rawMaterial } = require("../../models");

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
exports.addQuantity=addQuantity;
exports.getAllRawMaterial = getAllRawMaterial;
exports.getRawMaterialById = getRawMaterialById;
exports.editRawMaterial = editRawMaterial;
exports.deleteRawMaterial = deleteRawMaterial;
exports.rowMaterialLogByID=rowMaterialLogByID;
exports.rawMaterialMeasureUnits=rawMaterialMeasureUnits;
exports.getRawMaterialContracterById=getRawMaterialContracterById;
exports.getRawMaterialAssignedToAllContracters=getRawMaterialAssignedToAllContracters;
exports.getAllProductsRecieved=getAllProductsRecieved;
//product management
exports.addProduct = addProduct;
exports.getAllProduct = getAllProduct;
exports.getProductById = getProductById;
exports.editProduct = editProduct;
exports.deleteProduct = deleteProduct;
exports.reduceQuantity = reduceQuantity;
exports.addProductQuantity=addProductQuantity;

exports.productTypes=productTypes;
exports.productSize=productSize;
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

exports.assignRawMaterialToContractor=assignRawMaterialToContractor;

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
  console.log(req.body)

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
    req.body.updateLogs=[{time:new Date(),quantity:req.body.quantityAvailable,note:"initial material added"}]
    let dataToSend = await Model.rawMaterial.create(req.body);
    delete dataToSend.updateLogs;
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
   async function rawMaterialMeasureUnits(req, res, next)  {
  try {
    let dataToSend = await new CrudOperations(Model.unit).getDocument({name:"rawMaterials"})
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend.types, messages.SUCCESS)

  }
  catch (error) {
    next(error);
  }
}


async function getRawMaterialContracterById(req, res, next) {
  try {
    console.log(req.query.id)
//await validations.admin.validateGetRawMaterialById(req)
    //API LOGIC//

    let dataToSend = await Model.rawMaterial.findOne({ _id: ObjectId(req.query.id) })
    for(let i in dataToSend.contractorUseLogs){
      dataToSend.contractorUseLogs[i].time = dataToSend.contractorUseLogs[i].time.toLocaleDateString();
    }
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend?.contractorUseLogs, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function rowMaterialLogByID(req, res, next) {
  try {
    console.log(req.query.id)
//await validations.admin.validateGetRawMaterialById(req)
    //API LOGIC//

    let dataToSend = await Model.rawMaterial.findOne({ _id: ObjectId(req.query.id) })
    for(let i in dataToSend.updateLogs){
      dataToSend.updateLogs[i].time = dataToSend.updateLogs[i].time.toLocaleDateString();
    }
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend?.updateLogs, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function editRawMaterial(req, res, next) {
  try {
    await validations.admin.validateEditRawMaterial(req)
    //API LOGIC//

    let data = await new CrudOperations(Model.rawMaterial).getDocument({_id: ObjectId(req.body.id)})
    console.log(data)

    data ={...data,...req.body}
    console.log(data)
    let dataToSend = await new CrudOperations(Model.rawMaterial).updateDocument({ _id: ObjectId(req.body.id) },req.body)
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.UPDATE_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function addQuantity(req, res, next) {
  try {
      let rawMaterial =await new CrudOperations(Model.rawMaterial).getDocument({_id:ObjectId(req.body.id)})
      rawMaterial.updateLogs.push({time:new Date(),quantity:req.body.quantity,note:req.body.note})
      let updateRawMaterial = await new CrudOperations(Model.rawMaterial).updateDocument({_id:ObjectId(req.body.id)},{quantityAvailable:Number(rawMaterial.quantityAvailable)+Number(req.body.quantity),updateLogs:rawMaterial.updateLogs})
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, updateRawMaterial, messages.UPDATE_SUCCESS)
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

    req.body.contains=req.body.raw
    req.body.updateRawMaterialsLogs=[]
    req.body.updateLogs=[{time:new Date(),quantity:req.body.availableQty,note:`added ${req.body.name}`}]
   if(req.body.raw){
    for(const i in req.body.raw){
      const rowMaterial = await new CrudOperations(Model.rawMaterial).getDocument({_id:ObjectId(req.body.raw[i].rm)})
      req.body.updateRawMaterialsLogs.push({name:`${rowMaterial.name}`,time:new Date(),quantity:req.body.raw[i].qty,note:`initial material added for ${req.body.name}`})
    }
   }
    let dataToSend = await Model.product.create(req.body);
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.ADD_SUCCESS)
  } catch (error) {
    next(error);
  }
}

async function productTypes(req, res, next)  {
  try {
    let dataToSend = await new CrudOperations(Model.unit).getDocument({name:"products"})
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend.types, messages.SUCCESS)

  }
  catch (error) {
    next(error);
  }
}
async function productSize(req, res, next)  {
  try {
    console.log(req.params)
    let dataToSend = await new CrudOperations(Model.unit).getDocument({name:req.params.product})
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend.types, messages.SUCCESS)

  }
  catch (error) {
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
      for(const i in list){
        for(const j in list[i].contains){
          const rawMaterial = await new CrudOperations(Model.rawMaterial).getDocument({_id:list[i].contains[j].rm})
          list[i].contains[j].rm = rawMaterial.name
        }
      }
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

async function addProductQuantity(req, res, next) {
  try {
      let product =await new CrudOperations(Model.product).getDocument({_id:ObjectId(req.body.id)})
      product.updateLogs.push({time:new Date(),quantity:Number(req.body.quantity),note:req.body.note})
      let updateProduct = await new CrudOperations(Model.product).updateDocument({_id:ObjectId(req.body.id)},{availableQty:Number(product.availableQty)+Number(req.body.quantity),updateLogs: product.updateLogs})
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, updateProduct, messages.UPDATE_SUCCESS)
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
async function getRawMaterialAssignedToAllContracters(req,res,next){
try{
  const contractors = await new CrudOperations(Model.contractor).getAllDocuments({},{},{pageNo:0,limit:0})
 const dataTosend =[];
  for(let i in contractors){
    for(let j in contractors[i].assignRawMaterial){
      let rawMaterial = await new CrudOperations(Model.rawMaterial).getDocument({_id:ObjectId(contractors[i].assignRawMaterial[j].rm)})
     
      dataTosend.push({
        contractor:contractors[i].name,
        rawMaterial:rawMaterial.name,
        quantity:contractors[i].assignRawMaterial[j].qty,
        pricePerUnit:contractors[i].assignRawMaterial[j].pricePerUnit,
        date:contractors[i].assignRawMaterial[j].date.toLocaleDateString(),
        note:contractors[i].assignRawMaterial[j].note
      })
    }
    
  }
  return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataTosend, messages.UPDATE_SUCCESS)


}catch (error) {
    next(error);
  }
}

async function assignRawMaterialToContractor(req,res,next){
  try{
    const contractor = await new CrudOperations(Model.contractor).getDocument({_id:ObjectId(req.params.id)})
    let flag =true;
    for(const i in contractor?.assignRawMaterial){

      if(contractor?.assignRawMaterial[i].rm === req.body.rawMaterial){
        flag= false;
        contractor.assignRawMaterial[i].qty=Number(contractor.assignRawMaterial[i].qty)+Number(req.body.quantity);
        contractor.assignRawMaterial[i].pricePerUnit=Number(req.body.pricePerUnit)??contractor.assignRawMaterial[i].pricePerUnit;
      }
    }
    if(contractor?.assignRawMaterial.length === 0 || flag){
     
      contractor?.assignRawMaterial.push({rm:req.body.rawMaterial,qty:Number(req.body.quantity),pricePerUnit:req.body.pricePerUnit,date:new Date()})
    }
    const rawMaterial= await new CrudOperations(Model.rawMaterial).getDocument({_id:ObjectId(req.body.rawMaterial)});
    rawMaterial?.contractorUseLogs.push({time:new Date(),contractor:`${contractor?.name}`,qty:Number(req.body.quantity),note:req.body.note,pricePerUnit:Number(req.body.pricePerUnit)});
    if(rawMaterial.quantityAvailable<req.body.quantity){
      return responses.sendFailResponse(req, res, constant.STATUS_CODE.BAD_REQUEST,  `row material is not available in stock`)
    }
    await new CrudOperations(Model.rawMaterial).updateDocument({_id:ObjectId(req.body.rawMaterial)},{contractorUseLogs:rawMaterial.contractorUseLogs,quantityAvailable:Number(rawMaterial.quantityAvailable)-Number(req.body.quantity),pricePerUnit:Number(req.body.pricePerUnit)})
    
    let updateContractor = await new CrudOperations(Model.contractor).updateDocument({_id:ObjectId(req.params.id)},{assignRawMaterial:contractor?.assignRawMaterial});
    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, updateContractor, messages.UPDATE_SUCCESS)
}catch (error) {
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

      console.log(productData.contains)
    let contain = productData.contains
    for (let i = 0; i < req.body.rawMaterial.length; i++) {
      let expectedQty;
      let expectedProductQty;
      let costPerPcs = 0;
      let rawMaterial = await Model.rawMaterial.findOne({ _id: ObjectId(req.body.rawMaterial[i].materialId) })
      //match product data and add expected quantity
      
      contain.forEach((e) => {
        if (req.body.rawMaterial[i].materialId == e.rm) {
          expectedQty = req.body.rawMaterial[i].quantityAssigned % Number(e.qty);
          req.body.rawMaterial[i].expectedQuantity = expectedQty

          expectedProductQty = Math.floor(req.body.rawMaterial[i].quantityAssigned / Number(e.qty))

          costPerPcs += req.body.rawMaterial[i].quantityAssigned * Number(rawMaterial.price)

        }
      })
      console.log(expectedProductQty)

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
    const product = await new CrudOperations(Model.product).getDocument({_id:ObjectId(req.params.id)})
    const contractor = await new CrudOperations(Model.contractor).getDocument({_id:ObjectId(req.body.contractorId)})
    let price =0;
    for(const j in contractor.assignRawMaterial){

    for(const i in product.contains){


        if(product.contains[i].rm === contractor.assignRawMaterial[j].rm){

          contractor.assignRawMaterial[j].qty=Number(contractor.assignRawMaterial[j].qty) - Number(product.contains[i].qty);

         price = price+ (Number(product.contains[i].qty)*Number(contractor.assignRawMaterial[j].pricePerUnit))
         console.log(price)

           await new CrudOperations(Model.contractor).updateDocument({_id:ObjectId(req.body.contractorId)},{assignRawMaterial:contractor.assignRawMaterial[j]})
        }
      }
    }  

    let dataToSend = await new CrudOperations(Model.product).updateDocument({_id:ObjectId(req.params.id)},{status:"recieved", price: price +(Number(req.body.labourCost??0))})
    dataToSend.price =  price +(Number(req.body.labourCost??0))

    return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
  } catch (error) {
    next(error);
  }
}
async function getAllProductsRecieved(req,res,next){
try{
  const dataToSend = []
  const data = await new CrudOperations(Model.product).getAllDocuments({status:"recieved"},{},{pageNo:0,limit:0})
  for(const i in data){
   dataToSend.push({
    productName: data[i].name,
    date: data[i].updatedAt.toLocaleDateString(),
    quentity:data[i].availableQty,
    sku:data[i].sku,
    price:data[i].price
})
  }
  return responses.sendSuccessResponse(req, res, constant.STATUS_CODE.OK, dataToSend, messages.SUCCESS)
}
catch (error) {           
next(error)
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