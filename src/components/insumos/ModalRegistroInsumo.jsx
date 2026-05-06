import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroInsumo = ({
  mostrarModal,
  setMostrarModal,
  nuevoInsumo,
  manejoCambioInput,
  manejoCambioArchivo,
  agregarInsumo,
  limpiarInsumo,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await agregarInsumo();
    setDeshabilitado(false);
  };

  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(
    nuevoInsumo.nombre
  );

  const stockValido = /^[0-9]+$/.test(nuevoInsumo.stock);

  const contenidoTotalValido = /^[0-9]+(\.[0-9]+)?$/.test(
    nuevoInsumo.contenido_total
  );

  const costoProductoValido = /^[0-9]+(\.[0-9]+)?$/.test(
    nuevoInsumo.costo_producto
  );

  const camposVacios =
    nuevoInsumo.nombre.trim() === "" ||
    nuevoInsumo.costo_producto === "" ||
    nuevoInsumo.contenido_total === "" ||
    nuevoInsumo.unidad_medida.trim() === "";

  // 🔴 ERRORES
  const hayErrores =
  !nombreValido ||
  !stockValido ||
  !contenidoTotalValido ||
  !costoProductoValido;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarInsumo();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Insumo</Modal.Title>
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
                  value={nuevoInsumo.nombre}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Shampoo profesional"
                  isInvalid={nuevoInsumo.nombre && !nombreValido}
                />
                <Form.Control.Feedback type="invalid">
                  El nombre solo debe contener letras
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Costo del producto *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  name="costo_producto"
                  value={nuevoInsumo.costo_producto}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 350"
                  isInvalid={nuevoInsumo.costo_producto !== "" && !costoProductoValido}
                />
                <Form.Control.Feedback type="invalid">
                  El costo solo puede contener datos numéricos
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contenido total *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  name="contenido_total"
                  value={nuevoInsumo.contenido_total}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 10"
                  isInvalid={nuevoInsumo.contenido_total !== "" && !contenidoTotalValido}
                />
                <Form.Control.Feedback type="invalid">
                  El contenido total solo puede contener datos numéricos
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unidad de medida *</Form.Label>
                <Form.Select
                  name="unidad_medida"
                  value={nuevoInsumo.unidad_medida}
                  onChange={manejoCambioInput}
                >
                  <option value="">Seleccione...</option>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="oz">oz</option>
                  <option value="unidad">unidad</option>
                  <option value="litro">litro</option>
                  <option value="kg">kg</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stock *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  name="stock"
                  value={nuevoInsumo.stock}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 10"
                  isInvalid={nuevoInsumo.stock !== "" && !stockValido}
                />
                <Form.Control.Feedback type="invalid">
                  El stock solo puede contener datos numéricos
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Imagen del insumo</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  onChange={manejoCambioArchivo}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descripcion"
                  value={nuevoInsumo.descripcion}
                  onChange={manejoCambioInput}
                  placeholder="Descripción del insumo"
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
            limpiarInsumo();
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

export default ModalRegistroInsumo;