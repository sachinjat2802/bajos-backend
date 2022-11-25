const joi = require('joi');

const validateSchema = async (inputs, schema) => {
  try {
    const { error, value } = schema.validate(inputs);
    if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, '') : "";
    else return false;
  } catch (error) { throw error; }
};

const validateRegister = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    phone: joi.string().regex(/^[0-9]+$/).min(5).max(15).required(),
    password: joi.string().allow('').required(),
  });

  return await validateSchema(req[property], schema);
}
const validateLogin = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    phone: joi.string().regex(/^[0-9]+$/).min(5).max(15).required(),
    password: joi.string().allow('').required(),
  });

  return await validateSchema(req[property], schema);
}
const validateChangePassword = async (req, property = 'body', forReset) => {
  let schema = {}
  if (forReset) {
    schema = joi.object().keys({
      password: joi.string().required()
    });
  } else {
    schema = joi.object().keys({
      oldPassword: joi.string().required(),
      password: joi.string().required()
    });
  }
  return await validateSchema(req[property], schema);
}
const validateAddRawMaterial = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    name: joi.string().allow('').required(),
    sku: joi.string().allow('').required(),
    quantityAvailable: joi.number().required(),
    measurementUnit: joi.string().required(),
    price:joi.number().allow('').required(),
  });
  return await validateSchema(req[property], schema);

}
const validateListAllRawMaterial = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    page: joi.number().optional(),
    limit: joi.number().optional(),
  });
  return await validateSchema(req[property], schema);

}
const validateEditRawMaterial = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).required(),
    name: joi.string().allow('').required(),
    sku: joi.string().allow('').required(),
    quantityAvailable: joi.number().required(),
    measurementUnit: joi.string().required(),
    price:joi.number().allow(''),

  });
  return await validateSchema(req[property], schema);

}
const validateGetRawMaterialById = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).required(),
  });
  return await validateSchema(req[property], schema);

}
const validateDeleteRawMaterial = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().required(),
  });
  return await validateSchema(req[property], schema);

}
const validateAddContractor = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    name: joi.string().allow('').required(),
    phone: joi.string().allow('').required(),
    note: joi.string().allow('').required(),
    email: joi.string().allow('').optional(),
  });
  return await validateSchema(req[property], schema);

}
const validateListAllContractor = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    page: joi.number().optional(),
    limit: joi.number().optional(),
  });
  return await validateSchema(req[property], schema);

}
const validateEditContractor = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).optional(),
    name: joi.string().allow('').optional(),
    phone: joi.string().allow('').optional(),
    note: joi.string().allow('').optional(),
    email: joi.string().allow('').optional(),
  });
  return await validateSchema(req[property], schema);

}
const validateGetContractorById = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).required(),
  });
  return await validateSchema(req[property], schema);

}
const validateDeleteContractor = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().required(),
  });
  return await validateSchema(req[property], schema);

}
const validateAddProduct = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    name: joi.string().allow('').required(),
    sku: joi.string().allow('').required(),
    colour: joi.string().allow('').optional(),
    size: joi.string().allow('').optional(),
    category: joi.string().allow('').optional(),
    contains: joi.array().optional(),
    availableQty: joi.number().optional(),
    price : joi.number().optional(),
    raw:joi.array().optional()
  });
  return await validateSchema(req[property], schema);

}
const validateListAllProduct = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    page: joi.number().optional(),
    limit: joi.number().optional(),
  });
  return await validateSchema(req[property], schema);

}
const validateEditProduct = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).required(),
    sku: joi.string().allow('').optional(),
    colour: joi.string().allow('').optional(),
    size: joi.string().allow('').optional(),
    category: joi.string().allow('').optional(),
    contains: joi.array().optional(),
  });
  return await validateSchema(req[property], schema);

}
const validateGetProductById = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).required(),
  });
  return await validateSchema(req[property], schema);

}
const validateDeleteProduct = async (req, property = 'query') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().required(),
  });
  return await validateSchema(req[property], schema);

}
const validateReduceQuantity = async (req, property = 'body') => {
  let schema = {}
  schema = joi.object().keys({
    id: joi.string().length(24).required(),
    quantity: joi.number().required(),
  });
  return await validateSchema(req[property], schema);

}

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateAddRawMaterial,
  validateListAllRawMaterial,
  validateEditRawMaterial,
  validateGetRawMaterialById,
  validateDeleteRawMaterial,
  validateAddContractor,
  validateListAllContractor,
  validateEditContractor,
  validateGetContractorById,
  validateDeleteContractor,
  validateAddProduct,
  validateListAllProduct,
  validateEditProduct,
  validateGetProductById,
  validateDeleteProduct,
  validateReduceQuantity,
}
