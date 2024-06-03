'use strict';
// Cargamos el modulo de Express
const express = require('express');
// Crearmos un objeto servidor HTTP
const server = express();
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
              req.session.userID = row.id;
              var data = {
                user_id: row.user_id,
                name: row.name,
                mail: row.mail
              };
              res.json(data);
            } else {
              res.json({ errormsg: 'Fallo de autenticación' });
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


// Añadir las rutas al servidor
server.use('/', router);
// Añadir las rutas estáticas al servidor.
server.use(express.static('.'));

      // Poner en marcha el servidor ...
server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
   });