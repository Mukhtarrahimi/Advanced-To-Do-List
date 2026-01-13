// src/validations/taskValidation.js
const Joi = require("joi");

exports.createTaskValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required(),
        description: Joi.string().max(500).optional(),
        status: Joi.string()
            .valid("pending", "in-progress", "completed")
            .optional(),
        priority: Joi.string().valid("low", "medium", "high").optional(),
        dueDate: Joi.date().greater("now").optional().allow(null),
        assignedTo: Joi.string().hex().length(24).optional().allow(null),
        tags: Joi.array().items(Joi.string()).optional(),
    });

    return schema.validate(data, { abortEarly: false });
};
