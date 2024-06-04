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
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 working hours
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

//MÉTODOS GETS

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






function processGetCategorias(req, res, db) {
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


function processGetVideos(req, res, db) {
  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  db.all(
    'SELECT * FROM Videos',
    (err, rows) => {
      if (rows == undefined || rows.length === 0) {
        res.json({ errormsg: 'No existen categorías' });
      } else {
        res.json(rows);
      }
    }
  );
}




function processGetVideosByCategoiaId(req, res, db) {
  var CategoriaId = req.body.categoriaId;

  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  db.all(
    'SELECT * FROM videos where videos.id_cat=?', CategoriaId,
    (err, rows) => {
      if (rows == undefined || rows.length === 0) {
        res.json({ errormsg: 'No existen videos' });
      } else {
        res.json(rows);
      }
    }
  );
}

function processGetVideosByCategoriaName(req, res, db) {
  var CategoriaName = req.body.categoriaName;

  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  db.all(
    'SELECT videos.title FROM categorias, videos WHERE categorias.id = videos.id_cat AND categorias.name = ?', CategoriaName,

    (err, rows) => {
      if (rows == undefined || rows.length === 0) {
        res.json({ errormsg: 'No existe dicho video en dicha categoria' });
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
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processLogin(req, res, db); // Se le pasa tambien la base de datos
  }
});


// Configurar la accion asociada a la solicitud de todas las categorias
router.get('/getCategorias', (req, res) => {
  processGetCategorias(req, res, db);
});



// Configurar la accion asociada a la solicitud de todas las películas
router.get('/getVideos', (req, res) => {
  processGetVideos(req, res, db);
});


// Configurar la accion asociada a la solicitud de video pasando el id de la categoría a la que pertenecen
router.get('/getVideoByCategoria', (req, res) => {
  if (req.body.categoriaId) {
    processGetVideosByCategoiaId(req, res, db);
  } else if (req.body.categoriaName) {
    processGetVideosByCategoriaName(req, res, db);
  } else {
    res.json({ errormsg: 'Solicitud mal ejecutada' });

  }
});



//MÉTODOS POSTS


function processPostCategorias(req,res,db){
  var nameCategoria = req.body.nameCategoria;
  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }
  db.all(

    'INSERT INTO   categorias (name) values (?)', nameCategoria,
      
    (err) => {
      console.log("el nombre del categoría es " + nameCategoria);

      if (err) {
        console.log("Se ha producido el siguiente error a la hora de la insercción " + err );
      } else {
        res.json({ errormsg: 'Insertado correctamente' });
      }
    }
  );
};


function processPostVideo(req, res, db) {
  var nameCategoriaVideo = req.body.postNameCategoriaDeVideo;
  var postUrlDeVideo = req.body.postUrlDeVideo;
  var postNameDeVideo = req.body.postNameDeVideo;

  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  // Primero, verifica si la categoría ya existe
  db.get('SELECT id FROM categorias WHERE name = ?', [nameCategoriaVideo], (err, row) => {
    if (err) {
      console.log("la categoría introducicda no existe, por favor crea una nnueva, el error es: " + err);
      return;
    }

    if (row) {
      // Usar el id de la categoría porque existe
      insertarVideo(row.id);
    } else {
      console.log("Error solicitando el indice de categoria");

    }
  });

  function insertarVideo(idCategoria) {
    db.run(
      'INSERT INTO videos (title, url, categoria, id_cat) VALUES (?, ?, ?, ?)',
      [postNameDeVideo, postUrlDeVideo, nameCategoriaVideo, idCategoria],
      (err) => {
        if (err) {
          res.json({ errormsg: 'Error insertando el video' });
          return;
        }
        res.json({ msg: 'Video insertado correctamente' });
      }
    );
  }
}




// Configurar la accion asociada a la insercción  de nuevas categorias
router.post('/postCategorias', (req, res) =>{// Comprobar si la petición contiene los campos ('user' y 'passwd')
if (!req.body.nameCategoria ) {
  res.json({ errormsg: 'Peticion mal formada' });
} else {
  // La petición está bien formada -> procesarla
  processPostCategorias(req, res, db); // Se le pasa tambien la base de datos
}
});



// Configurar la accion asociada a la insercción  de nuevos videos
router.post('/postVideo', (req, res) =>{// Comprobar si la petición contiene los campos 
  if (!req.body.postNameDeVideo || !req.body.postUrlDeVideo || !req.body.postNameCategoriaDeVideo) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPostVideo(req, res, db); // Se le pasa tambien la base de datos
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