const express = require('express');
const partidosController = require('../controllers/partidos.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.post('/Partido/crearPartido/:idJornada?', md_autenticacion.Auth, partidosController.crearPartido);
api.put('/Partido/editarPartido/:idPartido?', md_autenticacion.Auth, partidosController.editarPartido);

module.exports = api;