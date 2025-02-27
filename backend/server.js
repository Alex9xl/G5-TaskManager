import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(errorHandler);

// rutas
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file) => {
  // utilizar import dinámico
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.log("No se pudo cargar la ruta del archivo", err);
    });
});

const server = async () => {
  try {
    await connect();

    app.listen(port, () => {
      console.log(`El servidor se está ejecutando en el puerto ${port}`);
    });
  } catch (error) {
    console.log("Error al iniciar el servidor...", error.message);
    process.exit(1);
  }
};

server();
