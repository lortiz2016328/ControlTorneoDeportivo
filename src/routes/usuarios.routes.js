const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/Usuario/agregarAdministrador',md_autenticacion.Auth, usuariosController.agregarAdmin);
api.post('/Usuario/agergarUsuario', usuariosController.registrarUsuario);
api.put('/Usuario/editarUsuario/:idUsuario?', md_autenticacion.Auth, usuariosController.editarUsuario);
api.delete('/Usuario/eliminarUsuario/:idUsuario?', md_autenticacion.Auth, usuariosController.eliminarUsuario);
api.post('/login', usuariosController.Login);

module.exports = api;