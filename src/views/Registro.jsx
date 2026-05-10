import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioRegistro from "../components/registro/FormularioRegistro";
import logo from "../assets/logo.png";
import "../App.css";
import { supabase } from "../database/supabaseconfig";

const Registro = () => {
  const [datosRegistro, setDatosRegistro] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  const navegar = useNavigate();

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const soloNumeros = value.replace(/\D/g, "").slice(0, 8);

      setDatosRegistro((prev) => ({
        ...prev,
        [name]: soloNumeros,
      }));

      return;
    }

    setDatosRegistro((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const registrarCliente = async () => {
    if (cargandoRegistro) return;

    try {
      setError(null);
      setExito(null);
      setCargandoRegistro(true);

      const nombre = datosRegistro.nombre.trim();
      const apellido = datosRegistro.apellido.trim();
      const telefono = datosRegistro.telefono.trim();
      const correo = datosRegistro.correo.trim().toLowerCase();
      const contrasena = datosRegistro.contrasena;
      const confirmarContrasena = datosRegistro.confirmarContrasena;

      if (
        !nombre ||
        !apellido ||
        !telefono ||
        !correo ||
        !contrasena ||
        !confirmarContrasena
      ) {
        setError("Debes completar todos los campos obligatorios.");
        return;
      }

      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
        setError("El nombre solo debe contener letras.");
        return;
      }

      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellido)) {
        setError("El apellido solo debe contener letras.");
        return;
      }

      if (!/^[0-9]{8}$/.test(telefono)) {
        setError("El teléfono debe tener exactamente 8 dígitos.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.(com|net|org|edu|ni|es|mx|us)$/i.test(correo)) {
        setError("Debes ingresar un correo válido.");
        return;
      }

      if (contrasena.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (contrasena !== confirmarContrasena) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: {
            emailRedirectTo: undefined,
          },
        });

      if (authError) {
        console.error("Error en Auth:", authError);

        const mensajeError = authError.message?.toLowerCase() || "";

        if (
          mensajeError.includes("already registered") ||
          mensajeError.includes("already been registered") ||
          mensajeError.includes("user already registered")
        ) {
          setError("Este correo ya está registrado. Intenta iniciar sesión.");
        } else if (mensajeError.includes("invalid email")) {
          setError("El correo ingresado no es válido.");
        } else if (mensajeError.includes("password")) {
          setError("La contraseña no cumple los requisitos mínimos.");
        } else if (mensajeError.includes("signup")) {
          setError("El registro de usuarios está deshabilitado en Supabase.");
        } else if (mensajeError.includes("email rate limit exceeded")) {
          setError("Se alcanzó el límite de correos de confirmación. Intenta nuevamente en unos minutos.");
        } else {
          setError(`Error de Supabase: ${authError.message}`);
        }

        return;
      }

      const authId = authData.user?.id;

      if (!authId) {
        setError("No se pudo obtener el usuario autenticado.");
        return;
      }

      const { data: clienteExistente, error: errorBuscarCliente } = await supabase
        .from("Clientes")
        .select("id_cliente, correo")
        .eq("correo", correo)
        .maybeSingle();

      if (errorBuscarCliente) {
        console.error("Error al buscar cliente:", errorBuscarCliente.message);
        setError("No se pudo validar si el cliente ya existe.");
        return;
      }

      let idCliente = clienteExistente?.id_cliente;

      if (idCliente) {
        const { error: errorActualizarCliente } = await supabase
          .from("Clientes")
          .update({
            nombre,
            apellido,
            telefono,
            estado: "activo",
          })
          .eq("id_cliente", idCliente);

        if (errorActualizarCliente) {
          console.error("Error al actualizar cliente existente:", errorActualizarCliente.message);
          setError("La cuenta fue creada, pero no se pudieron actualizar los datos del cliente.");
          return;
        }
      }

      if (!idCliente) {
        const { data: clienteNuevo, error: errorCrearCliente } = await supabase
          .from("Clientes")
          .insert([
            {
              nombre,
              apellido,
              telefono,
              correo,
              estado: "activo",
            },
          ])
          .select("id_cliente")
          .single();

        if (errorCrearCliente) {
          console.error("Error al crear cliente:", errorCrearCliente.message);
          setError("La cuenta fue creada, pero no se pudo registrar el cliente.");
          return;
        }

        idCliente = clienteNuevo.id_cliente;
      }

      const { error: errorCrearUsuario } = await supabase.from("Usuarios").insert([
        {
          correo,
          rol: "cliente",
          id_cliente: idCliente,
          id_empleado: null,
          auth_id: authId,
        },
      ]);

      if (errorCrearUsuario) {
        console.error("Error al crear usuario:", errorCrearUsuario.message);

        if (errorCrearUsuario.code === "23505") {
          setError("Ya existe un usuario registrado con este correo.");
        } else {
          setError("El cliente fue registrado, pero no se pudo crear el usuario del sistema.");
        }

        return;
      }

      if (!authData.session) {
        setExito(
          "Cuenta creada correctamente. Revisa tu correo y confirma tu cuenta antes de iniciar sesión."
        );
      } else {
        setExito(
          "Cuenta creada correctamente. Ahora puedes iniciar sesión."
        );

        await supabase.auth.signOut();
      }

      setDatosRegistro({
        nombre: "",
        apellido: "",
        telefono: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
      });

      setTimeout(() => {
        navegar("/login");
      }, 2500);
    } catch (err) {
      console.error("Error inesperado al registrar cliente:", err.message);
      setError("Ocurrió un error inesperado al registrar la cuenta.");
    } finally {
      setCargandoRegistro(false);
    }
  };

  const irLogin = () => {
    navegar("/login");
  };

  const estiloContenedor = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    minHeight: "100vh",

    paddingTop: "95px",
    paddingBottom: "35px",
    paddingLeft: "20px",
    paddingRight: "20px",

    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",

    boxSizing: "border-box",

    background:
      "linear-gradient(135deg, #d8b4a0, #ab9e99, #f1d4cb)",

    overflowY: "auto",
  };

  const estiloCaja = {
    width: "100%",
    maxWidth: "660px",
    marginBottom: "35px",
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
    width: "clamp(52px, 13vw, 72px)",
    height: "clamp(52px, 13vw, 72px)",
    objectFit: "contain",
  };

  return (
    <div style={estiloContenedor} className="fondo-login">
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
          <img src={logo} alt="Logo FS" style={estiloLogo} />
        </div>

        <div style={{ marginTop: "62px" }}>
          <FormularioRegistro
            datosRegistro={datosRegistro}
            error={error}
            exito={exito}
            cargandoRegistro={cargandoRegistro}
            manejarCambio={manejarCambio}
            registrarCliente={registrarCliente}
            irLogin={irLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default Registro;