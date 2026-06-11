import React, { useState } from "react";
import { Modal, Badge, Form, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../../context/AuthContext";

const ModalDetalleServicio = ({ mostrarModal, setMostrarModal, servicio, onEliminarCalificacion, onResponderCalificacion }) => {
  const { usuario, rol, perfil } = useAuth();
  
  const [calificacionRespondiendo, setCalificacionRespondiendo] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [guardandoRespuesta, setGuardandoRespuesta] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [calificacionAEliminar, setCalificacionAEliminar] = useState(null);
  const [eliminandoCalificacion, setEliminandoCalificacion] = useState(false);
  const [mostrarConfirmacionEliminarRespuesta, setMostrarConfirmacionEliminarRespuesta] = useState(false);
  const [respuestaAEliminar, setRespuestaAEliminar] = useState(null);
  const [eliminandoRespuesta, setEliminandoRespuesta] = useState(false);

  const esAdminOEmpleado = usuario && (rol === "admin" || rol === "empleado");

  const manejarGuardarRespuesta = async (idCalificacion) => {
    if (guardandoRespuesta) return;
    setGuardandoRespuesta(true);
    try {
      if (onResponderCalificacion) {
        await onResponderCalificacion(idCalificacion, servicio.id_servicio, textoRespuesta.trim());
      }
      setCalificacionRespondiendo(null);
      setTextoRespuesta("");
    } catch (error) {
      console.error("Error al guardar respuesta:", error);
    } finally {
      setGuardandoRespuesta(false);
    }
  };

  const manejarEliminarRespuesta = (calificacion) => {
    setRespuestaAEliminar(calificacion);
    setMostrarConfirmacionEliminarRespuesta(true);
  };
  
  if (!servicio) return null;

  const renderEstrellas = (puntuacion) => {
    const estrellas = [];

    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <i
          key={i}
          className={
            i <= Number(puntuacion)
              ? "bi bi-star-fill text-warning"
              : "bi bi-star text-warning"
          }
        ></i>
      );
    }

    return estrellas;
  };

  return (
    <>
      <Modal
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{servicio.nombre}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {servicio.url_imagen && (
            <img
              src={servicio.url_imagen}
              alt={servicio.nombre}
              className="modal-servicio-imagen mb-3"
            />
          )}

          <Badge className="mb-3 modal-servicio-badge">
            {servicio.Categorias?.nombre || "Sin categoría"}
          </Badge>

          <p className="text-muted">
            {servicio.descripcion || "Sin descripción disponible."}
          </p>

          <div className="modal-servicio-info mb-4">
            <div>
              <i className="bi bi-cash-coin me-2"></i>
              <strong>Precio:</strong> C$ {Number(servicio.precio).toFixed(2)}
            </div>

            <div>
              <i className="bi bi-clock me-2"></i>
              <strong>Duración:</strong> {servicio.duracion} min
            </div>

            <div>
              <i className="bi bi-star-fill me-2"></i>
              <strong>Calificación:</strong>{" "}
              {servicio.totalReviews > 0
                ? `${Number(servicio.rating).toFixed(1)} / 5`
                : "Sin calificaciones"}
            </div>
          </div>

          <h5 className="fw-bold mb-3">Calificaciones</h5>

          {servicio.calificaciones && servicio.calificaciones.length > 0 ? (
            <div className="modal-calificaciones-lista">
              {[...servicio.calificaciones]
                .sort((a, b) => {
                  const aEsMia =
                    rol === "cliente" &&
                    Number(a.id_cliente) === Number(perfil?.id_cliente);

                  const bEsMia =
                    rol === "cliente" &&
                    Number(b.id_cliente) === Number(perfil?.id_cliente);

                  if (aEsMia && !bEsMia) return -1;
                  if (!aEsMia && bEsMia) return 1;

                  return 0;
                })
                .map((calificacion) => {
                const esPropietario =
                  rol === "cliente" &&
                  Number(perfil?.id_cliente) === Number(calificacion.id_cliente);

                const puedeEliminar =
                  usuario && (rol === "admin" || rol === "empleado" || esPropietario);

                const manejarEliminar = () => {
                  setCalificacionAEliminar(calificacion);
                  setMostrarConfirmacionEliminar(true);
                };

                const nombreCliente = calificacion.Clientes
                  ? `${calificacion.Clientes.nombre} ${calificacion.Clientes.apellido}`
                  : `Cliente #${calificacion.id_cliente}`;

                const inicialCliente = nombreCliente.charAt(0).toUpperCase();

                return (
                  <div
                    key={calificacion.id_calificacion}
                    className="modal-calificacion-item modal-calificacion-card d-flex justify-content-between align-items-start"
                  >
                    <div className="d-flex gap-3 flex-grow-1">
                      <div className="calificacion-avatar">
                        {calificacion.Clientes?.url_imagen ? (
                          <img
                            src={calificacion.Clientes.url_imagen}
                            alt={nombreCliente}
                          />
                        ) : (
                          <span>{inicialCliente}</span>
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="mb-2">
                          {renderEstrellas(calificacion.puntuacion)}
                        </div>

                        <p className="mb-1">
                          {calificacion.comentario || "Sin comentario."}
                        </p>

                        <small className="text-muted">
                          — {nombreCliente}
                        </small>

                        {/* LÓGICA DE RESPUESTA */}
                        {calificacionRespondiendo === calificacion.id_calificacion ? (
                          <div className="mt-3 p-2 bg-white rounded border border-light-subtle shadow-sm">
                            <Form.Group className="mb-2">
                              <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Escribe una respuesta de agradecimiento o aclaración..."
                                value={textoRespuesta}
                                onChange={(e) => setTextoRespuesta(e.target.value)}
                                disabled={guardandoRespuesta}
                                style={{ fontSize: "0.85rem" }}
                              />
                            </Form.Group>
                            <div className="d-flex gap-2 justify-content-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setCalificacionRespondiendo(null);
                                  setTextoRespuesta("");
                                }}
                                disabled={guardandoRespuesta}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                style={{ backgroundColor: "#7A564A", borderColor: "#7A564A" }}
                                onClick={() => manejarGuardarRespuesta(calificacion.id_calificacion)}
                                disabled={guardandoRespuesta || !textoRespuesta.trim()}
                              >
                                {guardandoRespuesta ? "Guardando..." : "Responder"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {calificacion.respuesta ? (
                              <div className="modal-calificacion-respuesta mt-2 ms-3 p-2 bg-white rounded border-start border-3 border-secondary d-flex justify-content-between align-items-start shadow-sm">
                                <div className="flex-grow-1">
                                  <small className="fw-bold text-muted d-block mb-1">
                                    <i className="bi bi-reply-fill me-1"></i>Respuesta del salón:
                                  </small>
                                  <p className="mb-0 text-muted small">{calificacion.respuesta}</p>
                                </div>
                                {esAdminOEmpleado && (
                                  <div className="d-flex gap-1 ms-2">
                                    <button
                                      className="btn btn-link text-primary p-0"
                                      onClick={() => {
                                        setCalificacionRespondiendo(calificacion.id_calificacion);
                                        setTextoRespuesta(calificacion.respuesta);
                                      }}
                                      title="Editar respuesta"
                                      style={{ fontSize: "1rem" }}
                                    >
                                      <i className="bi bi-pencil-square"></i>
                                    </button>
                                    <button
                                      className="btn btn-link text-danger p-0"
                                      onClick={() => manejarEliminarRespuesta(calificacion)}
                                      title="Eliminar respuesta"
                                      style={{ fontSize: "1rem" }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              esAdminOEmpleado && (
                                <button
                                  className="btn btn-link text-primary p-0 mt-2 d-block text-decoration-none"
                                  onClick={() => {
                                    setCalificacionRespondiendo(calificacion.id_calificacion);
                                    setTextoRespuesta("");
                                  }}
                                  style={{ fontSize: "0.82rem" }}
                                >
                                  <i className="bi bi-reply me-1"></i>Responder
                                </button>
                              )
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {puedeEliminar && (
                      <button
                        className="btn btn-link text-danger p-0 ms-3 mt-1"
                        onClick={manejarEliminar}
                        title="Eliminar comentario"
                        style={{ fontSize: "1.2rem", border: "none", background: "none" }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted">
              Este servicio aún no tiene calificaciones.
            </p>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={mostrarConfirmacionEliminar}
        onHide={() => {
          if (!eliminandoCalificacion) {
            setMostrarConfirmacionEliminar(false);
            setCalificacionAEliminar(null);
          }
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton={!eliminandoCalificacion}>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          ¿Estás seguro de que deseas eliminar esta calificación
          {calificacionAEliminar?.Clientes && (
            <>
              {" "}de{" "}
              <strong>
                {calificacionAEliminar.Clientes.nombre}{" "}
                {calificacionAEliminar.Clientes.apellido}
              </strong>
            </>
          )}
          ?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setMostrarConfirmacionEliminar(false);
              setCalificacionAEliminar(null);
            }}
            disabled={eliminandoCalificacion}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            disabled={eliminandoCalificacion}
            onClick={async () => {
              if (!calificacionAEliminar || !onEliminarCalificacion) return;

              setEliminandoCalificacion(true);

              await onEliminarCalificacion(
                calificacionAEliminar,
                servicio.id_servicio
              );

              setEliminandoCalificacion(false);
              setMostrarConfirmacionEliminar(false);
              setCalificacionAEliminar(null);
            }}
          >
            {eliminandoCalificacion ? "Eliminando..." : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={mostrarConfirmacionEliminarRespuesta}
        onHide={() => {
          if (!eliminandoRespuesta) {
            setMostrarConfirmacionEliminarRespuesta(false);
            setRespuestaAEliminar(null);
          }
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton={!eliminandoRespuesta}>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la respuesta de esta calificación?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setMostrarConfirmacionEliminarRespuesta(false);
              setRespuestaAEliminar(null);
            }}
            disabled={eliminandoRespuesta}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            disabled={eliminandoRespuesta}
            onClick={async () => {
              if (!respuestaAEliminar || !onResponderCalificacion) return;

              setEliminandoRespuesta(true);

              await onResponderCalificacion(
                respuestaAEliminar.id_calificacion,
                servicio.id_servicio,
                null
              );

              setEliminandoRespuesta(false);
              setMostrarConfirmacionEliminarRespuesta(false);
              setRespuestaAEliminar(null);
            }}
          >
            {eliminandoRespuesta ? "Eliminando..." : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalDetalleServicio;