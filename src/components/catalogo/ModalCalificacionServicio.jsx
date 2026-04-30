import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalCalificacionServicio = ({
  mostrarModal,
  setMostrarModal,
  servicio,
  nuevaCalificacion,
  setNuevaCalificacion,
  guardarCalificacion,
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
        <Modal.Title>Calificar servicio</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h6 className="mb-3">{servicio?.nombre}</h6>

        <Form.Group className="mb-3">
          <Form.Label>Puntuación</Form.Label>
          <Form.Select
            value={nuevaCalificacion.puntuacion}
            onChange={(e) =>
              setNuevaCalificacion((prev) => ({
                ...prev,
                puntuacion: e.target.value,
              }))
            }
          >
            <option value="5">⭐⭐⭐⭐⭐ Excelente</option>
            <option value="4">⭐⭐⭐⭐ Muy bueno</option>
            <option value="3">⭐⭐⭐ Bueno</option>
            <option value="2">⭐⭐ Regular</option>
            <option value="1">⭐ Malo</option>
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Comentario</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={nuevaCalificacion.comentario}
            onChange={(e) =>
              setNuevaCalificacion((prev) => ({
                ...prev,
                comentario: e.target.value,
              }))
            }
            placeholder="Escribe tu opinión sobre este servicio..."
          />
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
          Guardar calificación
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCalificacionServicio;