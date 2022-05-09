const express = require('express');
const ligasController = require('../controllers/ligas.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.get('/Ligas', md_autenticacion.Auth, ligasController.mostrarLigas);
api.post('/Ligas/crearLiga/:UsuarioCreador?', md_autenticacion.Auth, ligasController.crearLiga);
api.put('/Ligas/editarLiga/:idLiga?', md_autenticacion.Auth, ligasController.editarLiga)
api.delete('/Ligas/eliminarLiga/:idLiga?', md_autenticacion.Auth, ligasController.eliminarLiga)

module.exports = api;