import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";

const FormularioLogin = ({ usuario, contrasena, error, setUsuario, setContrasena, iniciarSesion }) => {
  // Estado para controlar la visibilidad de la contraseña
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Estilos personalizados para imitar Figma
  const estilos = {
    card: {
      border: "none",
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "transparent",
    },
    titulo: {
      fontFamily: "'Playfair Display', serif", // Asegúrate de tener una fuente Serif o similar
      fontSize: "2.5rem",
      fontWeight: "500",
      color: "#000",
      marginBottom: "0.5rem",
      textAlign: "center", // Centrado solicitado
    },
    subtitulo: {
      color: "#666",
      fontSize: "1rem",
      marginBottom: "2.5rem",
      textAlign: "center", // Centrado solicitado
    },
    label: {
      fontSize: "0.9rem",
      color: "#333",
      marginBottom: "5px",
    },
    input: {
      border: "none",
      borderBottom: "1px solid #ccc",
      borderRadius: "0",
      padding: "10px 0",
      paddingRight: "40px", // Espacio para que el texto de la contraseña no choque con el ojo
      boxShadow: "none",
      backgroundColor: "transparent",
      fontSize: "1rem",
      width: "100%"
    },
    inputContenedor: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    },
    ojoBoton: {
      position: "absolute",
      right: "0",
      background: "none",
      border: "none",
      color: "#666",
      cursor: "pointer",
      padding: "10px 5px",
      fontSize: "1.1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "none"
    },
    boton: {
      backgroundColor: "#555",
      border: "none",
      borderRadius: "30px", // Botón muy redondeado como en la imagen
      padding: "12px",
      fontSize: "1.1rem",
      marginTop: "2rem",
      fontWeight: "400"
    }
  };

  return (
    <Card style={estilos.card} className="p-0">
      <Card.Body className="p-0">
        <h1 style={estilos.titulo}>Bienvenido</h1>
        <p style={estilos.subtitulo}>Accede a tu cuenta para agendar tu próxima cita.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-4" controlId="usuario">
            <Form.Label style={estilos.label}>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="ejemplo@fashion.com"
              style={estilos.input}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="contrasena">
            <Form.Label style={estilos.label}>Contraseña</Form.Label>
            <div style={estilos.inputContenedor}>
              <Form.Control
                type={mostrarContrasena ? "text" : "password"}
                placeholder=".........."
                style={estilos.input}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
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
          >
            Iniciar Sesión
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioLogin;