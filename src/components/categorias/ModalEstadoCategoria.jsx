import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEstadoCategoria = ({
  mostrarModalEstado,
  setMostrarModalEstado,
  categoria,
  cambiarEstadoCategoria,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const esActiva = categoria?.estado === "activo";
  const accion = esActiva ? "inactivar" : "activar";

  const handleCambiarEstado = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await cambiarEstadoCategoria();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEstado}
      onHide={() => setMostrarModalEstado(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Confirmar {esActiva ? "Inactivación" : "Activación"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        ¿Estás seguro de que deseas {accion} la categoría{" "}
        <strong>{categoria?.nombre}</strong>?
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEstado(false)}
          disabled={deshabilitado}
        >
          Cancelar
        </Button>

        <Button
          variant={esActiva ? "warning" : "success"}
          onClick={handleCambiarEstado}
          disabled={deshabilitado}
        >
          {esActiva ? "Inactivar" : "Activar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEstadoCategoria;