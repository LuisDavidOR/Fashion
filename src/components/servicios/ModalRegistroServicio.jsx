import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroServicio = ({
  mostrarModal,
  setMostrarModal,
  nuevoServicio,
  manejoCambioInput,
  manejoCambioArchivo,
  agregarServicio,
  limpiarServicio,
  categorias,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await agregarServicio();
    setDeshabilitado(false);
  };


  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s&.,#-]+$/.test(
    nuevoServicio.nombre
  );

  const precioValido = /^[0-9]+(\.[0-9]+)?$/.test(nuevoServicio.precio);

  const duracionValida = /^[0-9]+$/.test(nuevoServicio.duracion);

  const camposVacios =
    nuevoServicio.nombre.trim() === "" ||
    nuevoServicio.precio === "" ||
    nuevoServicio.duracion === "" ||
    nuevoServicio.id_categoria === "";

  // 🔴 ERRORES SOLO DE LO PEDIDO
  const hayErrores = !nombreValido || !duracionValida || !precioValido;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarServicio();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Servicio</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            {/* 🔴 NOMBRE */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoServicio.nombre}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Corte de cabello"

                  isInvalid={nuevoServicio.nombre && !nombreValido}
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
                  value={nuevoServicio.id_categoria}
                  onChange={manejoCambioInput}
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
                  name="precio"
                  value={nuevoServicio.precio}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 250"
                  isInvalid={nuevoServicio.precio !== "" && !precioValido}
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
                  value={nuevoServicio.duracion}
                  onChange={manejoCambioInput}
                  placeholder="Duración en minutos"
                  isInvalid={nuevoServicio.duracion !== "" && !duracionValida}
                />
                <Form.Control.Feedback type="invalid">
                  La duración solo puede contener números enteros
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen del servicio</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivo}
                />
                <Form.Text className="text-muted">
                  Se recomienda una imagen horizontal o cuadrada.
                </Form.Text>
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
                  value={nuevoServicio.descripcion}
                  onChange={manejoCambioInput}
                  placeholder="Describe brevemente el servicio"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            limpiarServicio();
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

export default ModalRegistroServicio;