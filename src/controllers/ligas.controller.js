const Ligas = require('../models/ligas.model');

function mostrarLigas(req, res) {
    if (req.user.rol == 'Usuario') return res.status(500).send({ message: "No eres usuario, no tienes acceso" });

    Ligas.find((err, listaLigas) => {
        if (err) return res.status(500).send({ message: "Error en la peticion" });
        if (!listaLigas) return res.status(500).send({ message: "No existen ligas" });

        return res.status(200).send({ Liga: listaLigas })
    });
}

function crearLiga(req, res) {
    var parametros = req.body;
    var ligaModel = new Ligas();
    var UsuarioCreador;

    if (parametros.nombreLiga) {
        ligaModel.nombreLiga = parametros.nombreLiga;
        if (req.user.rol == 'Usuario') {
            UsuarioCreador = req.user.sub;
            ligaModel.UsuarioCreador = req.user.sub;
        } else if (req.user.rol == 'Admin') {
            if (req.params.UsuarioCreador == null) {
                return res.status(500).send({ message: "El usuario no se ha enconrado" })
            } else {
                UsuarioCreador = req.params.UsuarioCreador
                ligaModel.UsuarioCreador = UsuarioCreador;
            }
        }
        Ligas.find({ nombreLiga: parametros.nombreLiga, UsuarioCreador: UsuarioCreador }, (err, ligaEncontrada) => {
            if (ligaEncontrada == 0) {
                ligaModel.save((err, ligaGuardada) => {
                    if (err) return res.status(500).send({ message: "Eror en la peticion" });
                    if (!ligaGuardada) return res.status(500).send({ message: "Error al guardar" });

                    return res.status(200).send({ Liga: ligaGuardada })
                });
            } else {
                return res.status(500).send({ message: "No puedes tener más ligas" })
            }
        });
    } else {
        return res.status(500).send({ message: "Llena todos los campos" })
    }
}

function editarLiga(req, res) {
    var parametros = req.body;
    var liga = req.params.idLiga;
    if (parametros.nombreLiga) {
        if (req.user.rol == 'Usuario') {
            Ligas.findOne({ nombreLiga: parametros.nombreLiga, UsuarioCreador: req.user.sub }, (err, ligaEncotradas) => {
                if (ligaEncotradas != null && parametros.nombreLiga != ligaEncotradas.nombreLiga) {
                    return res.status(500).send({ mensaje: "Esta liga ya existe" })
                } else {
                    Ligas.findByIdAndUpdate({ _id: liga, UsuarioCreador: req.user.sub }, parametros, { new: true }, (err, ligaEditada) => {
                        if (err) return res.status(500).send({ mensaje: "Error al editar" });
                        if (!ligaEditada) return res.status(500).send({ mensaje: "Eror en la peticion" })

                        return res.status(200).send({ ligaEditada: ligaEditada })
                    })
                }
            })
        } else if (req.user.rol == 'Admin') {
            Ligas.findOne({ nombreLiga: parametros.nombreLiga }, (err, ligaEncotradas) => {
                if (ligaEncotradas == null && liga == ligaEncotradas._id) {
                    Ligas.findByIdAndUpdate({ _id: liga }, parametros, { new: true }, (err, ligaEditada) => {
                        if (err) return res.status(500).send({ mensaje: "Error al rditar" });
                        if (!ligaEditada) return res.status(500).send({ mensaje: "Erroen la peticion" });

                        return res.status(200).send({ ligaEditada: ligaEditada })
                    })
                } else {
                    return res.status(500).send({ mensaje: "Esta liga ya existe" });
                }
            });
        }
    } else {
        return res.status(500).send({ mensaje: "Llena todos los campos" });
    }
}


function eliminarLiga(req, res) {
    var liga = req.params.idLiga;
    if (req.user.rol == 'Usuario') {
        Ligas.findByIdAndDelete({ _id: liga, UsuarioCreador: req.user.sub }, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ mensaje: "Erroe al eliminar" });
            if (!ligaEliminada) return res.status(500).send({ mensaje: "Erroe n la peticion" });

            return res.status(200).send({ ligaEliminada: ligaEliminada })
        })
    } else if (req.user.rol == 'ADMIN') {
        Ligas.findByIdAndDelete({ _id: liga }, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ mensaje: "Error al eliminar" });
            if (!ligaEliminada) return res.status(500).send({ mensaje: "eRROR EN LA PETICION" });

            return res.status(200).send({ ligaEliminada: ligaEliminada })
        })
    }
}

module.exports = {
    mostrarLigas,
    crearLiga,
    editarLiga,
    eliminarLiga
}