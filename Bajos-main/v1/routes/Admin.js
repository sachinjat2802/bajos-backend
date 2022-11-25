const express = require('express');
const router = express.Router();

const adminControllers = require("../controller").admin
const authService = require("../../auth/authService")

/*
  ON BOARDING
*/
router.post('/register', adminControllers.register)
router.post('/login', adminControllers.login)

/*
  PROFILE MANAGEMENT
*/
router.get('/getProfile', authService.adminAuth, adminControllers.getProfile)
router.put('/updateProfile', authService.adminAuth, adminControllers.updateProfile)
router.put('/changePassword', authService.adminAuth, adminControllers.changePassword)

/*
  CATEGORY MANAGEMENT
*/
router.post('/addCategory', authService.adminAuth, adminControllers.addCategory)
router.get('/getAllCategory', authService.adminAuth, adminControllers.getAllCategory)
router.delete('/deleteCategory', authService.adminAuth, adminControllers.deleteCategory)

/*
  RAW MATERIAL MANAGEMENT
*/
router.post('/addRawMaterial', adminControllers.addRawMaterial)
router.get('/getAllRawMaterial', adminControllers.getAllRawMaterial)
router.get('/getRawMaterialById', adminControllers.getRawMaterialById)
router.put('/editRawMaterial', adminControllers.editRawMaterial)
router.delete('/deleteRawMaterial', adminControllers.deleteRawMaterial)

router.put('/addQuantity', adminControllers.addQuantity)
router.get("/rowMaterialLogByID",adminControllers.rowMaterialLogByID)

router.get("/rawMaterialMeasureUnits",adminControllers.rawMaterialMeasureUnits)

/*
  Product MANAGEMENT
*/
router.post('/addProduct', adminControllers.addProduct)
router.get('/getAllProduct', adminControllers.getAllProduct)
router.get('/getProductById', adminControllers.getProductById)
router.put('/editProduct', adminControllers.editProduct)
router.delete('/deleteProduct', adminControllers.deleteProduct)
router.put('/reduceQuantity', adminControllers.reduceQuantity)

router.put('/addProductQuantity', adminControllers.addProductQuantity)
router.get("/productTypes",adminControllers.productTypes)
router.get("/productSize/:product",adminControllers.productSize)


/*
  CONTRACTOR MANAGEMENT
*/
router.post('/addContractor', adminControllers.addContractor)
router.get('/getAllContractor', adminControllers.getAllContractor)
router.get('/getContractorById', adminControllers.getContractorById)
router.put('/editContractor', adminControllers.editContractor)
router.delete('/deleteContractor', adminControllers.deleteContractor)

router.put('/assignRawMaterialToContractor/:id', adminControllers.assignRawMaterialToContractor)

/*
  MANUFACTURING MANAGEMENT
*/
router.post('/createProduction', adminControllers.createProduction)
router.post('/recieveProduct/:id', adminControllers.recieveProduct)
router.get('/listManufacteringProducts', adminControllers.listManufacteringProducts)
router.get('/detailedReport', adminControllers.detailedReport)

module.exports = router;
