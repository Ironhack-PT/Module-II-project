const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const EMAIL_PATTERN = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
//const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
// LO DEJO COMENTADO PARA HACER PRUEBAS MAS RÁPIDO. Son 8 caracteres, letra y símbolo. Funciona.
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: 'Username is required',
      minLength: [4, 'Username needs at least 4 chars length']
    },
    email: {
      type: String,
      required: 'Email is required',
      match: [EMAIL_PATTERN, 'Email is not valid'],
      unique: true
    },
    password: {
      type: String,
      required: 'password is required',
      //match: [PASSWORD_PATTERN, 'password needs at least 8 chars, one number and one special character'],
    },
    googleID: {
      type: String
    },
    image: {
      type: String,
      imageUrl: String,
      default: 'https://media.istockphoto.com/id/522855255/vector/male-profile-flat-blue-simple-icon-with-long-shadow.jpg?s=612x612&w=0&k=20&c=EQa9pV1fZEGfGCW_aEK5X_Gyob8YuRcOYCYZeuBzztM='
    },
  });

  userSchema.virtual('games', {
    ref: 'Game',
    foreignField: 'user',
    localField: '_id',
    justOne: false
  })

  
  userSchema.virtual('rents', {
    ref: 'Rent',
    foreignField: 'renter',
    localField: '_id',
    justOne: false
  })

  userSchema.virtual('rents', {
    ref: 'Rent',
    foreignField: 'tenant',
    localField: '_id',
    justOne: false
  })

  userSchema.virtual('favorites', {
    ref: 'Favorite',
    foreignField: 'user',
    localField: '_id',
    justOne: false
  })

  userSchema.pre('save', function (next) {
    const rawPassword = this.password;
    if (this.isModified('password')) {   
      bcryptjs.hash(rawPassword, SALT_ROUNDS)
        .then(hash => {
          this.password = hash;
          next()
        })
        .catch(err => next(err))
    } else {
      next();
    }
  });
  
  userSchema.methods.checkPassword = function (passwordToCompare) {
    return bcryptjs.compare(passwordToCompare, this.password);
  }
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;