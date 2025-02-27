import asyncHandler from "express-async-handler";
import TaskModel from "../../models/tasks/TaskModel.js";

export const createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!description || description.trim() === "") {
      res.status(400).json({ message: "Se requiere descripción" });
    }

    const task = new TaskModel({
      title,
      description,
      dueDate,
      priority,
      status,
      user: req.user._id,
    });

    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.log("Error en createTask: ", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const getTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      res.status(400).json({ message: "Usuario no encontrado" });
    }

    const tasks = await TaskModel.find({ user: userId });

    res.status(200).json({
      length: tasks.length,
      tasks,
    });
  } catch (error) {
    console.log("Error en getTasks: ", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const getTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Por favor proporcione una task id" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
    }

    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "No autorizado" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.log("Error en getTask: ", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const updateTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const { id } = req.params;
    const { title, description, dueDate, priority, status, completed } =
      req.body;

    if (!id) {
      res.status(400).json({ message: "Por favor proporcione una task id" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
    }

    // comprobar si el usuario es el propietario de la tarea
    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "No autorizado" });
    }

    // Actualizar la tarea con los nuevos datos si se proporcionan o conservar los datos antiguos
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.completed = completed || task.completed;

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    console.log("Error en updateTask: ", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const deleteTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await TaskModel.findById(id);

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
    }

    // comprobar si el usuario es el propietario de la tarea
    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "No autorizado" });
    }

    await TaskModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.log("Error en deleteTask: ", error.message);
    res.status(500).json({ message: error.message });
  }
});
