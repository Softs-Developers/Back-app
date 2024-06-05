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
    res.json({ errormsg: 'Error al verificar el token'}, err);
    return false;
  }
}






function processGetCategorias(req, res, db) {
  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado por dar falso en la verificacion'}, err);
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

function processGetUsuarios(req, res, db) {
  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  db.all(
    'SELECT * FROM users',
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



// Configurar la accion asociada a la solicitud de todos los usuarios
router.get('/getUsuarios', (req, res) => {
  processGetUsuarios(req, res, db);
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
        res.json({ errormsg: "Se ha producido el siguiente error a la hora de la insercción "} , err);
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
      res.json({ errormsg: "la categoría introducicda no existe, por favor crea una nueva "}, err);
      return;
    }

    if (row) {
      // Usar el id de la categoría porque existe
      insertarVideo(row.id);
    } else {

      res.json({ errormsg: "Error solicitando el indice de categoria"});

    }
  });

  function insertarVideo(idCategoria) {
    db.run(
      'INSERT INTO videos (title, url, categoria, id_cat) VALUES (?, ?, ?, ?)',
      [postNameDeVideo, postUrlDeVideo, nameCategoriaVideo, idCategoria],
      (err) => {
        if (err) {
          res.json({ errormsg: 'Error insertando el video' }, err);
          return;
        }
        res.json({ msg: 'Video insertado correctamente' });
      }
    );
  }
}

 function processPostUsuario(req, res, db){
  var postNameDeUsuario = req.body.postNameDeUsuario;
  var postMailDeUsuario = req.body.postMailDeUsuario;
  var postPasswdDelUsuario = req.body.postPasswdDelUsuario;
  db.run(
    'INSERT INTO users (name, mail, passwd) VALUES (?, ?, ?)',
    [postNameDeUsuario, postMailDeUsuario, postPasswdDelUsuario],
    (err) => {
      if (err) {
        console.log("Error al insertar el usuario, provocado por el siguiente error " + err);
        return;
      }
      res.json({ msg: 'Usuario insertado correctamente' });
    }
  );
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



// Configurar la accion asociada a la creacion  de nuevos videos
router.post('/postVideo', (req, res) =>{// Comprobar si la petición contiene los campos 
  if (!req.body.postNameDeVideo || !req.body.postUrlDeVideo || !req.body.postNameCategoriaDeVideo) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPostVideo(req, res, db); // Se le pasa tambien la base de datos
  }
  });

  

// Configurar la accion asociada a la creacion  de nuevos usuarios
router.post('/postUsuario', (req, res) =>{// Comprobar si la petición contiene los campos 
  if (!req.body.postNameDeUsuario|| !req.body.postMailDeUsuario || !req.body.postPasswdDelUsuario) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPostUsuario(req, res, db); // Se le pasa tambien la base de datos
  }
  });



  // metodos de delete

  function processDeleteCategorias(req, res, db){
    var deleteNameCategoria = req.body.deleteNameCategoria;

    db.run(
      'delete from categorias where name=?',deleteNameCategoria,
      (err) => {
        if (err) {
          console.log("Error al insertar el usuario, provocado por el siguiente error " + err);
          return;
        }
        res.json({ msg: 'Categoria eliminada correctamente' });
      }
    );
  }


  function  processDeleteVideos(req, res, db){

    var deleteNameVideo = req.body.deleteNameVideo;

    db.run(
      'delete from videos where title=?',deleteNameVideo,
      (err) => {
        if (err) {
          console.log("Error al eliminar video con error: " + err);
          return;
        }
        res.json({ msg: 'video eliminado correctamente' });
      }
    );
  }



  function  processDeleteUsuarios(req, res, db){
    var deleteIDUsuario = req.body.deleteIDUsuario;
    db.run(
      'delete from users where user_id=?',deleteIDUsuario,
      (err) => {
        if (err) {
          console.log("Error al eliminar el usuario con error: " + err);
          return;
        }
        res.json({ msg: 'usuario eliminado correctamente' });
      }
    );
  }


  // Configurar la accion asociada a la insercción  de nuevas categorias
router.delete('/deleteCategorias', (req, res) =>{// Comprobar si la petición contiene los campos ('user' y 'passwd')
  if (!req.body.deleteNameCategoria ) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processDeleteCategorias(req, res, db); // Se le pasa tambien la base de datos
  }
  });




  router.delete('/deleteVideos', (req, res) =>{// Comprobar si la petición contiene los campos ('user' y 'passwd')
    if (!req.body.deleteNameVideo) {
      res.json({ errormsg: 'Peticion mal formada' });
    } else {
      // La petición está bien formada -> procesarla
      processDeleteVideos(req, res, db); // Se le pasa tambien la base de datos
    }
    });


    router.delete('/deleteUsuarios', (req, res) =>{// Comprobar si la petición contiene los campos ('user' y 'passwd')
      if (!req.body.deleteIDUsuario) {
        res.json({ errormsg: 'Peticion mal formada' });
      } else {
        // La petición está bien formada -> procesarla
        processDeleteUsuarios(req, res, db); // Se le pasa tambien la base de datos
      }
      });


      //Método para actualizar informacion usando el patch


      // Configurar la accion asociada a la actualización de categorias
router.patch('/patchCategorias', (req, res) => {
  if (!req.body.nameCategoria) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPatchCategorias(req, res, db); // Se le pasa también la base de datos
  }
});


function processPatchCategorias(req, res, db) {
  var nameCategoria = req.body.nameCategoria;
  var newNameCategoria = req.body.newNameCategoria; // Nuevo nombre para la categoría

  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  db.get(
    'SELECT id FROM categorias WHERE name = ?',
    [nameCategoria],
    function(err, row) {
      if (err) {
        console.log("Error al buscar la categoría: " + err);
        res.json({ errormsg: "Error al buscar la categoría", error: err });
        return;
      }

      if (!row) {
        res.json({ errormsg: 'No se encontró la categoría con el nombre proporcionado' });
        return;
      }

      var id = row.id;

      db.run(
        'UPDATE categorias SET name = ? WHERE id = ?',
        [newNameCategoria, id],
        function(err) {
          console.log("Actualizando la categoría con ID " + id + " a " + newNameCategoria);

          if (err) {
            console.log("Se ha producido el siguiente error a la hora de la actualización: " + err);
            res.json({ errormsg: "Se ha producido el siguiente error a la hora de la actualización", error: err });
          } else {
            res.json({ errormsg: 'Actualizado correctamente' });
          }
        }
      );
    }
  );
}




// Configurar la accion asociada a la actualización de videos
router.patch('/patchVideo', (req, res) => {
  if (!req.body.postNameDeVideo && !req.body.newPostUrlDeVideo && !req.body.postNameCategoriaDeVideo && !newPostNameDeVideo) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPatchVideos(req, res, db); // Se le pasa también la base de datos
  }
});




function processPatchVideos(req, res, db) {
  var nameCategoriaVideo = req.body.postNameCategoriaDeVideo;
  var postNameDeVideo = req.body.postNameDeVideo;
  var newPostUrlDeVideo = req.body.newPostUrlDeVideo;
  var newPostNameDeVideo = req.body.newPostNameDeVideo;

  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;
  }

  // Primero, verificar si la categoría ya existe
  db.get('SELECT id FROM categorias WHERE name = ?', [nameCategoriaVideo], (err, row) => {
    if (err) {
      console.log("Error al verificar la categoría: " + err);
      res.json({ errormsg: "Error al verificar la categoría", error: err });
      return;
    }

    if (!row) {
      res.json({ errormsg: "La categoría introducida no existe, por favor crea una nueva" });
      return;
    }

    // Usar el id de la categoría porque existe
    var idCategoria = row.id;

    // Busca el video con el nombre y categoría proporcionados
    db.get('SELECT id FROM videos WHERE title = ? AND id_cat = ?', [postNameDeVideo, idCategoria], (err, row) => {
      if (err) {
        console.log("Error al buscar el video: " + err);
        res.json({ errormsg: "Error al buscar el video", error: err });
        return;
      }

      if (!row) {
        res.json({ errormsg: "El video no existe en la categoría proporcionada" });
        return;
      }

      // Actualiza el video con los nuevos detalles
      db.run(
        'UPDATE videos SET title = ?, url = ? WHERE id = ?',
        [newPostNameDeVideo || postNameDeVideo, newPostUrlDeVideo || newPostUrlDeVideo, row.id],
        function(err) {
          console.log("Actualizando el video con ID " + row.id + " a " + (newPostNameDeVideo || postNameDeVideo) + " y URL " + (newPostUrlDeVideo || postUrlDeVideo));

          if (err) {
            console.log("Se ha producido el siguiente error a la hora de la actualización: " + err);
            res.json({ errormsg: "Se ha producido el siguiente error a la hora de la actualización", error: err });
          } else {
            res.json({ msg: 'Actualizado correctamente' });
          }
        }
      );
    });
  });
}

router.patch('/patchUsuario', (req, res) => {
  if (!req.body.patchNameDeUsuario && !req.body.patchMailDeUsuario && !req.body.patchPasswdDelUsuario && 
    !req.body.newpatchNameDeUsuario && !req.body.newpatchMailDeUsuario && !req.body.newpatchPasswdDelUsuario) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPatchUsuario(req, res, db); // Se le pasa también la base de datos
  }
});





function processPatchUsuario(req, res, db) {
  var patchNameDeUsuario = req.body.patchNameDeUsuario;
  var patchMailDeUsuario = req.body.patchMailDeUsuario;
  var patchPasswdDelUsuario = req.body.patchPasswdDelUsuario;
  var newpatchNameDeUsuario = req.body.newpatchNameDeUsuario;
  var newpatchMailDeUsuario = req.body.newpatchMailDeUsuario;
  var newpatchPasswdDelUsuario = req.body.newpatchPasswdDelUsuario;

  if (!verificarUsuario(req)) {
    res.json({ errormsg: 'Usuario no autenticado' });
    return;}
 // Primero, verificar si el usuario  existe
 db.get('SELECT user_id FROM users WHERE name = ?', [patchNameDeUsuario], (err, row) => {
  if (err) {
    res.json({ errormsg: "Nombre de usuario inexistente", error: err });
    return;
  }



  if (!row) {
    res.json({ errormsg: "El usuario introducido, no existe" });
    return;
  }

  // Usar el id del usuario porque existe
  var idUser = row.user_id;


    // Actualiza el usuarip con los nuevos detalles
    db.run(
      'UPDATE users SET name = ?, mail = ?, passwd=? WHERE user_id = ?',
      [newpatchNameDeUsuario || patchNameDeUsuario, newpatchMailDeUsuario || patchMailDeUsuario,newpatchPasswdDelUsuario || patchPasswdDelUsuario , idUser],
      function(err) {
        console.log("Actualizando el user con ID " + idUser + " a " + (newpatchNameDeUsuario || patchNameDeUsuario) + " mail: " + (newpatchPasswdDelUsuario || patchPasswdDelUsuario));

        if (err) {
          console.log("Se ha producido el siguiente error a la hora de la actualización: " + err);
          res.json({ errormsg: "Se ha producido el siguiente error a la hora de la actualización", error: err });
        } else {
          res.json({ msg: 'Actualizado correctamente' });
        }
      }
    );
  });
}



// Añadir las rutas al servidor
server.use('/', router);
// Añadir las rutas estáticas al servidor.
server.use(express.static('.'));

// Poner en marcha el servidor ...
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});