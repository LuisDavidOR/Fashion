import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalCalificacionServicio = ({
  mostrarModal,
  setMostrarModal,
  servicio,
  nuevaCalificacion,
  setNuevaCalificacion,
  guardarCalificacion,
  calificacionExistente,
  mensajeCalificacion
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleGuardar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await guardarCalificacion();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {calificacionExistente ? "Editar calificación" : "Calificar servicio"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h6 className="mb-3">{servicio?.nombre}</h6>

        {mensajeCalificacion && (
          <div className="alert alert-danger py-2 mb-3">
            {mensajeCalificacion}
          </div>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Puntuación</Form.Label>

          <div className="calificacion-estrellas-selector">
            {[1, 2, 3, 4, 5].map((estrella) => (
              <button
                key={estrella}
                type="button"
                className="btn-estrella-calificacion"
                onClick={() =>
                  setNuevaCalificacion((prev) => ({
                    ...prev,
                    puntuacion: estrella,
                  }))
                }
              >
                <i
                  className={
                    estrella <= Number(nuevaCalificacion.puntuacion)
                      ? "bi bi-star-fill"
                      : "bi bi-star"
                  }
                ></i>
              </button>
            ))}
          </div>

          <small className="text-muted d-block mt-2">
            {Number(nuevaCalificacion.puntuacion) === 5 && "Excelente"}
            {Number(nuevaCalificacion.puntuacion) === 4 && "Muy bueno"}
            {Number(nuevaCalificacion.puntuacion) === 3 && "Bueno"}
            {Number(nuevaCalificacion.puntuacion) === 2 && "Regular"}
            {Number(nuevaCalificacion.puntuacion) === 1 && "Malo"}
          </small>
        </Form.Group>

        <Form.Group>
          <Form.Label>Comentario</Form.Label>

          <Form.Control
            as="textarea"
            rows={4}
            maxLength={250}
            value={nuevaCalificacion.comentario}
            onChange={(e) =>
              setNuevaCalificacion((prev) => ({
                ...prev,
                comentario: e.target.value,
              }))
            }
            placeholder="Escribe tu opinión sobre este servicio..."
          />

          <div className="text-end mt-1">
            <small
              className={
                nuevaCalificacion.comentario.length >= 230
                  ? "text-danger"
                  : "text-muted"
              }
            >
              {nuevaCalificacion.comentario.length}/250 caracteres
            </small>
          </div>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModal(false)}
          disabled={deshabilitado}
        >
          Cancelar
        </Button>

        <Button
          style={{
            backgroundColor: "#7A564A",
            borderColor: "#7A564A",
          }}
          onClick={handleGuardar}
          disabled={deshabilitado}
        >
          {calificacionExistente ? "Actualizar calificación" : "Guardar calificación"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCalificacionServicio;