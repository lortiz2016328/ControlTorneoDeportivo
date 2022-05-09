const Partidos = require('../models/partidos.model');
const Equipos = require('../models/equipos.model');
const ligasModel = require('../models/ligas.model');
const Jornadas = require('../models/jornadas.model');
const Ligas = require('../models/ligas.model');


function crearPartido(req, res) {
    var parametros = req.body;
    var idJornada = req.params.idJornada;
    var partidosMaximos;
    var partidosModel = new Partidos();
    if (parametros.equipo1 && parametros.equipo2) {
        Jornadas.findById({ _id: idJornada }, (err, jornadaEncontrada) => {
            if (!jornadaEncontrada) return res.status(500).send({ mensaje: "No se ha encontrado la jornada" });
            Equipos.findById({ _id: parametros.equipo1, UsuarioCreador: jornadaEncontrada.UsuarioCreador }, (err, equipo1Encontrado) => {
                if (!equipo1Encontrado) return res.status(500).send({ mensaje: "No se ha encontrado el equipo" });
                Equipos.findById({ _id: parametros.equipo2, UsuarioCreador: jornadaEncontrada.UsuarioCreador }, (err, equipo2Encontrado) => {
                    if (!equipo2Encontrado) return res.status(500).send({ mensaje: "No se ha encontrado el equipo" });
                    Ligas.findById({ _id: equipo2Encontrado.Liga }, (err, ligaEncontradas) => {
                        if (!ligaEncontradas) return res.status(500).send({ mensaje: "No se ha encontrado la liga" });
                        if (req.user.rol == 'Usuario' && req.user.sub != ligaEncontradas.UsuarioCreador) return res.status(500).send({ mensaje: "o participas en la liga" });

                        Equipos.find({ Liga: ligaEncontradas._id }, (err, equiposLigaEncontrados) => {
                            if (err) return res.status(500).send({ mensaje: "La liga está vacia" });

                            if (equiposLigaEncontrados.length % 2 == 0) {
                                partidosMaximos = (equiposLigaEncontrados.length / 2)
                            } else {
                                partidosMaximos = (equiposLigaEncontrados.length - 1) / 2

                            }

                            Partidos.find({ Liga: ligaEncontradas._id }, (err, partidosLigaEncontrados) => {
                                if (!partidosLigaEncontrados) return res.status(500).send({ mensaje: "No hay partidos en esta liga" });

                                if (partidosLigaEncontrados.length >= partidosMaximos) return res.status(500).send({ mensaje: "No pueden haber más partidos" });

                                Partidos.findOne({ equipo1: parametros.equipo1, Jornada: idJornada }, (err, equipo1Find) => {
                                    if (!equipo1Find) {
                                        Partidos.findOne({ equipo2: parametros.equipo2, Jornada: idJornada }, (err, equipo2Find) => {
                                            if (!equipo2Find) {
                                                partidosModel.equipo1 = parametros.equipo1;
                                                partidosModel.golesEquipo1 = 0
                                                partidosModel.equipo2 = parametros.equipo2;
                                                partidosModel.golesEquipo2 = 0;
                                                partidosModel.Liga = jornadaEncontrada.Liga;
                                                partidosModel.Jornada = idJornada

                                                partidosModel.save((err, partidoGuardado) => {
                                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                                    if (!partidoGuardado) return res.status(500).send({ mensaje: "Error al guardar" });

                                                    return res.status(200).send({ Partido: partidoGuardado })
                                                })
                                            } else {
                                                return res.status(500).send({ mensaje: "El equipo 2 ya jugó" })
                                            }
                                        })
                                    } else {
                                        return res.status(500).send({ mensaje: "El equipo 1 ya jugo" })
                                    }
                                })

                            })
                        })
                    })
                })
            })
        })
    } else {
        return res.status(500).send({ message: "Llena todos los campos" });
    }
}

function editarPartido(req, res) {
    var parametros = req.body
    var idPart = req.params.idPartido
    var pts1;
    var pts2;

    if (parametros.equipo1 && parametros.equipo2) {
        return res.status(200).send({ message: "Cambia el marcador" })
    } else {
        Partidos.findById({ _id: idPart }, (err, partidoEncontrado) => {
            if (!partidoEncontrado) return res.status(500).send({ message: "No se ha encontrado la jornada" });

            Ligas.findById({ _id: partidoEncontrado.Liga }, (err, ligaEncontrada) => {
                if (!ligaEncontrada) return res.status(500).send({ message: "No se ha encontrado la Liga" });

                if (req.user.role == 'Usuario' && ligaEncontrada.UsuarioCreador != req.user.sub) return res.status(500).send({ message: "No juegas en esta liga" });

                Partidos.findByIdAndUpdate({ _id: idPart }, parametros, { new: true }, (err, marcadorActualizado) => {
                    if (err) return res.status(500).send({ message: "Error en la peticion" });
                    if (!marcadorActualizado) return res.status(500).send({ message: "Erroe al editar" });
                    if (marcadorActualizado.golesEquipo1 > marcadorActualizado.golesEquipo2) {
                        pts1 = 3
                        pts2 = 0
                    } else if (marcadorActualizado.golesEquipo1 < marcadorActualizado.golesEquipo2) {
                        pts1 = 0;
                        pts2 = 3;
                    } else if (marcadorActualizado.golesEquipo1 == marcadorActualizado.golesEquipo2) {
                        pts1 = 1;
                        pts2 = 1;
                    }
                    editarEquipo(pts1, marcadorActualizado.golesEquipo1, marcadorActualizado.golesEquipo2, marcadorActualizado.equipo1)
                    editarEquipo(pts2, marcadorActualizado.golesEquipo2, marcadorActualizado.golesEquipo1, marcadorActualizado.equipo2)
                    return res.status(200).send({ Partido: marcadorActualizado })
                })
            })

        });
    }

}


function editarEquipo(pts, golesFav, golesCon, idEquipo) {
    var diferenciaGoles;
    Equipos.findByIdAndUpdate({ _id: idEquipo }, { $inc: { golesFavor: golesFav, golesContra: golesCon, cantidadJugados: 1, pts: pts } }, { new: true }, (err, datosEquipoModificados) => {
        diferenciaGoles = Math.abs(datosEquipoModificados.golesFavor - datosEquipoModificados.golesContra)

        Equipos.findByIdAndUpdate({ _id: idEquipo }, { $inc: { diferenciaGoles: diferenciaGoles } }, (err, datoModificados) => {
            if (!datoModificados) return res.status(500).send({ message: "Error al actualizar" })
        })
    })
}

module.exports = {
    crearPartido,
    editarPartido
}