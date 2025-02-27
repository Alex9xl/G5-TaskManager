import moment from "moment";
import { Task } from "./types";

export const formatTime = (createdAt: string) => {
  const now = moment();
  const created = moment(createdAt);

  // Si la tarea fue creada hoy
  if (created.isSame(now, "day")) {
    return "Hoy";
  }

  // Si la tarea fue creada ayer
  if (created.isSame(now.subtract(1, "days"), "day")) {
    return "Ayer";
  }

  // comprobar si se creó en los últimos 7 días
  if (created.isAfter(moment().subtract(6, "days"))) {
    return created.fromNow();
  }

  // Si el item fue creado dentro de las últimas 4 semanas (hasta hace 1 mes)
  if (created.isAfter(moment().subtract(3, "weeks"), "week")) {
    return created.fromNow();
  }

  return created.format("DD/MM/YYYY");
};

export const filteredTasks = (tasks: Task[], priority: string) => {
  const filteredTasks = () => {
    switch (priority) {
      case "baja":
        return tasks.filter((task) => task.priority === "baja");
      case "media":
        return tasks.filter((task) => task.priority === "media");
      case "alta":
        return tasks.filter((task) => task.priority === "alta");
      default:
        return tasks;
    }
  };

  return filteredTasks();
};

export const overdueTasks = (tasks: Task[]) => {
  const todayDate = moment();

  // Filtrar tareas que no están completadas y la fecha de vencimiento es anterior a hoy
  return tasks.filter((task) => {
    return !task.completed && moment(task.dueDate).isBefore(todayDate);
  });
};
