import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { supabase } from "../database/supabaseconfig";
import logo from "../assets/logo.png";
import "../App.css";

const Login = () => {

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const navegar = useNavigate();

  const iniciarSesion = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario,
        password: contrasena,
      });

      if (error) {
        setError("Usuario o contraseña incorrectos");
        return;
      }

      if (data.user) {
        localStorage.setItem("usuario-supabase", usuario);
        navegar("/");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
      console.error("Error en la solicitud: ", err);
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario-supabase");
    if (usuarioGuardado) {
      navegar("/");
    }
  }, [navegar]);

  const estiloContenedor = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  // Fondo moderno
  background:
  "linear-gradient(135deg, #d8b4a0, #ab9e99, #f1d4cb)",

  overflow: "hidden",
  padding: "20px",
  };

 const estiloCaja = {
   width: "360px",
  minHeight: "420px",

  // Transparencia tipo vidrio
  background: "rgba(255, 255, 255, 0.15)",

  // Efecto blur
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",

  border: "1px solid rgba(255,255,255,0.3)",

  padding: "30px",
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
  width: "120px",
  height: "120px",
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

        <div style={{ marginTop: "120px" }}>
          <FormularioLogin
            usuario={usuario}
            contrasena={contrasena}
            error={error}
            setUsuario={setUsuario}
            setContrasena={setContrasena}
            iniciarSesion={iniciarSesion}
          />
        </div>

      </div>
    </div>
  );
};

export default Login;