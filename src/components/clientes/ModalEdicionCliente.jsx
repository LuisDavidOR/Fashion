import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionCliente = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  clienteEditar,
  manejoCambioInputEdicion,
  actualizarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await actualizarCliente();
    setDeshabilitado(false);
  };

  // 🔴 VALIDACIÓN DE TELÉFONO
  // Solo permite exactamente 8 números
  const telefonoValido = /^[0-9]{8}$/.test(clienteEditar.telefono);

  // 🔴 VALIDACIÓN DE CORREO
  // Formato básico + dominios comunes
  const correoValido = /^[^\s@]+@[^\s@]+\.(com|net|org|edu)$/i.test(
    clienteEditar.correo
  );

  const camposVacios =
    clienteEditar.nombre.trim() === "" ||
    clienteEditar.apellido.trim() === "" ||
    clienteEditar.telefono.trim() === "" ||
    clienteEditar.correo.trim() === "";

  // 🔴 DETECTA SI HAY ERRORES
  const hayErrores = !telefonoValido || !correoValido;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={clienteEditar.nombre}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el nombre del cliente"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={clienteEditar.apellido}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el apellido del cliente"
            />
          </Form.Group>

          {/* 🔴 TELÉFONO CON VALIDACIÓN */}
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={clienteEditar.telefono}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el teléfono del cliente"

              // 🔴 Activa borde rojo si es inválido
              isInvalid={clienteEditar.telefono && !telefonoValido}
            />

            {/* 🔴 MENSAJE EN ROJO */}
            <Form.Control.Feedback type="invalid">
              El teléfono debe tener exactamente 8 dígitos
            </Form.Control.Feedback>
          </Form.Group>

          {/* 🔴 CORREO CON VALIDACIÓN */}
          <Form.Group className="mb-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={clienteEditar.correo}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el correo del cliente"

              // 🔴 Activa borde rojo si es inválido
              isInvalid={clienteEditar.correo && !correoValido}
            />

            {/* 🔴 MENSAJE EN ROJO */}
            <Form.Control.Feedback type="invalid">
              Ingresa un correo válido (ej: ejemplo@gmail.com)
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEdicion(false)}
          disabled={deshabilitado}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={handleActualizar}

          // 🔴 SE BLOQUEA SI:
          // - Hay campos vacíos
          // - Hay errores
          // - Está procesando
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionCliente;