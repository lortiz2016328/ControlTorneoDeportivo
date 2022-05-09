const express = require('express');
const jornadasController = require('../controllers/jornadas.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.get('/Jornadas/:idLiga?', md_autenticacion.Auth, jornadasController.mostrarJornadas);
api.post('/Jornadas/crearJornada/:idLiga?/:idCreador?', md_autenticacion.Auth, jornadasController.crearJornada);
api.put('/Jornadas/editarJornada/:idJornada?/:idLiga?/:idCreador?', md_autenticacion.Auth, jornadasController.editarJornada);
api.delete('/Jornadas/eliminarJornada/:idJornada?/:idLiga?/:idCreador?', md_autenticacion.Auth, jornadasController.eliminarJornada);

module.exports = api;