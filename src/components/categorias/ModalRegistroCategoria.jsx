import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCategoria = ({
  mostrarModal,
  setMostrarModal,
  nuevaCategoria,
  manejoCambioInput,
  manejoCambioArchivo,
  agregarCategoria,
  limpiarCategoria,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await agregarCategoria();
    setDeshabilitado(false);
  };

  // 🔴 VALIDACIÓN NOMBRE (solo letras)
  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s&.,-]+$/.test(
    nuevaCategoria.nombre
  );

  // 🔴 CAMPOS VACÍOS 
  const camposVacios =
    nuevaCategoria.nombre.trim() === "";

  // 🔴 ERRORES
  const hayErrores = !nombreValido;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarCategoria();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Categoría</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevaCategoria.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre de categoría"
              isInvalid={nuevaCategoria.nombre && !nombreValido}
            />
            <Form.Control.Feedback type="invalid">
              El nombre contiene caracteres no permitidos
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen de categoría</Form.Label>
            <Form.Control
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              onChange={manejoCambioArchivo}
            />
            <Form.Text className="text-muted">
              Se recomienda una imagen horizontal o cuadrada.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={nuevaCategoria.descripcion}
              onChange={manejoCambioInput}
              placeholder="Ingresa la descripción"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            limpiarCategoria();
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
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCategoria;