import React, { useState } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";
import logo from "../../assets/logo.png";
import "../../App.css";

const RecuperarCredenciales = () => {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const validarCorreo = () => {
    if (!correo.trim()) {
      setMensaje("El correo electrónico es obligatorio.");
      setTipoMensaje("danger");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setMensaje("Ingrese un correo electrónico válido.");
      setTipoMensaje("danger");
      return false;
    }

    return true;
  };

  const enviarRecuperacion = async () => {
    if (cargando) return;
    if (!validarCorreo()) return;

    try {
      setCargando(true);
      setMensaje("");

      const correoLimpio = correo.trim().toLowerCase();

      const { data: usuarioDB, error: errorUsuario } = await supabase
        .from("Usuarios")
        .select("id_usuario, correo, estado")
        .eq("correo", correoLimpio)
        .maybeSingle();

      if (errorUsuario) {
        setMensaje("No se pudo validar el correo. Intente nuevamente.");
        setTipoMensaje("danger");
        return;
      }

      if (!usuarioDB) {
        setMensaje("El correo ingresado no está registrado en el sistema.");
        setTipoMensaje("danger");
        return;
      }

      if (usuarioDB.estado?.toLowerCase().trim() !== "activo") {
        setMensaje("Este usuario se encuentra inactivo. Contacte al administrador.");
        setTipoMensaje("danger");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(correoLimpio, {
        redirectTo: `${window.location.origin}/restablecer-password`,
      });

      if (error) {
        if (error.status === 429) {
          setMensaje("Has solicitado muchos enlaces. Espera unos minutos antes de intentarlo nuevamente.");
        } else {
          setMensaje("No se pudo enviar el enlace de recuperación.");
        }

        setTipoMensaje("danger");
        return;
      }

      setMensaje("Se envió un enlace de recuperación a tu correo electrónico.");
      setTipoMensaje("success");
      setCorreo("");
    } catch (error) {
      console.error("Error al recuperar credenciales:", error);
      setMensaje("Ocurrió un error inesperado.");
      setTipoMensaje("danger");
    } finally {
      setCargando(false);
    }
  };

  const estilos = {
    contenedor: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      minHeight: "100vh",
      paddingTop: "70px",
      paddingBottom: "30px",
      paddingLeft: "20px",
      paddingRight: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      background: "linear-gradient(135deg, #d8b4a0, #ab9e99, #f1d4cb)",
      overflow: "auto",
    },
    caja: {
      width: "100%",
      maxWidth: "420px",
      minHeight: "auto",
      background: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(15px)",
      WebkitBackdropFilter: "blur(15px)",
      border: "1px solid rgba(255,255,255,0.3)",
      padding: "clamp(18px, 4vw, 24px)",
      position: "relative",
      zIndex: 2,
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      borderRadius: "20px",
      overflow: "hidden",
    },
    avatar: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
    },
    logo: {
      width: "clamp(60px, 16vw, 78px)",
      height: "clamp(60px, 16vw, 78px)",
      objectFit: "contain",
    },
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
      borderRadius: "999px",
      padding: "12px 18px",
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
    boton: {
      backgroundColor: "#555",
      border: "none",
      borderRadius: "30px",
      padding: "10px",
      fontSize: "1rem",
      fontFamily: "'Poppins', sans-serif",
      marginTop: "0.8rem",
      fontWeight: "400",
    },
    enlace: {
      color: "#3b82f6",
      cursor: "pointer",
      fontWeight: "500",
      fontSize: "0.95rem",
      marginBottom: 0,
      textAlign: "center",
    },
  };

  return (
    <div style={estilos.contenedor} className="fondo-login">
      <div className="fondo-iconos">
        <i className="bi bi-stars decoracion decoracion1"></i>
        <i className="bi bi-scissors decoracion decoracion2"></i>
        <i className="bi bi-heart-fill decoracion decoracion3"></i>
        <i className="bi bi-flower1 decoracion decoracion4"></i>
        <i className="bi bi-brush decoracion decoracion5"></i>
        <i className="bi bi-droplet-fill decoracion decoracion6"></i>
        <i className="bi bi-stars decoracion decoracion7"></i>
        <i className="bi bi-scissors decoracion decoracion8"></i>
        <i className="bi bi-heart decoracion decoracion9"></i>
        <i className="bi bi-flower1 decoracion decoracion10"></i>
        <i className="bi bi-brush decoracion decoracion11"></i>
        <i className="bi bi-stars decoracion decoracion12"></i>
      </div>

      <div style={estilos.caja}>
        <div style={estilos.avatar}>
          <img src={logo} alt="Logo FS" style={estilos.logo} />
        </div>

        <div style={{ marginTop: "72px" }}>
          <Card style={estilos.card} className="p-0">
            <Card.Body className="p-0">
              <h1 style={estilos.titulo}>Recuperar acceso</h1>

              <p style={estilos.subtitulo}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {mensaje && (
                <Alert variant={tipoMensaje} className="py-2 px-3 mb-3" style={{ fontSize: "0.9rem" }}>
                  {mensaje}
                </Alert>
              )}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label style={estilos.label}>Correo electrónico</Form.Label>

                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    style={estilos.input}
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#b88a78";
                      e.target.style.boxShadow = "0 0 0 4px rgba(184,138,120,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.25)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </Form.Group>

                <Button
                  style={estilos.boton}
                  className="w-100"
                  onClick={enviarRecuperacion}
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope-check me-2"></i>
                      Enviar enlace
                    </>
                  )}
                </Button>

                <div className="text-center mt-3">
                  <p onClick={() => navigate("/login")} style={estilos.enlace}>
                    Volver al inicio de sesión
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecuperarCredenciales;