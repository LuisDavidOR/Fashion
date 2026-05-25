import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";

const FormularioLogin = ({
  usuario,
  contrasena,
  error,
  exito,
  setUsuario,
  setContrasena,
  iniciarSesion,
  irRegistro,
  ingresarComoInvitado,
  cargandoLogin
}) => {
  // Estado para controlar la visibilidad de la contraseña
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estilos personalizados
  const estilos = {
    card: {
      border: "none",
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "transparent",
    },
    titulo: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "2.2rem",
      fontWeight: "600",
      color: "#000",
      marginBottom: "0.5rem",
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
      fontSize: "0.9rem",
      color: "#333",
      marginBottom: "5px",
      fontFamily: "'Poppins', sans-serif",
    },
    input: {
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "999px", // forma cápsula
        padding: "12px 18px",
        paddingRight: "50px",
        boxShadow: "none",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "#4d4d4d",
        fontSize: "0.95rem",
        fontFamily: "'Poppins', sans-serif",
        width: "100%",
        transition: "all 0.25s ease",
      },
    inputContenedor: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    },
    inputFocus: {
      borderColor: "#b88a78",
      boxShadow: "0 0 0 4px rgba(184, 138, 120, 0.15)",
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
      padding: "10px",
      fontSize: "1rem",
      fontFamily: "'Poppins', sans-serif",
      marginTop: "0.8rem",
      fontWeight: "400"
    }
  };

  return (
    <Card style={estilos.card} className="p-0">
      <Card.Body className="p-0">
        <h1 style={estilos.titulo}>Bienvenido</h1>
        <p style={estilos.subtitulo}>Tu experiencia de belleza comienza aquí.</p>

        {error && (
          <Alert variant="danger" className="py-2 px-3 mb-3" style={{ fontSize: "0.9rem" }}>
            {error}
          </Alert>
        )}

        {exito && (
          <Alert
            variant="success"
            className="py-2 px-3 mb-3"
            style={{ fontSize: "0.9rem" }}
          >
            {exito}
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-3" controlId="usuario">
            <Form.Label style={estilos.label}>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo electrónico"
              style={estilos.input}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onFocus={(e) => {
                  e.target.style.borderColor = "#b88a78";
                  e.target.style.boxShadow =
                    "0 0 0 4px rgba(184,138,120,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    "rgba(255,255,255,0.25)";
                  e.target.style.boxShadow = "none";
                }}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="contrasena">
            <Form.Label style={estilos.label}>Contraseña</Form.Label>
            <div style={estilos.inputContenedor}>
              <Form.Control
                type={mostrarContrasena ? "text" : "password"}
                placeholder="**************"
                style={estilos.input}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#b88a78";
                  e.target.style.boxShadow =
                    "0 0 0 4px rgba(184,138,120,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    "rgba(255,255,255,0.25)";
                  e.target.style.boxShadow = "none";
                }}
                required
              />
              <button
                type="button"
                style={estilos.ojoBoton}
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                tabIndex="-1" // Evita que se enfoque al usar la tecla TAB para navegar
              >
                <i className={mostrarContrasena ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>
          </Form.Group>

          <Button
            style={estilos.boton}
            className="w-100"
            onClick={iniciarSesion}
            disabled={cargandoLogin}
          >
            {cargandoLogin ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
          
          <div className="text-center mt-3">
            <p className="mb-1" style={{ fontSize: "0.95rem" }}>
              ¿No tienes cuenta?{" "}
              <span
                onClick={irRegistro}
                style={{
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Regístrate
              </span>
            </p>

            <p
              onClick={ingresarComoInvitado}
              style={{
                color: "#3b82f6",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.95rem",
                marginBottom: 0,
              }}
            >
              Ingresar como invitado
            </p>
          </div>

        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioLogin;