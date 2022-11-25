class CrudOperations {
   dbModel;

  constructor(dbModel) {
    this.dbModel = dbModel;
  }

  save(obj){
    const model = new this.dbModel(obj);
    return model.save(obj);
  }

  insertOrUpdate(query, document) {
    return this.dbModel.findOneAndUpdate(
      query,
      document,
      { upsert: true, new: true }
    );
  }

  insertManyDocuments(
    docs,
    options
  ){
    return this.dbModel.insertMany(docs, options);
  }

  updateManyDocuments(
    query,
    docs,
    options,
  ){
    return this.dbModel.updateMany(query, docs, options);
  }

  
  getDocument(query, projections) {
    return this.dbModel.findOne(query, projections);
  }

  getDocumentById(id, projections) {
    return this.dbModel.findById(id, projections);
  }

 
  getAllDocuments(
    query,
    projections,
    options,//page,limit
    sort
  ) {
    const offset = options.limit * options.pageNo;
    return this.dbModel
      .find(query, projections)
      .skip(offset)
      .limit(options.limit)
      .sort(sort ? sort : { createdAt: -1 })
      .lean();
  }

  countAllDocuments(query) {
    //count method deprecated, will be removed in later versions
    return this.dbModel.countDocuments(query).lean();
  }

  
  createAndUpdateDocumentByEmail(doc) {
    return this.dbModel.findOneAndUpdate({ email: doc.email }, doc, {
      new: true,
      upsert: true,
    });
  }

  upsertWithUpdateQuery(query ,updateQuery) {
    return this.dbModel.findOneAndUpdate(query, updateQuery, {
      upsert: true,
      new: true,
    });
  }

  upsertWithReturnDocuments(query,updateObj) {
    return this.dbModel.findOneAndUpdate(
      query,
      { $set: updateObj },
      { upsert: true, new: true }
    );
  }

  updateDocument(query, doc) {
    return this.dbModel
      .findOneAndUpdate(query, { $set: doc }, { new: true })
      .lean();
  }

  updateOneDocument(query, doc) {
    return this.dbModel
      .findOneAndUpdate(query, doc, { new: true })
      .lean();
  }

  updateAllDocuments(query, doc){
    return this.dbModel.updateMany(query, { $set: doc }, { new: true });
  }

  updateSubDocument(query, doc, options) {
    return this.dbModel.update(query, { $push: doc }, options);
  }

  deleteDocument(query){
    return this.dbModel.deleteOne(query);
  }

  deleteAllDocuments(query){
    return this.dbModel.deleteMany(query);
  }

  getSchema() {
    return this.dbModel.schema;
  }
}

module.exports = {
  CrudOperations
}