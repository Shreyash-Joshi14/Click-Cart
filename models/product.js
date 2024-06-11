const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Product", productSchema);

// const { ObjectId } = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db
//         .collection("products") // here we are accessing or creating if not created the collection which stores the data by passing the name of the collection
//         .insertOne(this);
//     }
//     return dbOp
//       .then((result) => console.log(result))
//       .catch((err) => console.log(err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then((products) => {
//         console.log(products);
//         return products;
//       })
//       .catch((err) => console.log(err));
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new ObjectId(prodId) })
//       .next()
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new ObjectId(prodId) })
//       .then((result) => console.log(result))
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = Product;

// //CODE FOR SEQUELIZE

// // const Sequelize = require("sequelize");

// // const sequelize = require("../util/database");

// // const Product = sequelize.define("product", {
// //   id: {
// //     type: Sequelize.INTEGER,
// //     autoIncreament: true,
// //     primaryKey: true,
// //   },
// //   title: Sequelize.STRING,
// //   price: {
// //     type: Sequelize.DOUBLE,
// //     allowNull: false,
// //   },
// //   imageUrl: {
// //     type: Sequelize.STRING,
// //     allowNull: false,
// //   },
// //   description: {
// //     type: Sequelize.STRING,
// //     allowNull: false,
// //   },
// // });

// // module.exports = Product;

// // CODE FOR VANILLA MYSQL

// // const fs = require("fs");
// // const path = require("path");

// // const Cart = require("./cart");

// // const db = require("../util/database");

// // const p = path.join(path.join(__dirname, "../", "data", "products.json"));

// // module.exports = class Product {
// //   constructor(id, title, imageUrl, description, price) {
// //     this.id = id;
// //     this.title = title;
// //     this.imageUrl = imageUrl;
// //     this.description = description;
// //     this.price = price;
// //   }

// //   save() {
// //     // return db.execute( //my approach see it  this works
// //     //   `INSERT INTO products (title, price, description, imageUrl); VALUES (${this.title},${this.price},${this.description},${this.imageUrl})`
// //     // );

// //     return db.execute(
// //       "INSERT INTO products(title, price, description, imageUrl) VALUES(?, ?, ?, ?)",
// //       [this.title, this.price, this.description, this.imageUrl]
// //     );
// //     //here we are passing the values in this array to check for the data passed by the user doesn't contain any sql query also called SQL INJECTION ATTACK
// //   }

// //   static deleteById(id) {}

// //   static fetchAll() {
// //     return db.execute("SELECT * FROM products");
// //   }

// //   static findById(id) {
// //     return db.execute("SELECT * FROM products WHERE products.id = ?", [id]);
// //   }
// // };
