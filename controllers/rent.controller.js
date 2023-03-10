const Game = require("../models/Game.model");
const mongoose = require("mongoose");
const Rent = require("../models/Rent.model");
const User = require("../models/User.model");
const Favorite = require("../models/Favorite.model");
const sendMail = require("../config/mailer.config");
const createRentMail = require("../config/templates/createRentMail");

module.exports.createRent = (req, res, next) => {
  Game.findById(req.params.id).then((game) => {
    const min = new Date().toISOString().split("T")[0];
    res.render("rent/rent-game", { game, min });
  });
};

module.exports.doCreateRent = (req, res, next) => {
  Game.findById(req.params.id)
    .populate({
      path: "user",
    })
    .then((game) => {
      //sendMail(game.user.email, game.user.username)
      sendMail(game.user.email, {
        subject: `${game.user.username}: Other user wants to rent one of your games from Alquigame`,
        html: createRentMail(),
      });
    });
  Rent.create(req.body)
    .then((rent) => {
      res.redirect("/profile");
    })
    .catch((error) => res.send(error));
};

module.exports.pendingValidation = (req, res, next) => {
  Rent.find({ $or: [{ tenant: req.user.id }, { renter: req.user.id }] })
    .populate({
      path: "game",
      populate: { path: "user" },
    })
    .populate({
      path: "renter",
    })
    .then((pendingRents) => {
      const rentsReducer = pendingRents.reduce((acc, rent) => {
        // console.log(rent.renter.toString(), req.user.id)
        if (rent.renter._id.toString() === req.user.id) {
          acc.rented
            ? (acc.rented = [...acc.rented, rent])
            : (acc.rented = [rent]);
        }
        if (rent.tenant.toString() === req.user.id) {
          acc.requested
            ? (acc.requested = [...acc.requested, rent])
            : (acc.requested = [rent]);
        }
        return acc;
      }, {});
      res.render("rent/pending-validations", { rentsReducer });
    })
    .catch((error) => res.send(error));
  // console.log(req.user.id);
};

module.exports.doEdit = (req, res, next) => {
  Rent.findByIdAndUpdate(req.params.id, {
    $set: { status: req.query.newStatus },
  })
    .then(() => res.status(204).json({ status: "Rented" }))
    .catch((err) => next(err));
};

module.exports.doDelete = (req, res, next) => {
  Rent.findByIdAndDelete(req.params.id)
    .then(() => {
      res.redirect("/profile/pending-validations");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.historic = (req, res, next) => {
  User.findById(req.user.id)
    .populate("favorites")
    .then((user) => {
      console.log(user);
      return Rent.find({
        $or: [{ tenant: req.user.id }, { renter: req.user.id }],
      })
        .populate({
          path: "game",
          populate: { path: "user" },
        })
        .populate({
          path: "renter",
        })
        .then((historicRents) => {
          const histReducer = historicRents.reduce((acc, rent) => {
            if (
              rent.renter._id.toString() === req.user.id &&
              rent.status === "Rented"
            ) {
              acc.renter
                ? (acc.renter = [...acc.renter, rent])
                : (acc.renter = [rent]);
            }
            if (
              rent.tenant.toString() === req.user.id &&
              rent.status === "Rented"
            ) {
              acc.tenant
                ? (acc.tenant = [...acc.tenant, rent])
                : (acc.tenant = [rent]);
            }
            return acc;
          }, {});

          res.render("rent/historic", {
            histReducer,
            favorites: user.favorites,
          });
        });
    })
    .catch((error) => res.send(error));
};

module.exports.favorites = (req, res, next) => {
  const user = req.user.id;
  const rent = req.params.id;
  const favorites = {
    user,
    rent,
  };

  Favorite.findOne({ user, rent }).then((dbFavorite) => {
    if (dbFavorite) {
      return Favorite.findByIdAndDelete(dbFavorite.id).then(
        (createdFavorite) => {
          res.status(204).json({ like: createdFavorite });
        }
      );
    } else {
      return Favorite.create(favorites).then(() => {
        res.status(201).json({ ok: true });
      });
    }
  });
};

module.exports.printFavorites = (req, res, next) => {
  User.findById(req.user.id)
    .populate("favorites")
    .then((user) => {
      return Favorite.find({ user: req.user.id })
        .populate({
          path: "user",
        })
        .populate({
          path: "rent",
          populate: [{ path: "game" }, { path: "tenant" }],
        })
        .then((favorite) => {
          res.render("rent/favorites", { favorite });
        });
    })
    .catch((error) => res.send(error));
};
