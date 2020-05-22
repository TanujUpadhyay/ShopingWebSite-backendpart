const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not foound",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }
    //destucher the fields

    const { price, description, name, category, stock } = fields;

    // restrication on field
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let product = new Product(fields);

    //handel file (image)
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "FIle size to big!!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //save to the Db
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "SAving product in db fail",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middlewaare
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

//delete controller
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      res.status(400).json({
        error: "Faild to delete the product",
      });
    }
    res.json({
      message: "Deleteing the product success",
      deleteProduct,
    });
  });
};

//update controller
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }

    //updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handel file (image)
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "FIle size to big!!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //save to the Db
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "updation of  product  failed",
        });
      }
      res.json(product);
    });
  });
};

// product listing
exports.getAllproducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .limit(limit)
    .sort([[sortBy, "asc"]])
    .exec((err, produts) => {
      if (err) {
        res.status(400).json({
          error: "No product found",
        });
      }
      res.json(produts);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      res.status(400).json({
        error: "No Category found",
      });
    }
    res.json(category);
  });
};

// middleware for updatestoe
exports.updateStock = (req, res, next) => {
  let myOperaations = req.body.order.product.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  Produuct.bulkWrite(myOperaations, {}, (err, products) => {
    if (err) {
      res.status(400).json({
        error: "Bulk operation faild",
      });
    }
    next();
  });
};
