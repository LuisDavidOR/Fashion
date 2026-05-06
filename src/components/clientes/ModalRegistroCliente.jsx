import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCliente = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
  limpiarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  // 🔴 VALIDACIÓN DE TELÉFONO
  // Expresión regular:
  // ^[0-9]{8}$ → solo números y exactamente 8 caracteres (ni más ni menos)
  const telefonoValido = /^[0-9]{8}$/.test(nuevoCliente.telefono);

  // 🔴 VALIDACIÓN DE CORREO
  // Verifica:
  // - Que tenga texto antes del @
  // - Que tenga dominio válido
  // - Que termine en extensiones comunes (.com, .net, .org, .edu)
  const correoValido = /^[^\s@]+@[^\s@]+\.(com|net|org|edu)$/i.test(
    nuevoCliente.correo
  );

  const camposVacios =
    nuevoCliente.nombre.trim() === "" ||
    nuevoCliente.apellido.trim() === "" ||
    nuevoCliente.telefono.trim() === "" ||
    nuevoCliente.correo.trim() === "";

  // 🔴 VARIABLE PARA DETECTAR SI EXISTEN ERRORES
  // Si alguna validación falla → hayErrores será true
  const hayErrores = !telefonoValido || !correoValido;

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

          {/* 🔴 INPUT TELÉFONO CON VALIDACIÓN VISUAL */}
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={nuevoCliente.telefono}
              onChange={manejoCambioInput}
              placeholder="Ingresa el teléfono del cliente"
              
              // 🔴 Si el usuario ya escribió algo y es inválido → borde rojo
              isInvalid={nuevoCliente.telefono && !telefonoValido}
            />

            {/* 🔴 MENSAJE EN ROJO */}
            <Form.Control.Feedback type="invalid">
              El teléfono debe tener exactamente 8 dígitos
            </Form.Control.Feedback>
          </Form.Group>

          {/* 🔴 INPUT CORREO CON VALIDACIÓN VISUAL */}
          <Form.Group className="mb-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={nuevoCliente.correo}
              onChange={manejoCambioInput}
              placeholder="Ingresa el correo del cliente"
              
              // 🔴 Si el correo es inválido → borde rojo
              isInvalid={nuevoCliente.correo && !correoValido}
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
          onClick={() => {
            limpiarCliente();
            setMostrarModal(false);
          }}
          disabled={deshabilitado}
        >
          Cancelar
        </Button>

        <Button
          style={{
            backgroundColor: "#7A564A",
            borderColor: "#7A564A",
            color: "#ffffff",
          }}
          onClick={handleRegistrar}

          // 🔴 SE DESHABILITA SI:
          // - Hay campos vacíos
          // - Hay errores de validación
          // - Está en proceso de guardado
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCliente;