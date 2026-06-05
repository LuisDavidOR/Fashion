import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { supabase } from "../database/supabaseconfig";
import logo from "../assets/logo.png";
import "../App.css";

const Login = () => {

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const navegar = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setError(null);
    setExito(null);

    const mensaje = sessionStorage.getItem("mensaje-login");

    if (location.state?.mensajeExito) {
      setExito(location.state.mensajeExito);
      sessionStorage.removeItem("mensaje-login");
      window.history.replaceState({}, document.title);
      return;
    }

    if (mensaje) {
      setError(mensaje);
      sessionStorage.removeItem("mensaje-login");
    }
  }, [location.state]);

  const iniciarSesion = async () => {
    if (cargandoLogin) return;

    try {
      setError(null);
      setCargandoLogin(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario.trim(),
        password: contrasena,
      });

      if (error) {
        const mensajeError = error.message?.toLowerCase() || "";

        if (error.status === 429) {
          setError("Demasiados intentos. Espera unos minutos antes de volver a intentar.");
        } else if (mensajeError.includes("email not confirmed")) {
          setError("Debes confirmar tu correo antes de iniciar sesión.");
        } else {
          setError("Usuario o contraseña incorrectos");
        }

        return;
      }

      if (!data.user) return;

      const { data: perfilUsuario, error: errorPerfil } = await supabase
        .from("Usuarios")
        .select("id_usuario, rol, estado, id_cliente, id_empleado")
        .eq("auth_id", data.user.id)
        .maybeSingle();

      if (errorPerfil || !perfilUsuario) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("No se pudo cerrar sesión:", error);
        }
        setError("Tu cuenta aún no tiene acceso al sistema. Contacta al administrador.");
        return;
      }

      if (perfilUsuario.estado?.toLowerCase().trim() !== "activo") {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("No se pudo cerrar sesión:", error);
        }   
        setError("Tu usuario está inactivo. Contacta al administrador.");
        return;
      }

      const rolesPermitidos = ["admin", "cliente", "empleado"];

      if (!rolesPermitidos.includes(perfilUsuario.rol)) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("No se pudo cerrar sesión:", error);
        }
        setError("Tu rol no es válido. Contacta al administrador.");
        return;
      }

      navegar("/");
    } catch (err) {
      setError("Error al conectar con el servidor");
      console.error("Error en la solicitud: ", err);
    } finally {
      setCargandoLogin(false);
    }
  };

  const irRegistro = () => {
    navegar("/registro");
  };

  const irRecuperarCredenciales = () => {
    navegar("/recuperar-credenciales");
  };

  const ingresarComoInvitado = () => {
    navegar("/");
  };

  const estiloContenedor = {
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

    // Fondo moderno
    background:
    "linear-gradient(135deg, #d8b4a0, #ab9e99, #f1d4cb)",

    overflow: "auto",
  };

  const estiloCaja = {
    width: "100%",
    maxWidth: "360px",
    minHeight: "auto",

    // Transparencia tipo vidrio
    background: "rgba(255, 255, 255, 0.15)",

    // Efecto blur
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",

    border: "1px solid rgba(255,255,255,0.3)",

    padding: "clamp(18px, 4vw, 24px)",
    position: "relative",

    zIndex: 2,

    // sombra elegante
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",

    borderRadius: "20px",

    // efecto iluminación
    overflow: "hidden",
  };

  const estiloAvatar = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
  };
  const estiloLogo = {
    width: "clamp(60px, 16vw, 78px)",
    height: "clamp(60px, 16vw, 78px)",
    objectFit: "contain",
  };

  return (
    <div style={estiloContenedor} className="fondo-login">
      {/* ICONOS DECORATIVOS */}
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
      <div style={estiloCaja}>
        
        
        <div style={estiloAvatar}>
          <img
            src={logo}
            alt="Logo FS"
            style={estiloLogo}
          />
        </div>

        <div style={{ marginTop: "72px" }}>
          <FormularioLogin
            usuario={usuario}
            contrasena={contrasena}
            error={error}
            exito={exito}
            setUsuario={setUsuario}
            setContrasena={setContrasena}
            iniciarSesion={iniciarSesion}
            irRegistro={irRegistro}
            irRecuperarCredenciales={irRecuperarCredenciales}
            ingresarComoInvitado={ingresarComoInvitado}
            cargandoLogin={cargandoLogin}
          />
        </div>

      </div>
    </div>
  );
};

export default Login;