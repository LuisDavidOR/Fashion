import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionEmpleado = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  empleadoEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoActualizar,
  actualizarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await actualizarEmpleado();
    setDeshabilitado(false);
  };

  // 🔴 VALIDACIÓN NOMBRE Y APELLIDO
  // Solo letras y espacios (no números ni caracteres raros)
  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(empleadoEditar.nombre);

  const apellidoValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(empleadoEditar.apellido);

  // 🔴 VALIDACIÓN TELÉFONO (8 dígitos exactos)
  const telefonoValido = /^[0-9]{8}$/.test(empleadoEditar.telefono);

  // 🔴 VALIDACIÓN CORREO
  const correoValido = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|ni|es|mx|us)$/i.test(
    empleadoEditar.correo
  );

  const camposVacios =
    empleadoEditar.nombre.trim() === "" ||
    empleadoEditar.apellido.trim() === "" ||
    empleadoEditar.telefono.trim() === "" ||
    empleadoEditar.comision === "" ||
    empleadoEditar.correo.trim() === "";

  // 🔴 ERRORES GENERALES
  const hayErrores =
    !nombreValido ||
    !apellidoValido ||
    !telefonoValido ||
    !correoValido;

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
        <Modal.Title>Editar Empleado</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={12}>
              <Form.Group className="mb-3 text-center">
                <Form.Label>Foto actual</Form.Label>

                {empleadoEditar.url_imagen ? (
                  <div className="mb-2">
                    <img
                      src={empleadoEditar.url_imagen}
                      alt="Empleado actual"
                      style={{
                        width: "115px",
                        height: "115px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-muted">Sin foto</p>
                )}
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nueva foto</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivoActualizar}
                />
                <Form.Text className="text-muted">
                  Si seleccionas una nueva foto, reemplazará la actual.
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
                  value={empleadoEditar.nombre || ""}
                  onChange={(e) => {
                    const soloLetras = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
                    manejoCambioInputEdicion({
                      target: {
                        name: "nombre",
                        value: soloLetras,
                      },
                    });
                  }}

                  // 🔴 Marca error si contiene números
                  isInvalid={empleadoEditar.nombre && !nombreValido}
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
                  value={empleadoEditar.apellido || ""}
                  onChange={(e) => {
                    const soloLetras = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
                    manejoCambioInputEdicion({
                      target: {
                        name: "apellido",
                        value: soloLetras,
                      },
                    });
                  }}

                  // 🔴 Marca error si contiene números
                  isInvalid={empleadoEditar.apellido && !apellidoValido}
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
                  value={empleadoEditar.telefono || ""}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 8);
                    manejoCambioInputEdicion({
                      target: {
                        name: "telefono",
                        value: soloNumeros,
                      },
                    });
                  }}
                  maxLength={8}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  isInvalid={empleadoEditar.telefono && !telefonoValido}
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
                  value={empleadoEditar.correo || ""}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={empleadoEditar.correo && !correoValido}
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
                  value={empleadoEditar.especialidad || ""}
                  onChange={manejoCambioInputEdicion}
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
                  value={empleadoEditar.comision || ""}
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

          // 🔴 BLOQUEO SI HAY ERRORES O CAMPOS VACÍOS
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionEmpleado;