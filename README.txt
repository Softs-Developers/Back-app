# Multimedia Management Backend

Este proyecto proporciona una API backend para la gestión de un sistema multimedia. Ha sido desarrollado con Node.js y Express, y utiliza una base de datos SQLite. La API permite gestionar usuarios, categorías y videos. Este proyecto ha sido realizado por Hamza Dhmiddouch, Javier Verdú y Tomás Sánchez.

## Desarrollado por

- Hamza Dhmiddouch ([hamza.dhmiddouch@edu.upct.es](mailto:hamza.dhmiddouch@edu.upct.es))
- Javier Verdú ([javier.verdu2@edu.upct.es](mailto:javier.verdu2@edu.upct.es))
- Tomás Sánchez ([tomas.sanchez2@edu.upct.es](mailto:tomas.sanchez2@edu.upct.es))

## Requisitos

- Node.js
- SQLite

## Instalación

1. Clona el repositorio:

    ```bash
    git clone https://github.com/tu-usuario/multimedia-backend.git
    cd multimedia-backend
    ```

2. Instala las dependencias:

    ```bash
    npm install
    ```

3. Inicia el servidor:

    ```bash
    node index.js
    ```

## Endpoints

### Autenticación

- `POST /login`: Inicia sesión y devuelve un token JWT.

### Usuarios

- `GET /getUsuarios`: Obtiene todos los usuarios (requiere autenticación).
- `POST /postUsuario`: Crea un nuevo usuario (requiere autenticación).
- `DELETE /deleteUsuarios`: Elimina un usuario por ID (requiere autenticación).
- `PATCH /patchUsuario`: Actualiza un usuario por ID (requiere autenticación).

### Categorías

- `GET /getCategorias`: Obtiene todas las categorías (requiere autenticación).
- `POST /postCategorias`: Crea una nueva categoría (requiere autenticación).
- `DELETE /deleteCategorias`: Elimina una categoría por nombre (requiere autenticación).
- `PATCH /patchCategorias`: Actualiza una categoría por ID (requiere autenticación).

### Videos

- `GET /getVideos`: Obtiene todos los videos (requiere autenticación).
- `GET /getVideoByCategoria`: Obtiene videos por categoría (requiere autenticación).
- `POST /postVideo`: Crea un nuevo video (requiere autenticación).
- `DELETE /deleteVideos`: Elimina un video por título (requiere autenticación).
- `PATCH /patchVideo`: Actualiza un video por ID (requiere autenticación).

### Logout

- `DELETE /logout`: Cierra sesión y elimina la sesión del usuario.

## Ejemplo de Uso

Para iniciar sesión, envía una solicitud `POST` a `/login` con el cuerpo:

```json
{
  "user": "nombreUsuario",
  "passwd": "contraseña"
}
Obtendrás un token JWT que deberás incluir en el encabezado Authorization de las solicitudes posteriores.

Seguridad
El servidor utiliza JWT para la autenticación y las rutas protegidas requieren que el token se incluya en el encabezado de autorización.

Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.
