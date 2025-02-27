# TaskManager

TaskManager es una aplicación de gestión de tareas personales desarrollada con un backend en Node.js (Express) y un frontend en React (Vite).

---

## Grupo 5

- Rojas Carrasco, Alessandro del Piero
- Flores Moreno, Juan Diego Valentino
- Solis Flores, Aldair Jhostin
- Huaman Uriarte, Cesar Alberto
- Layme Moya, Victor Hugo
- Guzman Neyra, Paulo Renato
- Palomino Julian, Alex Marcelo

## 🚀 Levantar el proyecto localmente

Para ejecutar este proyecto localmente, sigue los pasos a continuación:

### 1. Clona el repositorio

```bash
git clone https://github.com/Clenn91/G5-ProyectoFinal-TaskManager.git
cd TaskManager
```

### 2. Instalar dependencias

Instala las dependencias tanto para el cliente como para el backend:

```bash
cd backend
npm install
```

```bash
cd client
npm install
```

### 3. Ejecutar el proyecto

Debes abrir **dos terminales** y realizar los siguientes pasos:

#### Iniciar el servidor

```bash
cd backend
npm run start
```

#### Iniciar el cliente

```bash
cd client
npm run dev
```

## 🔧 Configuración de variables de entorno

El proyecto utiliza variables de entorno para conectarse a MongoDB y configurar otras funcionalidades. Si deseas cambiar estas variables, debes crear o editar los archivos `.env` en la raíz del proyecto del backend.

```bash
MONGO_URI=mongodb+srv://prueba:pruebaPass@example.ebhxe.mongodb.net/?retryWrites=true&w=majority&appName=Example
JWT_SECRET=mysecret
CLIENT_URL=http://localhost:3000
PORT=8000
```

### 🌐 Obtener tu propia `MONGO_URI`

Si deseas utilizar tu propia base de datos en lugar de la proporcionada, puedes registrarte y configurar un cluster en MongoDB Atlas.

- **Regístrate aquí**: [MongoDB Atlas](https://www.mongodb.com/es/cloud/atlas/register)
- Una vez creado el cluster, conectarse via Drivers y crear un usuario y contraseña.
- Copia tu `MONGO_URI` personalizada y reemplázala en las variables de entorno.

## 📂 Estructura del proyecto

El proyecto está organizado de la siguiente manera:

```bash
TaskManager/
├── backend/        # Código del backend (Node.js, Express, MongoDB)
├── client/         # Código del frontend (React, Vite)
├── README.md       # Este archivo
```
