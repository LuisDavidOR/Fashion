import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEstadoInsumo = ({
  mostrarModalEstado,
  setMostrarModalEstado,
  insumo,
  cambiarEstadoInsumo,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const esActivo = insumo?.estado === "activo";
  const accion = esActivo ? "inactivar" : "activar";

  const handleCambiarEstado = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await cambiarEstadoInsumo();
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
          Confirmar {esActivo ? "Inactivación" : "Activación"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        ¿Estás seguro de que deseas {accion} el insumo{" "}
        <strong>{insumo?.nombre}</strong>?
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
          variant={esActivo ? "warning" : "success"}
          onClick={handleCambiarEstado}
          disabled={deshabilitado}
        >
          {esActivo ? "Inactivar" : "Activar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEstadoInsumo;