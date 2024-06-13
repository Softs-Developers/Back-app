'use strict';
// Cargamos el modulo de Express
const express = require('express');
// Crearmos un objeto servidor HTTP
const cors = require('cors');

const server = express();
server
.use(cors()); // Enable CORS for all routes
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
router.use(express.json());
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
    'SELECT * FROM users WHERE name = ?', [nameLogin],
    (err, row) => {
      if (err) {
        res.json({ errormsg: 'Error en la base de datos', error: err });
        return;
      }

      if (!row) {
        res.json({ errormsg: 'El usuario no existe' });
      } else if (row.passwd === passwd) {
        var data = {
          user_id: row.user_id,
          name: row.name,
          mail: row.mail,

        };
        const token = jwt.sign(data, 'secret_key', { expiresIn: '1h' });
        const rolUSer = row.ROL;
        console.log(rolUSer);

        // Insertar el token en la tabla sesiones_virtuales
        db.run(
          'INSERT INTO sesiones_virtuales (session_id, token) VALUES (?, ?)',
          [row.user_id, token],
          (err) => {
            if (err) {
              res.json({ errormsg: 'Error al guardar la sesión', error: err });
              console.log("se ha dado el siguiente error " + err)
              return;
            }
            res.json({ token, rolUsuario: rolUSer, user: data });
          }
        );
      } else {
        res.json({ errormsg: 'Fallo de autenticación' });
      }
    }
  );
}



function verificarUsuario(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  if (!authorizationHeader) {
    console.log('Token no proporcionado');
    return res.json({ errormsg: 'Token no proporcionado' });
  }

  const token = authorizationHeader.split(' ')[1];
  console.log("El token enviado es " + token);
  if (!token) {
    console.log('Token no proporcionado');
    return res.json({ errormsg: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    const userId = decoded.user_id;
    console.log("El userID del token es " + userId);

    db.get(
      'SELECT * FROM sesiones_virtuales WHERE session_id = ? AND token = ?',
      [userId, token],
      (err, row) => {
        if (err) {
          console.log('Error al verificar el token en la base de datos:', err);
          return res.json({ errormsg: 'Error al verificar el token en la base de datos', error: err });
        }

        if (!row) {
          console.log('Token no válido o no encontrado');
          return res.json({ errormsg: 'Token no válido o no encontrado' });
        }

        // Token verificado con éxito y encontrado en la base de datos
        req.user = decoded; // Adjunta los datos del usuario al objeto req si es necesario
        console.log('Token verificado con éxito:', decoded);
        next(); // Pasa al siguiente middleware o función de ruta
      }
    );
  } catch (err) {
    console.log('Error al verificar el token:', err);
    return res.json({ errormsg: 'Error al verificar el token', error: err });
  }
}




function processGetCategorias(req, res, db) {
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
  db.all('SELECT * FROM Videos', (err, rows) => {
    if (err) {
      console.log('Error al obtener los videos:', err);
      return res.json({ errormsg: 'Error al obtener los videos', error: err });
    }

    if (rows === undefined || rows.length === 0) {
      return res.json({ errormsg: 'No existen videos' });
    } else {
      return res.json(rows);
    }
  });
}


function processGetUsuarios(req, res, db) {
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




//Logout
router.delete('/logout', verificarUsuario, (req, res) => {// Comprobar si la petición contiene los campos ('user' y 'passwd')
  if (!req.query.logoutIDUsuario) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processLogout(req, res, db); // Se le pasa tambien la base de datos
  }
});


function processLogout(req, res, db) {
  var logoutIDUsuario = req.query.logoutIDUsuario;
  db.run(
    'delete from sesiones_virtuales where session_id=?', logoutIDUsuario,
    (err) => {
      if (err) {
        console.log("Error al ejecutar el logout: " + err);
        return;
      }
      res.json({ msg: 'logout ejecutado correctamente' });
    }
  );
}


// Configurar la accion asociada a la solicitud de todos los usuarios
router.get('/getUsuarios', verificarUsuario, (req, res) => {
  processGetUsuarios(req, res, db);
});


// Configurar la accion asociada a la solicitud de todas las categorias
router.get('/getCategorias', verificarUsuario, (req, res) => {
  processGetCategorias(req, res, db);
});


// Configurar la accion asociada a la solicitud de todas las películas
router.get('/getVideos', verificarUsuario, (req, res) => {
  processGetVideos(req, res, db);
});


// Configurar la accion asociada a la solicitud de video pasando el id de la categoría a la que pertenecen
router.get('/getVideoByCategoria', verificarUsuario, (req, res) => {
  if (req.body.categoriaId) {
    processGetVideosByCategoiaId(req, res, db);
  } else if (req.body.categoriaName) {
    processGetVideosByCategoriaName(req, res, db);
  } else {
    res.json({ errormsg: 'Solicitud mal ejecutada' });

  }
});





//MÉTODOS POSTS

function processPostCategorias(req, res, db) {
  var nameCategoria = req.body.nameCategoria;
  db.all(
    'INSERT INTO   categorias (name) values (?)', nameCategoria,
    (err) => {
      console.log("el nombre del categoría es " + nameCategoria);

      if (err) {
        console.log("Se ha producido el siguiente error a la hora de la insercción " + err);
        res.json({ errormsg: "Se ha producido el siguiente error a la hora de la insercción " }, err);
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
  // Primero, verifica si la categoría ya existe
  db.get('SELECT id FROM categorias WHERE name = ?', [nameCategoriaVideo], (err, row) => {
    if (err) {
      console.log("la categoría introducicda no existe, por favor crea una nnueva, el error es: " + err);
      res.json({ errormsg: "la categoría introducicda no existe, por favor crea una nueva " }, err);
      return;
    }

    if (row) {
      // Usar el id de la categoría porque existe
      insertarVideo(row.id);
    } else {

      res.json({ errormsg: "Error solicitando el indice de categoria" });

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

function processPostUsuario(req, res, db) {
  var postNameDeUsuario = req.body.postNameDeUsuario;
  var postMailDeUsuario = req.body.postMailDeUsuario;
  var postPasswdDelUsuario = req.body.postPasswdDelUsuario;
  var postRolDeUsuario = req.body.postRolDeUsuario;

  db.run(
    'INSERT INTO users (name, mail, passwd, ROL) VALUES (?, ?, ?,?)',
    [postNameDeUsuario, postMailDeUsuario, postPasswdDelUsuario, postRolDeUsuario],
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
router.post('/postCategorias', verificarUsuario, (req, res) => {

  if (!req.body.nameCategoria) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPostCategorias(req, res, db); // Se le pasa tambien la base de datos
  }
});



// Configurar la accion asociada a la creacion  de nuevos videos
router.post('/postVideo', verificarUsuario, (req, res) => {
  if (!req.body.postNameDeVideo || !req.body.postUrlDeVideo || !req.body.postNameCategoriaDeVideo) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPostVideo(req, res, db); // Se le pasa tambien la base de datos
  }
});



// Configurar la accion asociada a la creacion  de nuevos usuarios
router.post('/postUsuario', verificarUsuario, (req, res) => {
  if (!req.body.postNameDeUsuario || !req.body.postMailDeUsuario || !req.body.postPasswdDelUsuario || !req.body.postRolDeUsuario) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPostUsuario(req, res, db); // Se le pasa tambien la base de datos
  }
});



// metodos de delete
function processDeleteCategorias(req, res, db) {
  var deleteNameCategoria = req.query.deleteNameCategoria;
  db.run(
    'delete from categorias where name=?', deleteNameCategoria,
    (err) => {
      if (err) {
        console.log("Error al insertar el usuario, provocado por el siguiente error " + err);
        return;
      }
      res.json({ msg: 'Categoria eliminada correctamente' });
    }
  );
}


function processDeleteVideos(req, res, db) {
  var deleteNameVideo = req.query.deleteNameVideo;
  db.run(
    'delete from videos where title=?', deleteNameVideo,
    (err) => {
      if (err) {
        console.log("Error al eliminar video con error: " + err); 
        res.json({ errormsg: 'Error al eliminar el video', error: err });
        return;
      }
    res.json({ msg: 'video eliminado correctamente' });
      
    }
  );
}



function processDeleteUsuarios(req, res, db) {
  var deleteIDUsuario = req.query.deleteIDUsuario;
  db.run(
    'delete from users where user_id=?', deleteIDUsuario,
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
router.delete('/deleteCategorias', verificarUsuario, (req, res) => {
   
  if (!req.query.deleteNameCategoria) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processDeleteCategorias(req, res, db); // Se le pasa tambien la base de datos
  }
});




router.delete('/deleteVideos', verificarUsuario, (req, res) => {

  if (!req.query.deleteNameVideo) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    
    processDeleteVideos(req, res, db); // Se le pasa tambien la base de datos
  }
});


router.delete('/deleteUsuarios', verificarUsuario, (req, res) => {
   
  if (!req.query.deleteIDUsuario) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processDeleteUsuarios(req, res, db); // Se le pasa tambien la base de datos
  }
});



//Método para actualizar informacion usando el patch. MODIFICADOS  PARA QUE SE HAGA VIA ID

// Configurar la accion asociada a la actualización de categorias
router.patch('/patchCategorias', verificarUsuario, (req, res) => {
  if (!req.body.PatchIdCategoria && !req.body.newNameCategoria) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPatchCategorias(req, res, db); // Se le pasa también la base de datos
  }
});


function processPatchCategorias(req, res, db) {
  var PatchIdCategoria = req.body.PatchIdCategoria;
  var newNameCategoria = req.body.newNameCategoria; // Nuevo nombre para la categoría
  var id = PatchIdCategoria;
  db.run(
    'UPDATE categorias SET name = ? WHERE id = ?',
    [newNameCategoria, id],
    function (err) {
      if (err) {
        console.log("Se ha producido el siguiente error a la hora de la actualización: " + err);
        res.json({ errormsg: "Se ha producido el siguiente error a la hora de la actualización", error: err });
      } else if (this.changes === 0) {
        // No se afectó ninguna fila
        res.json({ errormsg: "No se encontró el video con el ID proporcionado" });
      } else {
        res.json({ msg: 'Actualizado correctamente' });
      }
    }
  );
}





// Configurar la accion asociada a la actualización de videos
router.patch('/patchVideo', verificarUsuario, (req, res) => {
  if (!req.body.newPatchUrlDeVideo && !req.body.newPatchNameDeVideo && !req.body.newPatchCategoriaDeVideo && !req.body.PatchIdDeVideo) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPatchVideos(req, res, db); // Se le pasa también la base de datos
  }
});



function processPatchVideos(req, res, db) {
  var newPatchUrlDeVideo = req.body.newPatchUrlDeVideo;
  var newPatchNameDeVideo = req.body.newPatchNameDeVideo;
  var newPatchCategoriaDeVideo = req.body.newPatchCategoriaDeVideo;
  var PatchIdDeVideo = req.body.PatchIdDeVideo;
  db.get(
    'SELECT id FROM categorias WHERE name = ?',
    [newPatchCategoriaDeVideo],
    function (err, row) {
      if (err) {
        console.log("Error al buscar la categoría: " + err);
        res.json({ errormsg: "Error al buscar la categoría", error: err });
        return;
      }

      if (!row) {
        res.json({ errormsg: 'No se encontró la categoría con el nombre proporcionado' });
        return;
      }

      var idCategoria = row.id;
      // Actualiza el video con los nuevos detalles
      db.run(
        'UPDATE videos SET title = ?, url = ?, categoria = ?, id_cat = ? WHERE id = ?',
        [newPatchNameDeVideo, newPatchUrlDeVideo, newPatchCategoriaDeVideo, idCategoria, PatchIdDeVideo],
        function (err) {
          if (err) {
            console.log("Se ha producido el siguiente error a la hora de la actualización: " + err);
            res.json({ errormsg: "Se ha producido el siguiente error a la hora de la actualización", error: err });
          } else if (this.changes === 0) {
            // No se afectó ninguna fila
            res.json({ errormsg: "No se encontró el video con el ID proporcionado" });
          } else {
            res.json({ msg: 'Actualizado correctamente' });
          }
        }
      );
    }
  );
}








router.patch('/patchUsuario', verificarUsuario, (req, res) => {
  if (!req.body.patchIdUsuario && !req.body.newpatchNameDeUsuario && !req.body.newpatchMailDeUsuario && !req.body.newpatchPasswdDelUsuario &&
    !req.body.newpatchROLDelUsuario
  ) {
    res.json({ errormsg: 'Peticion mal formada' });
  } else {
    // La petición está bien formada -> procesarla
    processPatchUsuario(req, res, db); // Se le pasa también la base de datos
  }
});

function processPatchUsuario(req, res, db) {
  var patchIdUsuario = req.body.patchIdUsuario;
  var newpatchNameDeUsuario = req.body.newpatchNameDeUsuario;
  var newpatchMailDeUsuario = req.body.newpatchMailDeUsuario;
  var newpatchPasswdDelUsuario = req.body.newpatchPasswdDelUsuario;
  var newpatchROLDelUsuario = req.body.newpatchROLDelUsuario;  //ATENCUIon este parametro no puedes implementarlohasta que no te suba las nuevas modificaciones 
  //DE la BBDD , ahora simplemente ignoaralo.
  // Usar el id del usuario porque existe
  var idUser = patchIdUsuario;
  // Actualiza el usuarip con los nuevos detalles
  db.run(
    'UPDATE users SET name = ?, mail = ?, passwd=? , ROL=? WHERE user_id = ?',
    [newpatchNameDeUsuario, newpatchMailDeUsuario, newpatchPasswdDelUsuario, newpatchROLDelUsuario, idUser],
    function (err) {
      if (err) {
        console.log("Se ha producido el siguiente error a la hora de la actualización: " + err);
        res.json({ errormsg: "Se ha producido el siguiente error a la hora de la actualización", error: err });
      } else if (this.changes === 0) {
        // No se afectó ninguna fila
        res.json({ errormsg: "No se encontró el video con el ID proporcionado" });
      } else {
        res.json({ msg: 'Actualizado correctamente' });
      }
    }
  );
}



// Añadir las rutas al servidor
server.use('/', router);
// Añadir las rutas estáticas al servidor.
server.use(express.static('.'));

// Poner en marcha el servidor ...
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});