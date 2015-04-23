//Variables de configuración
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express();
var server=http.createServer(app);
server.listen(8080);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.get('/', function(req,res){
	res.render('index.jade',{layout:false});
});
app.get('/login', function(req,res){
	res.render('login.jade',{layout:false});
});
//Conexión a MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/usuarios');
var UsuarioSchema = mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true}
});
var Usuario = mongoose.model('Users', UsuarioSchema);

//Create
app.get('/usuarios/crear', function(req, res){
	res.render('usuarios/new', {
		put: false,
		action: '/usuarios/nuevo',
		usuario: new Usuario({
			name: '',
			email: '',
			password: ''
		})
	});
});

app.post('/usuarios/nuevo', function(req, res){
	var usuario = new Usuario({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});
	usuario.save(function(error, documento){
		if(error){
			res.send('Error al intentar guardar el usuario.');
		}else{	
			res.redirect('/usuarios');
		}
	});
});
//Read
app.get('/usuarios', function(req,res){
	Usuario.find({}, function(error, usuarios){
		if(error){
			res.send('Ha surgido un error.');
		}else{
			res.render('usuarios/read', {
				usuarios: usuarios
			});
		}
	})
});

//Delete
app.delete('/usuarios/:id', function(req, res){
	Usuario.remove({_id: req.params.id}, function(error){
		if(error){
			res.send('Error al intentar eliminar el personaje.');
		}else{	
			res.redirect('/usuarios');
		}
	});
});

//Update
app.get('/usuarios/:id/edit', function(req, res){
	Usuario.findById(req.params.id, function(error, documento){
		if(error){
			res.send('Error al intentar ver el usuario.');
		}else{
			res.render('usuarios/new', {
				put: true,
				action: '/update/' + req.params.id,
				usuario: documento
			});
		}
	});
});

app.put('/update/:id', function(req, res){
	Usuario.findById(req.params.id, function(error, documento){
		if(error){
			res.send('Error al intentar modificar el usuario.');
		}else{
			var usuario = documento;
			usuario.name = req.body.name;
			usuario.email = req.body.email;
			usuario.password = req.body.password;
			usuario.save(function(error, documento){
				if(error){
					res.send('Error al intentar guardar el usuario.');
				}else{	
					res.redirect('/usuarios');
				}
			});
		}
	});
});

/*
app.get('/usuarios/:id', function(req, res){
	Personaje.findById(req.params.id, function(error, documento){
		if(error){
			res.send('Error al intentar ver el personaje.');
		}else{
			res.render('personajes/show', {
				personaje: documento
			});
		}
	});
});
*/


//Error 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}