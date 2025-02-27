import jwt from "jsonwebtoken";

//Utilice el user id para generar el token
const generateToken = (id) => {
  // el token debe ser devuelto al cliente
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
