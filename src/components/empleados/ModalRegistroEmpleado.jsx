import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroEmpleado = ({
  mostrarModal,
  setMostrarModal,
  nuevoEmpleado,
  manejoCambioInput,
  manejoCambioArchivo,
  agregarEmpleado,
  limpiarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await agregarEmpleado();
    setDeshabilitado(false);
  };

  const camposVacios =
    nuevoEmpleado.nombre.trim() === "" ||
    nuevoEmpleado.apellido.trim() === "" ||
    nuevoEmpleado.telefono.trim() === "" ||
    nuevoEmpleado.comision === "" ||
    nuevoEmpleado.correo.trim() === "";

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarEmpleado();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Empleado</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoEmpleado.nombre}
                  onChange={manejoCambioInput}
                  placeholder="Ingresa el nombre"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={nuevoEmpleado.apellido}
                  onChange={manejoCambioInput}
                  placeholder="Ingresa el apellido"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={nuevoEmpleado.telefono}
                  onChange={manejoCambioInput}
                  placeholder="Ingresa el teléfono de 8 dígitos"
                  maxLength={8}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo *</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={nuevoEmpleado.correo}
                  onChange={manejoCambioInput}
                  placeholder="ejemplo@gmail.com"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Especialidad</Form.Label>
                <Form.Control
                  type="text"
                  name="especialidad"
                  value={nuevoEmpleado.especialidad}
                  onChange={manejoCambioInput}
                  placeholder="Ej: Barbería, Uñas, Maquillaje"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Comisión *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="comision"
                  value={nuevoEmpleado.comision}
                  onChange={manejoCambioInput}
                  placeholder="Ej: 10"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Foto del empleado</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivo}
                />
                <Form.Text className="text-muted">
                  Puedes subir una foto del empleado.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            limpiarEmpleado();
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
          disabled={camposVacios || deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroEmpleado;