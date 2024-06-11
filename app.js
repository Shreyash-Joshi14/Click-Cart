const path = require("path");
const fs = require("fs");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const mongoose = require("mongoose");

const session = require("express-session");

const adminRoutes = require("./routes/admin"); //we need to import the file having the middleware for different router
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const MongoDBStore = require("connect-mongodb-session")(session);

const MONGODB_URI = process.env.MONGODB_URI;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

const privateKey = process.env.SERVER_KEY;
const certificate = process.env.SERVER_CERTIFICATE;

const User = require("./models/user");

// db.execute("SELECT * FROM products") //to show use of db pool
//   .then((result) => {
//     console.log(result[0], result[1]);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false })); //parsing of data is done at the top most middleware as data is first parsed the made available
app.use(multer({ dest: "images", fileFilter: fileFilter }).single("image")); //using for accessing data like files
app.use(express.static(path.join(__dirname, "public"))); //this makes the folder available for client to see if needed by them
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error("dummy error");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch((err) => {
      next(err);
    });
});

app.use("/admin", adminRoutes); //then to use the routing middlewares we need to pass them in the use function in the order which is very important
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
