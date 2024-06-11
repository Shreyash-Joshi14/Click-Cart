const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
require("dotenv").config();

const crypto = require("crypto");

//mailgun imports
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_KEY,
});

exports.getLogin = (req, res, next) => {
  //   const isLoggedIn = req.get("Cookie").split(";")[0].split("=")[0];
  let message = req.flash("error");
  if (message.length > 0) message = message[0];
  else message = null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  //   res.cookie("loggedIn", true);
  // res.header('Set-Cookie','loggedIn=true')
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "User not found.Please enter valid credentials!!!",
          oldInput: {
            email,
            password,
          },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid Password!!!",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [{ path: "password" }],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) message = message;
  else message = null;
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      res.redirect("/login");
      return mg.messages.create(
        "sandboxd29a893c5f2e4e119f05276e7cc5afc6.mailgun.org",
        {
          from: "Kush <shop@node-complete.com>",
          to: [email],
          subject: "Hello",
          text: "Successfully Signed Up",
          html: "<h1>Congrats!!For signing up successfully</h1>",
        }
      );
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  //   res.cookie("loggedIn", true);
  // res.header('Set-Cookie','loggedIn=true')
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) message = message[0];
  else message = null;
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash(
            "error",
            "User for given email not found please verify email"
          );
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        return mg.messages.create(
          "sandboxd29a893c5f2e4e119f05276e7cc5afc6.mailgun.org",
          {
            from: "Kush <shop@node-complete.com>",
            to: [req.body.email],
            subject: "Password Reset!!!",
            text: "Successfully Signed Up",
            html: `
            <h1>Link to reset password.</h1>
            <p>You requested a password reset :</p>
            <p>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
            `,
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) message = message[0];
      else message = null;
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
      return mg.messages.create(
        "sandboxd29a893c5f2e4e119f05276e7cc5afc6.mailgun.org",
        {
          from: "Kush <shop@node-complete.com>",
          to: [resetUser.email],
          subject: "Password Reset!!!",
          text: "Successfully reseted password",
          html: `
          <h1>Congrats!! For reseting your password successfully.</h1>
          <p>For any new feature to be added in the website please mail us on shop@node-complete.com</p>
          <p>Sorry for any inconvenience</p>
          `,
        }
      );
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};
