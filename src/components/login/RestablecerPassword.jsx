import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/supabaseconfig";
import logo from "../../assets/logo.png";
import "../../App.css";

const RestablecerPassword = () => {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("danger");
  const [cargando, setCargando] = useState(false);
  const [validandoEnlace, setValidandoEnlace] = useState(true);
  const [enlaceValido, setEnlaceValido] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let temporizador = null;

    const verificarRecuperacion = async () => {
      const hash = window.location.hash;

      if (
        hash.includes("error=") ||
        hash.includes("error_code=otp_expired")
      ) {
        setMensaje("El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.");
        setTipoMensaje("danger");
        setEnlaceValido(false);
        setValidandoEnlace(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && hash.includes("type=recovery")) {
        setEnlaceValido(true);
        setValidandoEnlace(false);
        return;
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "PASSWORD_RECOVERY" && session) {
            setEnlaceValido(true);
            setValidandoEnlace(false);
          }
        }
      );

      temporizador = setTimeout(() => {
        setMensaje("Para cambiar tu contraseña debes abrir el enlace enviado a tu correo.");
        setTipoMensaje("warning");
        setEnlaceValido(false);
        setValidandoEnlace(false);
      }, 1800);

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    };

    verificarRecuperacion();

    return () => {
      if (temporizador) clearTimeout(temporizador);
    };
  }, []);

  const validarFormulario = () => {
    if (!nuevaContrasena.trim() || !confirmarContrasena.trim()) {
      setMensaje("Todos los campos son obligatorios.");
      setTipoMensaje("danger");
      return false;
    }

    if (nuevaContrasena.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      setTipoMensaje("danger");
      return false;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje("Las contraseñas no coinciden.");
      setTipoMensaje("danger");
      return false;
    }

    return true;
  };

  const actualizarContrasena = async () => {
    if (cargando) return;

    if (!enlaceValido) {
      setMensaje("No puedes cambiar la contraseña desde esta ruta directamente. Solicita un enlace de recuperación.");
      setTipoMensaje("warning");
      return;
    }

    if (!validarFormulario()) return;

    try {
      setCargando(true);
      setMensaje("");

      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena,
      });

      if (error) {
        setMensaje("El enlace no es válido o ha expirado. Solicita uno nuevo.");
        setTipoMensaje("danger");
        return;
      }

      setMensaje("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      setTipoMensaje("success");

      setNuevaContrasena("");
      setConfirmarContrasena("");

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login", {
          state: {
            mensajeExito: "Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.",
          },
        });
      }, 2500);
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
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

  const enfocarInput = (e) => {
    e.target.style.borderColor = "#b88a78";
    e.target.style.boxShadow = "0 0 0 4px rgba(184,138,120,0.15)";
  };

  const desenfocarInput = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.25)";
    e.target.style.boxShadow = "none";
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
              <h1 style={estilos.titulo}>Nueva contraseña</h1>

              <p style={estilos.subtitulo}>
                Crea una nueva contraseña segura para recuperar el acceso a Fashion.
              </p>

              {mensaje && (
                <Alert variant={tipoMensaje} className="py-2 px-3 mb-3" style={{ fontSize: "0.9rem" }}>
                  {mensaje}
                </Alert>
              )}

              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  actualizarContrasena();
                }}
              >
                <Form.Group className="mb-3">
                  <Form.Label style={estilos.label}>Nueva contraseña</Form.Label>

                  <div style={estilos.inputContenedor}>
                    <Form.Control
                      type={mostrarNueva ? "text" : "password"}
                      placeholder="Ingrese nueva contraseña"
                      style={estilos.input}
                      value={nuevaContrasena}
                      onChange={(e) => setNuevaContrasena(e.target.value)}
                      onFocus={enfocarInput}
                      onBlur={desenfocarInput}
                    />

                    <button
                      type="button"
                      style={estilos.ojoBoton}
                      onClick={() => setMostrarNueva(!mostrarNueva)}
                      tabIndex="-1"
                    >
                      <i className={mostrarNueva ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                    </button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={estilos.label}>Confirmar contraseña</Form.Label>

                  <div style={estilos.inputContenedor}>
                    <Form.Control
                      type={mostrarConfirmar ? "text" : "password"}
                      placeholder="Confirme nueva contraseña"
                      style={estilos.input}
                      value={confirmarContrasena}
                      onChange={(e) => setConfirmarContrasena(e.target.value)}
                      onFocus={enfocarInput}
                      onBlur={desenfocarInput}
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

                <Button
                  style={estilos.boton}
                  type="submit"
                  className="w-100"
                  disabled={cargando || validandoEnlace || !enlaceValido}
                >
                  {validandoEnlace ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Validando enlace...
                    </>
                  ) : cargando ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Actualizar contraseña
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

export default RestablecerPassword;