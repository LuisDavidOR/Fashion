import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const ModalAccesoEmpleado = ({
  mostrarModalAcceso,
  setMostrarModalAcceso,
  empleadoAcceso,
  datosAcceso,
  setDatosAcceso,
  crearAccesoEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const contrasenaValida = datosAcceso.contrasena.length >= 6;
  const coinciden =
    datosAcceso.contrasena === datosAcceso.confirmarContrasena;

  const camposVacios =
    datosAcceso.contrasena.trim() === "" ||
    datosAcceso.confirmarContrasena.trim() === "";

  const hayErrores = !contrasenaValida || !coinciden;

  const handleCrearAcceso = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await crearAccesoEmpleado();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalAcceso}
      onHide={() => setMostrarModalAcceso(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Crear acceso al sistema</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="info" className="py-2">
          Se creará una cuenta de acceso para el empleado seleccionado.
        </Alert>

        <p className="mb-1">
          <strong>Empleado:</strong>{" "}
          {empleadoAcceso?.nombre} {empleadoAcceso?.apellido}
        </p>

        <p className="mb-3">
          <strong>Correo:</strong> {empleadoAcceso?.correo}
        </p>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña temporal *</Form.Label>

          <div className="position-relative">
            <Form.Control
              type={mostrarContrasena ? "text" : "password"}
              name="contrasena"
              value={datosAcceso.contrasena}
              onChange={(e) =>
                setDatosAcceso((prev) => ({
                  ...prev,
                  contrasena: e.target.value,
                }))
              }
              isInvalid={
                datosAcceso.contrasena !== "" && !contrasenaValida
              }
              placeholder="Mínimo 6 caracteres"
            />

            <button
              type="button"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
              tabIndex="-1"
            >
              <i
                className={
                  mostrarContrasena ? "bi bi-eye-slash" : "bi bi-eye"
                }
              ></i>
            </button>

            <Form.Control.Feedback type="invalid">
              La contraseña debe tener al menos 6 caracteres.
            </Form.Control.Feedback>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirmar contraseña *</Form.Label>

          <div className="position-relative">
            <Form.Control
              type={mostrarConfirmar ? "text" : "password"}
              name="confirmarContrasena"
              value={datosAcceso.confirmarContrasena}
              onChange={(e) =>
                setDatosAcceso((prev) => ({
                  ...prev,
                  confirmarContrasena: e.target.value,
                }))
              }
              isInvalid={
                datosAcceso.confirmarContrasena !== "" && !coinciden
              }
              placeholder="Repite la contraseña"
            />

            <button
              type="button"
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
              tabIndex="-1"
            >
              <i
                className={
                  mostrarConfirmar ? "bi bi-eye-slash" : "bi bi-eye"
                }
              ></i>
            </button>

            <Form.Control.Feedback type="invalid">
              Las contraseñas no coinciden.
            </Form.Control.Feedback>
          </div>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalAcceso(false)}
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
          onClick={handleCrearAcceso}
          disabled={camposVacios || hayErrores || deshabilitado}
        >
          {deshabilitado ? "Creando acceso..." : "Crear acceso"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAccesoEmpleado;