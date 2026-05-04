const mongoose = require("mongoose");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function requireFields(body, fields) {
  return fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
}

function isOneOf(value, allowed) {
  return allowed.includes(value);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

module.exports = {
  isValidObjectId,
  requireFields,
  isOneOf,
  isValidEmail,
  isValidPassword,
};