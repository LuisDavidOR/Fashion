import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionCategoria = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  categoriaEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarCategoria,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await actualizarCategoria();
    setDeshabilitado(false);
  };

  // 🔴 VALIDACIÓN NOMBRE
  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s&.,-]+$/.test(
    categoriaEditar.nombre
  );

  // 🔴 ERRORES
  const hayErrores = !nombreValido;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Categoría</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3 text-center">
            <Form.Label>Imagen actual</Form.Label>

            {categoriaEditar.url_imagen ? (
              <div className="mb-2">
                <img
                  src={categoriaEditar.url_imagen}
                  alt="Categoría actual"
                  style={{
                    width: "180px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "14px",
                  }}
                />
              </div>
            ) : (
              <p className="text-muted">Sin imagen</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nueva imagen</Form.Label>
            <Form.Control
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp"
              onChange={manejoCambioArchivoActualizar}
            />
            <Form.Text className="text-muted">
              Si seleccionas una nueva imagen, reemplazará la actual.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={categoriaEditar.nombre}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el nombre"
              isInvalid={categoriaEditar.nombre && !nombreValido}
            />
            <Form.Control.Feedback type="invalid">
              El nombre contiene caracteres no permitidos
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={categoriaEditar.descripcion}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa la descripción"
            />
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
          disabled={
            categoriaEditar.nombre.trim() === "" ||
            hayErrores ||
            deshabilitado
          }
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionCategoria;