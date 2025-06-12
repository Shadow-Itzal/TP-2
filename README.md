# 📦 API de Productos - Documentación Técnica

## Pre-Entrega 2 - Backend Ingenias+

### Grupo 16

**Integrantes:**

- Ana María Márquez Márquez — [anamarquez1408@gmail.com] 💌 
- Marta Mariana Domínguez — [dominguezmariana483@gmail.com] 💌 
- Andrea Judith Junes — [junesandrea56@gmail.com] 💌 

## 🧾 Descripción General

Esta API RESTful permite gestionar un catálogo de productos, incluyendo operaciones de creación, lectura, actualización y eliminación (CRUD). Está construida con **Node.js**, **Express.js** y se conecta a una base de datos MongoDB.

---

## 📂 Estructura del Proyecto

```

.
├── app.js
├── server.js
├── .env
└── src
├── routes
│   └── productos.routes.js
├── controllers
│   └── productos.controller.js
└── config
└── mongodb.js

```
## Diagrama
```
┌────────────┐
│ Cliente │
└─────┬──────┘
▼
┌──────────────┐
│ Express.js │
├──────────────┤
│ Rutas │ <── /productos
│ Controladores│
└─────┬────────┘
▼
┌──────────────┐
│ MongoDB │
└──────────────┘
```
---

## 🚀 Inicio del Servidor

```bash
npm install
npm start
```

El servidor se inicializa desde `server.js`, que:

- Carga variables de entorno
- Conecta a la base de datos MongoDB
- Inicia el servidor en el puerto configurado (`PORT` por defecto 3030)
- Gestiona el apagado limpio con `SIGINT` (Ctrl + C)

---

## 🔌 Endpoints Disponibles

Prefijo común: `/productos`

### GET `/productos`

Obtiene la lista completa de productos.

- ✅ **Respuesta:** `200 OK` con un array de productos.

---

### GET `/productos/codigo/:codigo`

Obtiene un producto por su código numérico.

- ⚠️ **Validación:** `codigo` debe ser un entero.
- 📦 **Respuesta:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

### GET `/productos/nombre/:nombre`

Busca un producto por nombre (match exacto, case-sensitive).

- ⚠️ **Validación:** `nombre` no debe estar vacío.
- 📦 **Respuesta:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

### GET `/productos/categoria/:categoria`

Filtra productos por categoría.

- ⚠️ **Validación:** `categoria` no debe estar vacía.
- 📦 **Respuesta:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

### POST `/productos`

Crea un nuevo producto.

- 🧾 **Body requerido (JSON):**

  ```json
  {
    "codigo": 101,
    "nombre": "Laptop",
    "precio": 1200,
    "categoria": "tecnologia"
  }
  ```

- ⚠️ Todos los campos son obligatorios y validados con reglas estrictas.
- 📦 **Respuesta:** `201 Created` con `id` del nuevo producto | `400 Bad Request`

---

### PUT `/productos/codigo/:codigo`

Actualiza campos de un producto existente.

- 🧾 **Body parcial (JSON):** Se permiten `nombre`, `precio`, y `categoria`.
- ⚠️ No se puede actualizar el `codigo`.
- 📦 **Respuesta:** `200 OK` con el producto actualizado | `400 Bad Request` | `404 Not Found`

---

### DELETE `/productos/codigo/:codigo`

Elimina un producto por código.

- 📦 **Respuesta:** `200 OK` si se elimina | `404 Not Found`

---

## ✅ Validaciones de Producto

Definidas en `productos.controller.js`:

| Campo       | Tipo    | Validación                 |
| ----------- | ------- | -------------------------- |
| `codigo`    | Integer | Obligatorio, entero válido |
| `nombre`    | String  | Obligatorio, no vacío      |
| `precio`    | Number  | Obligatorio, ≥ 0           |
| `categoria` | String  | Obligatorio, no vacío      |

---

## 🧠 Lógica del Controlador

Los controladores son funciones asincrónicas que:

- Validan inputs
- Manejan errores con respuestas HTTP apropiadas
- Delegan operaciones a funciones DB en `mongodb.js`
- Están organizadas por acción (`getAll`, `getByNombre`, `updateByCodigo`, etc.)

---

## ⚙️ Middleware y Configuración

- `express.json()` para parsear JSON
- Middleware de fallback `404` para rutas no definidas
- Modularización por responsabilidad: rutas, controladores, configuración DB

---

## 🔒 Manejo de Errores

- Todos los errores de servidor retornan `500 Internal Server Error`
- Validaciones específicas retornan `400 Bad Request`
- Entidades no encontradas retornan `404 Not Found`
- Errores son logueados en consola para depuración

---

## 🧪 Futuras Mejoras (Sugerencias)

- Autenticación con JWT
- Paginación y ordenamiento en `/productos`
- Validaciones con Joi o Zod
- Tests unitarios e2e (Jest, Supertest)
- Documentación Swagger/OpenAPI

---

## 🛠 Requerimientos del Entorno

- Node.js >= 16
- MongoDB local o remoto
- Variables `.env`:

  ```env
  PORT=3030
  MONGODB_URI=mongodb+srv://usuario:contraseña.@usuario.yw3bzl7.mongodb.net/
  ```

---
