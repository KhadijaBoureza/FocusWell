const mongoose = require("mongoose");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  return missing;
}

function isOneOf(value, allowed) {
  return allowed.includes(value);
}

module.exports = {
  isValidObjectId,
  requireFields,
  isOneOf,
};