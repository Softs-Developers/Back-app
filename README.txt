# Backend de Sistema de Gestión de Videos

Este es el backend de un sistema de gestión de videos que proporciona una API RESTful para autenticar usuarios, gestionar sesiones, y realizar operaciones CRUD sobre categorías, videos y usuarios. El backend está implementado utilizando Node.js y Express.js, y utiliza una base de datos SQLite.

## Tabla de Contenidos

- [Instalación](#instalación)
- [Uso](#uso)
- [Rutas Disponibles](#rutas-disponibles)
  - [Autenticación](#autenticación)
  - [Usuarios](#usuarios)
  - [Categorías](#categorías)
  - [Videos](#videos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Licencia](#licencia)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/backend-gestion-videos.git
   cd backend-gestion-videos
Instala las dependencias:

bash
Copiar código
npm install
Asegúrate de tener SQLite3 instalado y configura la base de datos:

Crea un archivo llamado multimedia.db en el directorio raíz del proyecto.
Usa un cliente SQLite para crear las tablas necesarias (users, videos, categorias, sesiones_virtuales).
Uso
Inicia el servidor:

bash
Copiar código
node server.js
El servidor se ejecutará en el puerto 8080.

Rutas Disponibles
Autenticación
POST /login: Inicia sesión con las credenciales del usuario.

Cuerpo de la solicitud: { "user": "nombreUsuario", "passwd": "contraseña" }
DELETE /logout: Cierra sesión del usuario autenticado.

Parámetros de la consulta: logoutIDUsuario (ID del usuario)
Usuarios
GET /getUsuarios: Obtiene todos los usuarios registrados. Requiere autenticación.

POST /postUsuario: Crea un nuevo usuario.

Cuerpo de la solicitud: { "postNameDeUsuario": "nombre", "postMailDeUsuario": "email", "postPasswdDelUsuario": "contraseña", "postRolDeUsuario": "rol" }
DELETE /deleteUsuarios: Elimina un usuario por su ID. Requiere autenticación.

Parámetros de la consulta: deleteIDUsuario (ID del usuario)
PATCH /patchUsuario: Actualiza un usuario por su ID. Requiere autenticación.

Cuerpo de la solicitud: { "patchIdUsuario": "id", "newpatchNameDeUsuario": "nuevoNombre", "newpatchMailDeUsuario": "nuevoEmail", "newpatchPasswdDelUsuario": "nuevaContraseña", "newpatchROLDelUsuario": "nuevoRol" }
Categorías
GET /getCategorias: Obtiene todas las categorías. Requiere autenticación.

POST /postCategorias: Crea una nueva categoría.

Cuerpo de la solicitud: { "nameCategoria": "nombreCategoria" }
DELETE /deleteCategorias: Elimina una categoría por su nombre. Requiere autenticación.

Parámetros de la consulta: deleteNameCategoria (nombre de la categoría)
PATCH /patchCategorias: Actualiza una categoría por su ID. Requiere autenticación.

Cuerpo de la solicitud: { "PatchIdCategoria": "idCategoria", "newNameCategoria": "nuevoNombre" }
Videos
GET /getVideos: Obtiene todos los videos. Requiere autenticación.

GET /getVideoByCategoria: Obtiene videos por ID o nombre de la categoría. Requiere autenticación.

Cuerpo de la solicitud: { "categoriaId": "idCategoria" } o { "categoriaName": "nombreCategoria" }
POST /postVideo: Crea un nuevo video.

Cuerpo de la solicitud: { "postNameDeVideo": "nombreVideo", "postUrlDeVideo": "urlVideo", "postNameCategoriaDeVideo": "nombreCategoria" }
DELETE /deleteVideos: Elimina un video por su nombre. Requiere autenticación.

Parámetros de la consulta: deleteNameVideo (nombre del video)
PATCH /patchVideo: Actualiza un video por su ID. Requiere autenticación.

Cuerpo de la solicitud: { "PatchIdDeVideo": "idVideo", "newPatchNameDeVideo": "nuevoNombre", "newPatchUrlDeVideo": "nuevaUrl", "newPatchCategoriaDeVideo": "nuevaCategoria" }
Estructura del Proyecto
go
Copiar código
.
├── node_modules
├── multimedia.db
├── package.json
├── package-lock.json
├── README.md
└── server.js
Licencia
Este proyecto está bajo la Licencia MIT. Mira el archivo LICENSE para más detalles.

go
Copiar código

Puedes guardar este contenido en un archivo llamado `README.md` en el directorio raíz de tu proyecto.
