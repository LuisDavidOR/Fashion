import React, {useState} from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCliente = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
  limpiarCliente
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarCliente();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoCliente.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre del cliente"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoCliente.apellido}
              onChange={manejoCambioInput}
              placeholder="Ingresa el apellido del cliente"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={nuevoCliente.telefono}
              onChange={manejoCambioInput}
              placeholder="Ingresa el número de teléfono (8 dígitos)"
              maxLength={8}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={nuevoCliente.correo}
              onChange={manejoCambioInput}
              placeholder="Ingresa el correo (ej: usuario@gmail.com)"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            limpiarCliente();
            setMostrarModal(false);
          }}
        >
          Cancelar
        </Button>
        <Button
        style={{
            backgroundColor: "#7A564A",
            borderColor: "#7A564A",
            color: "#ffffff"
          }}
          onClick={handleRegistrar}
          disabled={
            nuevoCliente.nombre.trim() === "" ||
            nuevoCliente.apellido.trim() === "" ||
            //!/^[0-9]{8}$/.test(nuevoCliente.telefono) ||
            //!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCliente.correo) ||
            deshabilitado
          }
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCliente;