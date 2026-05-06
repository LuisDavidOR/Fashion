import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionInsumo = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  insumoEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarInsumo,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await actualizarInsumo();
    setDeshabilitado(false);
  };

  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(
    insumoEditar.nombre
  );

  const stockValido = /^[0-9]+$/.test(insumoEditar.stock);

  const contenidoTotalValido = /^[0-9]+(\.[0-9]+)?$/.test(
    insumoEditar.contenido_total
  );

  const costoProductoValido = /^[0-9]+(\.[0-9]+)?$/.test(
    insumoEditar.costo_producto
  );

  const camposVacios =
    insumoEditar.nombre.trim() === "" ||
    insumoEditar.costo_producto === "" ||
    insumoEditar.contenido_total === "" ||
    insumoEditar.unidad_medida.trim() === "";

  // 🔴 ERRORES
  const hayErrores =
  !nombreValido ||
  !stockValido ||
  !contenidoTotalValido ||
  !costoProductoValido;

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
        <Modal.Title>Editar Insumo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12}>
              <Form.Group className="mb-3 text-center">
                <Form.Label>Imagen actual</Form.Label>

                {insumoEditar.url_imagen ? (
                  <div className="mb-2">
                    <img
                      src={insumoEditar.url_imagen}
                      alt="Insumo actual"
                      style={{
                        width: "160px",
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
                  accept="image/*,.jpg,.jpeg,.png,.webp"
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
                  value={insumoEditar.nombre || ""}
                  onChange={manejoCambioInputEdicion}

                  // 🔴 ERROR SI TIENE NÚMEROS
                  isInvalid={insumoEditar.nombre && !nombreValido}
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
                  value={insumoEditar.costo_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={insumoEditar.costo_producto !== "" && !costoProductoValido}
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
                  value={insumoEditar.contenido_total || ""}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={insumoEditar.contenido_total !== "" && !contenidoTotalValido}
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
                  value={insumoEditar.unidad_medida || ""}
                  onChange={manejoCambioInputEdicion}
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
                  value={insumoEditar.stock || ""}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={insumoEditar.stock !== "" && !stockValido}
                />
                <Form.Control.Feedback type="invalid">
                  El stock solo puede contener datos numéricos
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descripcion"
                  value={insumoEditar.descripcion || ""}
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

          // 🔴 BLOQUEO TOTAL
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionInsumo;