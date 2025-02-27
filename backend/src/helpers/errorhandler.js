// error handler middleware
const errorHandler = (err, req, res, next) => {
  // comprobar si la respuesta del headers ya han sido enviado al cliente
  if (res.headersSent) {
    // Si es verdadero, pasa el error al siguiente error-handling middleware
    return next(err);
  }

  // establece el código de estado de la respuesta
  const statusCode =
    res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode); // Establece el código de estado de la respuesta

  // Registrar el seguimiento de la pila de errores en la consola si no está en producción --> para debugging
  if (process.env.NODE_ENV !== "production") {
    console.log(err);
  }

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
