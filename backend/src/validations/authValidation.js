const Joi = require("joi");

// ✅ Register validation
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
    }),
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      "string.empty": "Username is required",
      "string.alphanum": "Username must contain only letters and numbers",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Email must be valid",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone must contain 10-15 digits",
        "string.empty": "Phone is required",
      }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  registerValidation,
};
