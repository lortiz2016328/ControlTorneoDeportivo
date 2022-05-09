const Jornadas = require('../models/jornadas.model');
const Equipos = require('../models/equipos.model');
const Ligas = require('../models/ligas.model');
const Usuarios = require('../models/usuarios.model');


function mostrarJornadas(req, res) {
    var idLiga = req.params.idLiga;
    var idJornada;
    var user;

    if (req.user.rol == 'Usuario') {
        Jornadas.find({ Liga: idLiga, UsuarioCreador: req.user.sub }, (err, jornadasEncontradas) => {
            if (err) return res.status(500).send({ message: "No eres parte de esta competicion" })
            if (jornadasEncontradas == '') return res.status(500).send({ message: "Erroe en la peticion" })

            return res.status(200).send({ jornadas: jornadasEncontradas })
        })
    } else if (req.user.rol == 'ADMIN') {
        Jornadas.find({ Liga: idLiga, UsuarioCreador: req.user.sub }, (err, jornadasEncontradas) => {
            if (!jornadasEncontradas) return res.status(500).send({ message: "Error en la busqueda" })
            return res.status(200).send({ jornadas: jornadasEncontradas })
        })
    }
}


function crearJornada(req, res) {
    var parametros = req.body;
    var joranadaModel = new Jornadas();
    if (req.user.rol == 'ADMIN') {
        idLiga = req.params.idLiga
        UsuarioCreador = req.params.idCreador
    } else if (req.user.rol == 'Usuario') {
        UsuarioCreador = req.user.sub
        idLiga = req.params.idLiga
    }

    var JornadaMaxima;

    Equipos.find({ Liga: idLiga }, (err, equipoEnocntrado) => {
        if (!equipoEnocntrado) return res.status(500).send({ mensaje: "Error al buscar ligas" });

        if (equipoEnocntrado.length % 2 == 0) {
            JornadaMaxima = equipoEnocntrado.length - 1
        } else {
            JornadaMaxima = equipoEnocntrado.length
        }
        Jornadas.find({ Liga: idLiga }, (err, ligas) => {
            if (ligas.length >= JornadaMaxima) return res.status(500).send({ mensaje: "Ya no se pueden crear jornadas" })

            Ligas.findById({ _id: idLiga }, (err, ligaEncontradas) => {

                if (!ligaEncontradas) return res.status(500).send({ mensaje: "Error en la busqueda" })

                Usuarios.findOne({ _id: ligaEncontradas.UsuarioCreador }, (err, usuarioEncontrado) => {
                    UsuarioCreador = usuarioEncontrado._id;

                    if (req.user.rol == 'Usuario' && usuarioEncontrado._id != req.user.sub) return res.status(500).send({ mensaje: "No eres parte de esta competicion" });

                    if (parametros.nombreJornada) {

                        joranadaModel.nombreJornada = parametros.nombreJornada;
                        joranadaModel.Liga = idLiga;
                        joranadaModel.UsuarioCreador = UsuarioCreador;

                        Jornadas.findOne({ nombreJornada: parametros.nombreJornada, Liga: idLiga }, (err, jornadaEncontrada) => {

                            if (jornadaEncontrada == null) {
                                joranadaModel.save((err, jornadaGuardada) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                    if (!jornadaGuardada) return res.status(404).send({ mensaje: "Erroe en la biusqueda" });

                                    return res.status(200).send({ jornada: jornadaGuardada })
                                })
                            } else {
                                return res.status(500).send({ mensaje: "La jornada ya existe" })
                            }
                        })
                    } else {
                        return res.status(500).send({ mensaje: "LLene todos los campos" })
                    }

                })
            })
        })
    })
}

function editarJornada(req, res) {
    var parametros = req.body;
    var idJornada = req.params.idJornada;
    if (req.user.rol == 'ADMIN') {
        idLiga = req.params.idLiga
        UsuarioCreador = req.params.idCreador
    } else if (req.user.rol == 'Usuario') {
        UsuarioCreador = req.user.sub
        idLiga = req.params.idLiga
    }


    Jornadas.findById({ _id: idJornada }, (err, ligaEncontradas) => {
        if (!ligaEncontradas) return res.status(500).send({ message: "Error en la busqueda" });

        Ligas.findById({ _id: ligaEncontradas.Liga }, (err, ligaFind) => {
            if (!ligaFind) return res.status(500).send({ message: "La jornada no se ha encontrado" });

            Usuarios.findById({ _id: ligaEncontradas.UsuarioCreador }, (err, usuarioEncontrado) => {
                if (!usuarioEncontrado) return res.status(500).send({ message: "El usuario no se ha enconttado" })

                if (req.user.rol == 'Usuario' && usuarioEncontrado._id != req.user.sub) return res.status(500).send({ message: "No eres parte de esta competicion" })

                if (parametros.nombreJornada) {
                    Jornadas.findOne({ nombreJornada: parametros.nombreJornada, Liga: idLiga }, (err, jornadaEncontrada) => {

                        if (jornadaEncontrada == null) {
                            Jornadas.findByIdAndUpdate({ _id: idJornada }, parametros, { new: true }, (err, jornadaEditada) => {
                                if (err) return res.status(500).send({ message: "Error en la peticion" });
                                if (!jornadaEditada) return res.status(404).send({ message: "Error al editar" })

                                return res.status(200).send({ jornada: jornadaEditada });
                            })
                        } else {
                            return res.status(500).send({ message: "La jornada ya existe" })
                        }
                    })
                } else {
                    return res.status(500).send({ message: "Llena todos los campos" })
                }

            })
        })
    })
}

function eliminarJornada(req, res) {
    var idJornada = req.params.idJornada;
    if (req.user.rol == 'ADMIN') {
        idLiga = req.params.idLiga
        UsuarioCreador = req.params.idCreador
    } else if (req.user.rol == 'Usuario') {
        UsuarioCreador = req.user.sub
        idLiga = req.params.idLiga
    }

    Jornadas.findById({ _id: idJornada }, (err, ligaEncontradas) => {
        if (!ligaEncontradas) return res.status(500).send({ message: "Error en la busqueda" });

        Ligas.findById({ _id: ligaEncontradas.Liga }, (err, ligaFind) => {
            if (!ligaFind) return res.status(500).send({ message: "Error en la peticion" });

            Usuarios.findById({ _id: ligaEncontradas.UsuarioCreador }, (err, usuarioEncontrado) => {
                if (!usuarioEncontrado) return res.status(500).send({ message: "El usuario no se ha encontrado" })

                if (req.user.rol == 'Usuario' && usuarioEncontrado._id != req.user.sub) return res.status(500).send({ message: "No eres parte de esta competicion" })

                Jornadas.findByIdAndDelete({ _id: idJornada }, { new: true }, (err, jornadaEliminada) => {
                    if (err) return res.status(500).send({ message: "Error en la pticion" });
                    if (!jornadaEliminada) return res.status(404).send({ message: "Error al eliminar" })

                    return res.status(200).send({ jornada: jornadaEliminada });
                })

            })
        })
    })
}

module.exports = {
    mostrarJornadas,
    crearJornada,
    editarJornada,
    eliminarJornada
}