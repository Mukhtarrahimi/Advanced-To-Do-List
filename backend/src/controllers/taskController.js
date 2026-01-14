const Task = require("../models/task");
const {
  createTaskValidation,
  updateTaskValidation,
} = require("../validations/taskValidation");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { error, value } = createTaskValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const task = await Task.create({
      ...value,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
