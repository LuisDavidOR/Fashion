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

  // 🔴 VALIDACIÓN NOMBRE (solo letras y espacios)
  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nuevoEmpleado.nombre);

  // 🔴 VALIDACIÓN APELLIDO (solo letras y espacios)
  const apellidoValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nuevoEmpleado.apellido);

  // 🔴 VALIDACIÓN TELÉFONO (8 dígitos exactos)
  const telefonoValido = /^[0-9]{8}$/.test(nuevoEmpleado.telefono);

  // 🔴 VALIDACIÓN CORREO
  const correoValido = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|ni|es|mx|us)$/i.test(
    nuevoEmpleado.correo
  );

  const camposVacios =
    nuevoEmpleado.nombre.trim() === "" ||
    nuevoEmpleado.apellido.trim() === "" ||
    nuevoEmpleado.telefono.trim() === "" ||
    nuevoEmpleado.comision === "" ||
    nuevoEmpleado.correo.trim() === "";

  // 🔴 DETECTA ERRORES
  const hayErrores =
    !nombreValido ||
    !apellidoValido ||
    !telefonoValido ||
    !correoValido;

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
            {/* 🔴 NOMBRE */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoEmpleado.nombre}
                  onChange={(e) => {
                    const soloLetras = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
                    manejoCambioInput({
                      target: {
                        name: "nombre",
                        value: soloLetras,
                      },
                    });
                  }}
                  placeholder="Ingresa el nombre"

                  // 🔴 Borde rojo si contiene números
                  isInvalid={nuevoEmpleado.nombre && !nombreValido}
                />
                <Form.Control.Feedback type="invalid">
                  El nombre solo debe contener letras
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* 🔴 APELLIDO */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={nuevoEmpleado.apellido}
                  onChange={(e) => {
                    const soloLetras = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
                    manejoCambioInput({
                      target: {
                        name: "apellido",
                        value: soloLetras,
                      },
                    });
                  }}
                  placeholder="Ingresa el apellido"

                  // 🔴 Borde rojo si contiene números
                  isInvalid={nuevoEmpleado.apellido && !apellidoValido}
                />
                <Form.Control.Feedback type="invalid">
                  El apellido solo debe contener letras
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* 🔴 TELÉFONO */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={nuevoEmpleado.telefono}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 8);
                    manejoCambioInput({
                      target: {
                        name: "telefono",
                        value: soloNumeros,
                      },
                    });
                  }}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ingresa el teléfono de 8 dígitos"
                  isInvalid={nuevoEmpleado.telefono && !telefonoValido}
                />
                <Form.Control.Feedback type="invalid">
                  El teléfono debe tener exactamente 8 dígitos
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* 🔴 CORREO */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo *</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={nuevoEmpleado.correo}
                  onChange={manejoCambioInput}
                  placeholder="ejemplo@gmail.com"
                  isInvalid={nuevoEmpleado.correo && !correoValido}
                />
                <Form.Control.Feedback type="invalid">
                  Ingresa un correo válido (ej: ejemplo@gmail.com)
                </Form.Control.Feedback>
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
                  max="100"
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
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroEmpleado;