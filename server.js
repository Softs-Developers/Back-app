'use strict';
// Cargamos el modulo de Express
const express = require('express');
// Crearmos un objeto servidor HTTP
const server = express();
// Para crear tokens
const jwt = require('jsonwebtoken'); 
// definimos el puerto a usar por el servidor HTTP
const port = 8080;
// Cargamos el modulo para la gestion de sesiones
const session = require('express-session');
// Creamos el objeto con la configuración
const sesscfg = {
 secret: 'practicas-lsi-2023',
 resave: false, saveUninitialized: true,
 cookie: { maxAge: 8*60*60*1000 } // 8 working hours
};
// Se le dice al servidor que use el modulo de sesiones con esa configuracion
server.use(session(sesscfg));
// Obtener la referencia al módulo 'body-parser'
const bodyParser = require('body-parser');
// Configuring express to use body-parser as middle-ware.
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
// Obtener el configurador de rutas
const router = express.Router();
// cargar el módulo para bases de datos SQLite
var sqlite3 = require('sqlite3').verbose();
// Abrir nuestra base de datos
var db = new sqlite3.Database(
    'multimedia.db', // nombre del fichero de base de datos
    console.log("has consultado la bbdd"),
     (err) => { // funcion que será invocada con el resultado
    if (err) // Si ha ocurrido un error
     console.log(err); // Mostrarlo por la consola del servidor
     console.log("ERRor en la consulta de la bbdd");
    }
    );

    function processLogin(req, res, db) {
        var nameLogin = req.body.user;
        var passwd = req.body.passwd;
      
        db.get(
          'SELECT * FROM users WHERE name=?', nameLogin,
          (err, row) => {
            if (row == undefined) {
              res.json({ errormsg: 'El usuario no existe' });
            } else if (row.passwd === passwd) {
              var data = {
                user_id: row.user_id,
                name: row.name,
                mail: row.mail
              };
              const token = jwt.sign(data, 'secret_key', { expiresIn: '1h' });
              res.json({ token, user: data });
            } else {
             
              res.json({ errormsg: 'Fallo de autenticación' });
            }
          }
        );
      }
      

      function verificarUsuario(req) {
        const token = req.headers['authorization'];
        if (!token) {
          console.log('Token no proporcionado');
          return false;
        }
      
        try {
          const decoded = jwt.verify(token.split(' ')[1], 'secret_key');
          req.user = decoded; // Puedes adjuntar los datos del usuario al objeto req si es necesario
          console.log('Token verificado con éxito:', decoded);
          return true;
        } catch (err) {
          console.log('Error al verificar el token:', err);
          return false;
        }
      }



      


        function processCategorias(req, res, db) {
            if (!verificarUsuario(req)) {
              res.json({ errormsg: 'Usuario no autenticado por dar falso en la verificacion' });
              return;
            }
          
            db.all(
                'SELECT * FROM categorias',
                (err, rows) => {
                  if (rows == undefined || rows.length === 0) {
                    res.json({ errormsg: 'No existen categorías' });
                  } else {
                    res.json(rows);
                  }
                }
              );
            }
          
  
            function processPeliculas(req, res, db) {
              if (!verificarUsuario(req)) {
                res.json({ errormsg: 'Usuario no autenticado' });
                return;
              }
            
              db.all(
                  'SELECT * FROM peliculas',
                  (err, rows) => {
                    if (rows == undefined || rows.length === 0) {
                      res.json({ errormsg: 'No existen categorías' });
                    } else {
                      res.json(rows);
                    }
                  }
                );
              }




             function processPeliculasByCategoiaId(req, res, db){
              var CategoriaId = req.body.categoriaId;

              if (!verificarUsuario(req)) {
                res.json({ errormsg: 'Usuario no autenticado' });
                return;
              }
            
              db.all(
                  'SELECT * FROM peliculas where peliculas.id_cat=?', CategoriaId,
                  (err, rows) => {
                    if (rows == undefined || rows.length === 0) {
                      res.json({ errormsg: 'No existen peliculas' });
                    } else {
                      res.json(rows);
                    }
                  }
                );
              }

              function  processPeliculasByCategoriaName(req, res, db){
                var CategoriaName = req.body.categoriaName;

              if (!verificarUsuario(req)) {
                res.json({ errormsg: 'Usuario no autenticado' });
                return;
              }
            
              db.all(
                'SELECT peliculas.title FROM categorias, peliculas WHERE categorias.id = peliculas.id_cat AND categorias.name = ?', CategoriaName,

                  (err, rows) => {
                    if (rows == undefined || rows.length === 0) {
                      res.json({ errormsg: 'No existe dicha pelicula en dicha categoria' });
                    } else {
                      res.json(rows);
                    }
                  }
                );
              }



      // Ahora la acción asociada al login sería:
router.post('/login', (req, res) => {
    // Comprobar si la petición contiene los campos ('user' y 'passwd')
    if (!req.body.user || !req.body.passwd) {
     res.json({ errormsg: 'Peticion mal formada'});
     } else {
    // La petición está bien formada -> procesarla
     processLogin(req, res, db); // Se le pasa tambien la base de datos
     }
    });


    // Configurar la accion asociada a la solicitud de todas las categorias
    router.get('/categorias', (req, res) => {
        processCategorias(req, res, db);
      });


      
    // Configurar la accion asociada a la solicitud de todas las películas
    router.get('/peliculas', (req, res) => {
      processPeliculas(req, res, db);
    });


    // Configurar la accion asociada a la solicitud de peliculas pasando el id de la categoría a la que pertenecen
    router.get('/peliculaByCategoria', (req, res) => {
      if(req.body.categoriaId){
      processPeliculasByCategoiaId(req, res, db);
    }else if(req.body.categoriaName){
      processPeliculasByCategoriaName(req,res,db);
    }else{
      res.json({ errormsg: 'Solicitud mal ejecutada'});

    }
    });


    
    // Configurar la accion asociada a la solicitud de todas las categorias
    router.get('/categorias', (req, res) => {
      processCategorias(req, res, db);
    });


// Añadir las rutas al servidor
server.use('/', router);
// Añadir las rutas estáticas al servidor.
server.use(express.static('.'));

      // Poner en marcha el servidor ...
server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
   });