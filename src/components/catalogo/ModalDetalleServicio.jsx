import React from "react";
import { Modal, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const ModalDetalleServicio = ({ mostrarModal, setMostrarModal, servicio }) => {
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
            {servicio.calificaciones.map((calificacion) => (
              <div
                key={calificacion.id_calificacion}
                className="modal-calificacion-item"
              >
                <div className="mb-2">
                  {renderEstrellas(calificacion.puntuacion)}
                </div>

                <p className="mb-1">
                  {calificacion.comentario || "Sin comentario."}
                </p>

                <small className="text-muted">
                  —{" "}
                  {calificacion.Clientes
                    ? `${calificacion.Clientes.nombre} ${calificacion.Clientes.apellido}`
                    : `Cliente #${calificacion.id_cliente}`}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">
            Este servicio aún no tiene calificaciones.
          </p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalDetalleServicio;