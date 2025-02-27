import mongoose from "mongoose";

const connect = async () => {
  try {
    console.log("Intentando conectarse a la base de datos.....");
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Conectado a la base de datos.....");
  } catch (error) {
    console.log("Error al conectarse a la base de datos...", error.message);
    process.exit(1);
  }
};

export default connect;
