import React, { useState } from "react";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";

const FormularioRegistro = ({
  datosRegistro,
  error,
  exito,
  cargandoRegistro,
  manejarCambio,
  registrarCliente,
  irLogin,
}) => {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const estilos = {
    card: {
      border: "none",
      width: "100%",
      backgroundColor: "transparent",
    },
    titulo: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "2rem",
      fontWeight: "600",
      color: "#000",
      marginBottom: "0.4rem",
      textAlign: "center",
    },
    subtitulo: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: "400",
      color: "#666",
      fontSize: "0.9rem",
      marginBottom: "1rem",
      textAlign: "center",
    },
    label: {
      fontSize: "0.85rem",
      color: "#333",
      marginBottom: "5px",
      fontFamily: "'Poppins', sans-serif",
    },
    input: {
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: "999px",
      padding: "11px 16px",
      paddingRight: "45px",
      boxShadow: "none",
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      color: "#4d4d4d",
      fontSize: "0.9rem",
      fontFamily: "'Poppins', sans-serif",
      width: "100%",
      transition: "all 0.25s ease",
    },
    inputContenedor: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    ojoBoton: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: "#666",
      cursor: "pointer",
      padding: "0",
      fontSize: "1.1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "none",
      zIndex: 2,
    },
    boton: {
      backgroundColor: "#555",
      border: "none",
      borderRadius: "30px",
      padding: "10px 34px",
      fontSize: "1rem",
      fontFamily: "'Poppins', sans-serif",
      marginTop: "0.5rem",
      fontWeight: "400",
      minWidth: "180px",
    },
  };

  const aplicarFocus = (e) => {
    e.target.style.borderColor = "#b88a78";
    e.target.style.boxShadow = "0 0 0 4px rgba(184,138,120,0.15)";
  };

  const quitarFocus = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.25)";
    e.target.style.boxShadow = "none";
  };

  return (
    <Card style={estilos.card} className="p-0">
      <Card.Body className="p-0">
        <h1 style={estilos.titulo}>Crear cuenta</h1>

        <p style={estilos.subtitulo}>
          Regístrate para agendar citas y calificar servicios.
        </p>

        {error && (
          <Alert variant="danger" className="py-2 px-3 mb-3" style={{ fontSize: "0.9rem" }}>
            {error}
          </Alert>
        )}

        {exito && (
          <Alert variant="success" className="py-2 px-3 mb-3" style={{ fontSize: "0.9rem" }}>
            {exito}
          </Alert>
        )}

        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={estilos.label}>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={datosRegistro.nombre}
                  onChange={manejarCambio}
                  onFocus={aplicarFocus}
                  onBlur={quitarFocus}
                  placeholder="Nombre"
                  style={estilos.input}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={estilos.label}>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={datosRegistro.apellido}
                  onChange={manejarCambio}
                  onFocus={aplicarFocus}
                  onBlur={quitarFocus}
                  placeholder="Apellido"
                  style={estilos.input}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={estilos.label}>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={datosRegistro.telefono}
                  onChange={manejarCambio}
                  onFocus={aplicarFocus}
                  onBlur={quitarFocus}
                  placeholder="8 dígitos"
                  style={estilos.input}
                  maxLength={8}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={estilos.label}>Correo *</Form.Label>
                <Form.Control
                  type="email"
                  name="correo"
                  value={datosRegistro.correo}
                  onChange={manejarCambio}
                  onFocus={aplicarFocus}
                  onBlur={quitarFocus}
                  placeholder="ejemplo@gmail.com"
                  style={estilos.input}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={estilos.label}>Contraseña *</Form.Label>

                <div style={estilos.inputContenedor}>
                  <Form.Control
                    type={mostrarContrasena ? "text" : "password"}
                    name="contrasena"
                    value={datosRegistro.contrasena}
                    onChange={manejarCambio}
                    onFocus={aplicarFocus}
                    onBlur={quitarFocus}
                    placeholder="Contraseña"
                    style={estilos.input}
                  />

                  <button
                    type="button"
                    style={estilos.ojoBoton}
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    tabIndex="-1"
                  >
                    <i className={mostrarContrasena ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={estilos.label}>Confirmar *</Form.Label>

                <div style={estilos.inputContenedor}>
                  <Form.Control
                    type={mostrarConfirmar ? "text" : "password"}
                    name="confirmarContrasena"
                    value={datosRegistro.confirmarContrasena}
                    onChange={manejarCambio}
                    onFocus={aplicarFocus}
                    onBlur={quitarFocus}
                    placeholder="Confirmar"
                    style={estilos.input}
                  />

                  <button
                    type="button"
                    style={estilos.ojoBoton}
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    tabIndex="-1"
                  >
                    <i className={mostrarConfirmar ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-center">
            <Button
              style={estilos.boton}
              onClick={registrarCliente}
              disabled={cargandoRegistro}
            >
              {cargandoRegistro ? "Registrando..." : "Registrarme"}
            </Button>
          </div>

          <div className="text-center mt-3">
            <p className="mb-0" style={{ fontSize: "0.95rem" }}>
              ¿Ya tienes cuenta?{" "}
              <span
                onClick={irLogin}
                style={{
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Inicia sesión
              </span>
            </p>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioRegistro;