const Equipos = require("../models/equipos.model");
const Ligas = require("../models/ligas.model");
const Usuarios = require("../models/usuarios.model");
const fs = require("fs");
const PdfkitConstruct = require("pdfkit-construct");

function listarEquiposLiga(req, res) {
  var idLiga;
  var UsuarioCreador;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Ligas.findById({ _id: idLiga }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "No eres parte de esta competicion" });

    Equipos.find({ Liga: idLiga }, (err, equipoRecibido) => {
      if (err) return res.status(500).send({ message: "Error en la busqueda" });
      if (!equipoRecibido)
        return res
          .status(500)
          .send({ message: "Error al eliminar" });

      return res.status(200).send({ Equipo: equipoRecibido });
    }).sort({
      pts: -1,
    });
  });
}


function crearEquipo(req, res) {
  var parametros = req.body;
  var idLiga;
  var UsuarioCreador;
  var equipoModel = new Equipos();

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Ligas.findById({ _id: idLiga }, (err, ligaEncontradas) => {
    if (!ligaEncontradas)
      return res.status(500).send({ message: "Error em+n la busqueda" });

    Usuarios.findOne(
      { _id: ligaEncontradas.UsuarioCreador },
      (err, usuarioEncontrado) => {
        UsuarioCreador = usuarioEncontrado._id;

        if (req.user.rol == "Usuario" && usuarioEncontrado._id != req.user.sub)
          return res.status(500).send({ message: "No eres parte de esta competicion" });

        Equipos.find({ Liga: idLiga }, (err, ligaEncontradas) => {
          if (!ligaEncontradas)
            return res.status(500).send({ message: "Error en la busqueda" });

          if (ligaEncontradas.length >= 10)
            return res
              .status(500)
              .send({ message: "La liga ya está llena" });

          if (parametros.nombreEquipo) {
            equipoModel.nombreEquipo = parametros.nombreEquipo;
            equipoModel.golesFavor = 0;
            equipoModel.golesContra = 0;
            equipoModel.diferenciaGoles = 0;
            equipoModel.cantidadJugados = 0;
            equipoModel.pts = 0;
            equipoModel.Liga = idLiga;
            equipoModel.UsuarioCreador = UsuarioCreador;

            Equipos.findOne(
              {
                nombreEquipo: parametros.nombreEquipo,
                Liga: req.params.idLiga,
              },
              (err, nombreEncontrado) => {
                if (nombreEncontrado == null) {
                  equipoModel.save((err, equipoGuardado) => {
                    if (err)
                      return res
                        .status(500)
                        .send({ mensaje: "Error en la peticion" });
                    if (!equipoGuardado)
                      return res
                        .status(404)
                        .send({ mensaje: "Error en la busqueda" });

                    return res.status(200).send({ equipo: equipoGuardado });
                  });
                } else {
                  return res
                    .status(500)
                    .send({
                      mensaje: "Este equipo ya participa"
                    });
                }
              }
            );
          } else {
            return res
              .status(500)
              .send({ mensaje: "Error en la peticion" });
          }
        });
      }
    );
  });
}

function editarEquipo(req, res) {
  var parametros = req.body;
  var idLiga;
  var UsuarioCreador;
  var idEquipo = req.params.idEquipo;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Equipos.findById({ _id: idEquipo }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ mensaje: "No eres parte de esta competicion" });

    Equipos.findOne(
      { nombreEquipo: parametros.nombreEquipo, Liga: idLiga },
      (err, equipoEncontrado) => {
        if (equipoEncontrado == null) {
          Equipos.findByIdAndUpdate(
            { _id: idEquipo, UsuarioCreador: UsuarioCreador },
            parametros,
            { new: true },
            (err, equipoActualizado) => {
              if (err)
                return res.status(500).send({ mensaje: "Error en la peticion" });
              if (!equipoActualizado)
                return res
                  .status(500)
                  .send({ mensaje: "Erro al editar" });

              return res.status(200).send({ Equipo: equipoActualizado });
            }
          );
        } else {
          return res.status(500).send({ mensaje: "Este equipo ya compite" });
        }
      }
    );
  });
}

function eliminarEquipo(req, res) {
  var idLiga;
  var UsuarioCreador;
  var idEquipo = req.params.idEquipo;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Equipos.findById({ _id: idEquipo }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "No eres parte de esta competicion" });

    Equipos.findByIdAndDelete(
      { _id: idEquipo, UsuarioCreador: UsuarioCreador },
      { new: true },
      (err, equipoEliminado) => {
        if (err) return res.status(500).send({ message: "Error en la busqueda" });
        if (!equipoEliminado)
          return res
            .status(500)
            .send({ message: "Error al eliminar" })

        return res.status(200).send({ Equipo: equipoEliminado });
      }
    );
  });
}


function listarEquiposLigaPDF(req, res) {
  var idLiga;
  var UsuarioCreador;

  if (req.user.rol == "ADMIN") {
    idLiga = req.params.idLiga;
    UsuarioCreador = req.params.idCreador;
  } else if (req.user.rol == "Usuario") {
    UsuarioCreador = req.user.sub;
    idLiga = req.params.idLiga;
  }
  Ligas.findById({ _id: idLiga }, (err, equipoEncontrado) => {
    if (
      req.user.rol == "Usuario" &&
      equipoEncontrado.UsuarioCreador != req.user.sub
    )
      return res.status(500).send({ message: "No eres parte de esta competicion" });

    Equipos.find({ Liga: idLiga }, (err, equipoEliminado) => {
      if (err) return res.status(500).send({ message: "Error en la peticion" });
      if (!equipoEliminado)
        return res
          .status(500)
          .send({ message: "Error en la peticion" });

      geenerarPDF(equipoEliminado, equipoEncontrado);
    }).sort({
      pts: -1,
    });
  });
}
function geenerarPDF(equipoEliminado, equipoEncontrado) {
  var hoy = new Date();
  var fecha =
    hoy.getDate() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getFullYear();

  const doc = new PdfkitConstruct({
    size: "A4",
    margins: { top: 15, left: 20, right: 10, bottom: 20 },
    bufferPages: true,
  });
  doc.setDocumentHeader({}, () => {
    doc
      .lineJoin("stroke")
      .rect(0, 0, doc.page.width, doc.header.options.heightNumber)
      .fill("#e6f5e8");

    doc
      .fill("#04873c")
      .fontSize(42)
      .text(equipoEncontrado.nombreLiga, doc.header.x, doc.header.y);
  });

  doc.setDocumentFooter({}, () => {
    doc
      .lineJoin("miter")
      .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber)
      .fill("#ffffff");

    doc
      .fill("#000301")
      .fontSize(10)
      .text("PDFS Creado by Luis Ortiz - Guatemala 2,022 ©", doc.footer.x, doc.footer.y + 12, { align: 'center' });
  });

  let i;
  const invoiceTableTop = 300;

  doc.font("Helvetica-BoldOblique").fontSize(10).fillColor("#02a347");
  filaRegistro(
    doc,
    invoiceTableTop,
    "Equipo",
    "Goles Favor",
    "Goles Contra (GC)",
    "Diferencia Goles (DG)",
    "Partidos Jugados (PJ)",
    "Puntos (PTS)"
  );
  separadorSubtitulos(doc, invoiceTableTop + 20);
  doc.font("Helvetica").fontSize(10).fillColor("#000000");

  if (equipoEliminado.length == 0) {
    for (i = 0; i < 1; i++) {
      const position = invoiceTableTop + (i + 1) * 30;
      filaRegistro(
        doc,
        position,
        "No existen Equipos Asignados a esta Liga"

      );

      separadorRegistros(doc, position + 30);
    }
  } else {
    for (i = 0; i < equipoEliminado.length; i++) {
      const item = equipoEliminado[i];
      const position = invoiceTableTop + (i + 1) * 50;

      filaRegistro(
        doc,
        position,
        item.nombreEquipo,
        item.golesFavor,
        item.golesContra,
        item.diferenciaGoles,
        item.cantidadJugados,
        item.pts
      );

      separadorRegistros(doc, position + 30);
    }
  }

  doc.render();
  doc.pipe(
    fs.createWriteStream(
      "pdfs/" + equipoEncontrado.nombreLiga + " " + fecha + ".pdf"
    )
  );
  doc.end();
}
function separadorRegistros(doc, y) {
  doc
    .strokeColor("#000")
    .lineWidth(0.5)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}
function filaRegistro(
  doc,
  y,
  nombreEquipo,
  golesFavor,
  golesContra,
  diferenciaGoles,
  cantidadJugados,
  pts
) {
  doc
    .fontSize(10)
    .text(nombreEquipo, 25, y)
    .text(golesFavor, 90, y)
    .text(golesContra, 160, y)
    .text(diferenciaGoles, 275, y)
    .text(cantidadJugados, 390, y)
    .text(pts, 506, y);
}

function separadorSubtitulos(doc, y) {
  doc.strokeColor("#05e365").lineWidth(3).moveTo(10, y).lineTo(620, y).stroke();
}

module.exports = {
  listarEquiposLiga,
  crearEquipo,
  editarEquipo,
  eliminarEquipo,
  listarEquiposLigaPDF
};  