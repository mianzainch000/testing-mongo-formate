const multer = require("multer");
const Product = require("../model/productSchema");
const { createMulterUpload } = require("../helper/multer");

exports.createProduct = async (req, res) => {
  const upload = createMulterUpload();
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer Error:", err);
      return res.status(500).send({ message: "Multer error: " + err.message });
    } else if (err) {
      console.error("Upload Error:", err);
      return res.status(500).send({ message: "Upload error: " + err.message });
    }

    const { name, price, description, stock } = req.body;
    const images = req.files.map((file) => file.filename);

    try {
      let newProduct = new Product({
        name,
        price,
        description,
        stock,
        image: images,
      });

      let result = await newProduct.save();
      if (result) {
      return  res
          .status(201)
          .send({ message: "Product added successfully", product: result });
      } else {
        res.status(400).send({ message: "Some thing wrong" });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      res
        .status(500)
        .send({ message: "Something went wrong, please try again." });
    }
  });
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length > 0) {
    return  res.status(200).send(products);
    } else {
      res.status(404).send({ message: "No Record Found" });
    }
  } catch (error) {
   return res
      .status(500)
      .send({ message: "Something went wrong, please try again." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.deleteOne({ _id: req.params.id });
    if (deletedProduct) {
      return res.status(201).send({
        message: "Product deleted successfully",
        product: deletedProduct,
      });
    } else {
     return res.status(404).send({ message: "Product not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error." });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      return res.status(200).send({
        product: product,
        message: "Product fetch successfully"
      });
    } else {
      return res.status(404).send({ message: "Product not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Internal Server Error." });
  }
};
