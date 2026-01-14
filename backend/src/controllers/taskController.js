// src/controllers/taskController.js
const Task = require("../models/task");
const {
    createTaskValidation,
    updateTaskValidation,
} = require("../validations/taskValidation");

// Create Task
exports.createTask = async(req, res) => {
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

// Get all tasks with filter, sort, pagination
exports.getTasks = async(req, res) => {
    try {
        const { status, priority, search, page = 1, limit = 10 } = req.query;
        const query = { createdBy: req.user._id };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) query.title = { $regex: search, $options: "i" };

        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            page: parseInt(page),
            total,
            tasks,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

// Get single task
exports.getTaskById = async(req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });
        if (!task) {
            return res
                .status(404)
                .json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, task });
    } catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err.message });
    }
};

// Update Task
exports.updateTask = async(req, res) => {
    try {
        const { error } = updateTaskValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                details: error.details.map((d) => d.message),
            });
        }

        const task = await Task.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, { $set: req.body }, { new: true, runValidators: true });

        if (!task)
            return res
                .status(404)
                .json({ success: false, message: "Task not found" });

        res.status(200).json({ success: true, message: "Task updated", task });
    } catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err.message });
    }
};

// Delete Task
exports.deleteTask = async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id,
        });
        if (!task)
            return res
                .status(404)
                .json({ success: false, message: "Task not found" });

        res.status(200).json({ success: true, message: "Task deleted" });
    } catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err.message });
    }
};
