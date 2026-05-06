import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionServicio = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  servicioEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarServicio,
  categorias,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await actualizarServicio();
    setDeshabilitado(false);
  };

  const camposVacios =
    servicioEditar.nombre.trim() === "" ||
    servicioEditar.precio === "" ||
    servicioEditar.duracion === "" ||
    servicioEditar.id_categoria === "";

  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s&.,#-]+$/.test(
    servicioEditar.nombre
  );

  const precioValido = /^[0-9]+(\.[0-9]+)?$/.test(servicioEditar.precio);

  const duracionValida = /^[0-9]+$/.test(servicioEditar.duracion);

  // 🔴 ERRORES SOLO DE LO PEDIDO
  const hayErrores = !nombreValido || !duracionValida || !precioValido;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Servicio</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3 text-center">
                <Form.Label>Imagen actual</Form.Label>

                {servicioEditar.url_imagen ? (
                  <div className="mb-2">
                    <img
                      src={servicioEditar.url_imagen}
                      alt="Servicio actual"
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
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nueva imagen</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivoActualizar}
                />
                <Form.Text className="text-muted">
                  Si seleccionas una nueva imagen, reemplazará la actual.
                </Form.Text>
              </Form.Group>
            </Col>

            {/* 🔴 NOMBRE */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={servicioEditar.nombre || ""}
                  onChange={manejoCambioInputEdicion}

                  isInvalid={
                    servicioEditar.nombre && !nombreValido
                  }
                />
                <Form.Control.Feedback type="invalid">
                  El nombre contiene caracteres no permitidos
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  name="id_categoria"
                  value={servicioEditar.id_categoria || ""}
                  onChange={manejoCambioInputEdicion}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  min="0"
                  name="precio"
                  value={servicioEditar.precio || ""}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={servicioEditar.precio !== "" && !precioValido}
                />
                <Form.Control.Feedback type="invalid">
                  El precio solo puede contener números
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Duración *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  name="duracion"
                  value={servicioEditar.duracion || ""}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={servicioEditar.duracion !== "" && !duracionValida}
                />
                <Form.Control.Feedback type="invalid">
                  La duración solo puede contener números enteros
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* 🔴 DESCRIPCIÓN */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descripcion"
                  value={servicioEditar.descripcion || ""}
                  onChange={manejoCambioInputEdicion}
                />
              </Form.Group>
            </Col>
          </Row>
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

          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionServicio;