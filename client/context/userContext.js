import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

// Establezca axios para incluir credenciales con cada solicitud
axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
  const serverUrl = "http://localhost:8000"; // reemplazar por: http://localhost:8000 , para despliegue local

  const router = useRouter();

  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // register user
  const registerUser = async (e) => {
    e.preventDefault();
    if (
      !userState.email.includes("@") ||
      !userState.password ||
      userState.password.length < 6
    ) {
      toast.error(
        "Por favor, introduzca un email y una contraseña válida (mínimo 6 caracteres)"
      );
      return;
    }

    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
      console.log("Usuario registrado exitosamente", res.data);
      toast.success("Usuario registrado exitosamente");

      // Limpiar el formulario
      setUserState({
        name: "",
        email: "",
        password: "",
      });

      // redirigir a login page
      router.push("/login");
    } catch (error) {
      console.log("Error al registrar usuario", error);
      toast.error(error.response.data.message);
    }
  };

  // Inicia sesión el usuario
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        },
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("El usuario ha iniciado sesión correctamente");

      // Limpiar el formulario
      setUserState({
        email: "",
        password: "",
      });

      // Actualizar los detalles del usuario
      await getUser(); // buscar antes de redirigir

      // Empujar al usuario a la dashboard page
      router.push("/");
    } catch (error) {
      console.log("Error al iniciar sesión", error);
      toast.error(error.response.data.message);
    }
  };

  // Obtener user Looged en Status
  const userLoginStatus = async () => {
    let loggedIn = false;
    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
        withCredentials: true, // enviar cookies al servidor
      });

      // convertir el string en booleana
      loggedIn = !!res.data;
      setLoading(false);

      if (!loggedIn) {
        router.push("/login");
      }
    } catch (error) {
      console.log(
        "Error al obtener el estado de inicio de sesión del usuario",
        error
      );
    }

    return loggedIn;
  };

  // logout user
  const logoutUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/logout`, {
        withCredentials: true, // enviar cookies al servidor
      });

      toast.success("El usuario cerró sesión exitosamente");

      setUser({});

      // redirigir al login page
      router.push("/login");
    } catch (error) {
      console.log("Error al cerrar sesión de usuario", error);
      toast.error(error.response.data.message);
    }
  };

  // get user details
  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        withCredentials: true, // enviar cookies al servidor
      });

      setUser((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      setLoading(false);
    } catch (error) {
      console.log("Error al obtener los detalles del usuario", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  // update user details
  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {
        withCredentials: true, // enviar cookies al servidor
      });

      // update the user state
      setUser((prevState) => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      toast.success("Usuario actualizado con éxito");

      setLoading(false);
    } catch (error) {
      console.log("Error al actualizar los detalles del usuario", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  // email verification
  const emailVerification = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/verify-email`,
        {},
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("Verificación de email enviada con éxito");
      setLoading(false);
    } catch (error) {
      console.log("Error al enviar el email de verificación", error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  // verify user/email
  const verifyUser = async (token) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/verify-user/${token}`,
        {},
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("Usuario verificado con éxito");

      // Actualizar los detalles del usuario
      getUser();

      setLoading(false);
      // redirigir al home page
      router.push("/");
    } catch (error) {
      console.log("Error al verificar el usuario", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // forgot password email
  const forgotPasswordEmail = async (email) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/forgot-password`,
        {
          email,
        },
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("Email de contraseña olvidada enviado exitosamente");
      setLoading(false);
    } catch (error) {
      console.log("Error al enviar el email de contraseña olvidada", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // reset password
  const resetPassword = async (token, password) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/reset-password/${token}`,
        {
          password,
        },
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("Restablecimiento de contraseña exitoso");
      setLoading(false);
      // redirigir al login page
      router.push("/login");
    } catch (error) {
      console.log("Error al restablecer la contraseña", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);

    try {
      const res = await axios.patch(
        `${serverUrl}/api/v1/change-password`,
        { currentPassword, newPassword },
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("Contraseña cambiada exitosamente");
      setLoading(false);
    } catch (error) {
      console.log("Error al cambiar contraseña", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // admin routes
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${serverUrl}/api/v1/admin/users`,
        {},
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      setAllUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error al obtener todos los usuarios", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  // form handler dinamico
  const handlerUserInput = (name) => (e) => {
    const value = e.target.value;

    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // delete user
  const deleteUser = async (id) => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${serverUrl}/api/v1/admin/users/${id}`,
        {},
        {
          withCredentials: true, // enviar cookies al servidor
        }
      );

      toast.success("Usuario eliminado exitosamente");
      setLoading(false);
      // actualizar la lista de usuarios
      getAllUsers();
    } catch (error) {
      console.log("Error al eliminar usuario", error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loginStatusGetUser = async () => {
      const isLoggedIn = await userLoginStatus();

      if (isLoggedIn) {
        await getUser();
      }
    };

    loginStatusGetUser();
  }, []);

  useEffect(() => {
    if (user.role === "admin") {
      getAllUsers();
    }
  }, [user.role]);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
