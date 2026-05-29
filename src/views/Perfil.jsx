import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { usuario, rol } = useAuth();

  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    url_imagen: "",
  });

  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [previewImagen, setPreviewImagen] = useState("");
  const navigate = useNavigate();

  const cargarPerfil = async () => {
  if (!usuario || !rol) return;

  setCargando(true);

  const { data: usuarioDB, error: errorUsuario } = await supabase
    .from("Usuarios")
    .select("id_cliente, id_empleado, correo")
    .eq("auth_id", usuario.id)
    .single();

  if (errorUsuario) {
    setMensaje("No se pudo cargar la información del usuario.");
    setTipoMensaje("danger");
    setCargando(false);
    return;
  }

  let tabla = "";
  let campoId = "";
  let id = null;
  let campos = "";

  if (rol === "cliente") {
    tabla = "Clientes";
    campoId = "id_cliente";
    id = usuarioDB.id_cliente;
    campos = "nombre, apellido, telefono, correo";
  } else if (rol === "empleado") {
    tabla = "Empleados";
    campoId = "id_empleado";
    id = usuarioDB.id_empleado;
    campos = "nombre, apellido, telefono, correo, url_imagen";
  }

  const { data, error } = await supabase
    .from(tabla)
    .select(campos)
    .eq(campoId, id)
    .single();

  if (error) {
    setMensaje("No se pudo cargar el perfil.");
    setTipoMensaje("danger");
  } else {
    setPerfil({
      nombre: data.nombre || "",
      apellido: data.apellido || "",
      telefono: data.telefono || "",
      correo: data.correo || usuarioDB.correo || "",
      url_imagen: data.url_imagen || "",
    });
  }

  setCargando(false);
};

useEffect(() => {
  const obtenerPerfil = async () => {
    await cargarPerfil();
  };
  obtenerPerfil();
}, [usuario, rol]);

const manejarCambio = (e) => {
  const { name, value } = e.target;

  if (name === "telefono") {
    const soloNumeros = value.replace(/\D/g, "").slice(0, 8);

    setPerfil({
      ...perfil,
      telefono: soloNumeros,
    });

    return;
  }

  setPerfil({
    ...perfil,
    [name]: value,
  });
};

const manejarImagen = (e) => {
  const archivo = e.target.files[0];

  if (archivo) {
    setImagen(archivo);
    setPreviewImagen(URL.createObjectURL(archivo));
  }
};

  const validarFormulario = () => {
    if (!perfil.nombre.trim()) {
      setMensaje("El nombre es obligatorio.");
      setTipoMensaje("danger");
      return false;
    }

    if (!perfil.apellido.trim()) {
      setMensaje("El apellido es obligatorio.");
      setTipoMensaje("danger");
      return false;
    }

    if (!/^\d{8}$/.test(perfil.telefono)) {
      setMensaje("El teléfono debe tener exactamente 8 dígitos.");
      setTipoMensaje("danger");
      return false;
    }

    return true;
  };

  const guardarCambios = async () => {
  if (!validarFormulario()) return;

  const { data: usuarioDB, error: errorUsuario } = await supabase
    .from("Usuarios")
    .select("id_cliente, id_empleado")
    .eq("auth_id", usuario.id)
    .single();

  if (errorUsuario) {
    setMensaje("No se pudo identificar el usuario.");
    setTipoMensaje("danger");
    return;
  }

  let tabla = "";
  let campoId = "";
  let id = null;

  if (rol === "cliente") {
    tabla = "Clientes";
    campoId = "id_cliente";
    id = usuarioDB.id_cliente;
  } else if (rol === "empleado") {
    tabla = "Empleados";
    campoId = "id_empleado";
    id = usuarioDB.id_empleado;
  }

  let urlImagenActualizada = perfil.url_imagen;

  if (rol === "empleado") {
    urlImagenActualizada = await subirImagenEmpleado(id);
  }

  const datosActualizar = {
    nombre: perfil.nombre.trim(),
    apellido: perfil.apellido.trim(),
    telefono: perfil.telefono.trim(),
  };

  if (rol === "empleado") {
    datosActualizar.url_imagen = urlImagenActualizada;
  }

  const { error: errorActualizar } = await supabase
    .from(tabla)
    .update(datosActualizar)
    .eq(campoId, id);

  if (errorActualizar) {
    setMensaje("No se pudo actualizar el perfil.");
    setTipoMensaje("danger");
  } else {
    setMensaje("Perfil actualizado correctamente.");
    setTipoMensaje("success");
    setEditando(false);
    cargarPerfil();
  }
};

  const subirImagenEmpleado = async (idEmpleado) => {
  if (!imagen) return perfil.url_imagen;

  const extension = imagen.name.split(".").pop();
  const nombreArchivo = `empleado_${idEmpleado}_${Date.now()}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from("imagenes_empleados")
    .upload(nombreArchivo, imagen);

  if (errorSubida) {
    throw new Error("No se pudo subir la imagen.");
  }

  const { data } = supabase.storage
    .from("imagenes_empleados")
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
};

  if (cargando) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando perfil...</p>
      </Container>
    );
  }

 return (
  <Container className="mt-5 pt-5 mb-5">
    <Card
      className="shadow-lg border-0 mx-auto overflow-hidden"
      style={{ maxWidth: "720px", borderRadius: "22px" }}
    >
      <div
        className="text-center text-white p-4"
        style={{
            backgroundColor: "#f1f3f5",
            border: "1px solid #dee2e6",
            color: "#212529",
            }}
          >
        {rol === "empleado" && (
          <img
            src={
            previewImagen ||
            perfil.url_imagen ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Foto de perfil"
            style={{
              width: "135px",
              height: "135px",
              objectFit: "cover",
              borderRadius: "50%",
              border: "4px solid #fff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          />
        )}

        <h3
        className="mt-3 mb-1 fw-bold"
        style={{
            color: "#8b6b61",
            textShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
        >
        {perfil.nombre} {perfil.apellido}
            </h3>

            <p
            className="mb-0 text-capitalize"
            style={{
                color: "#8b6b61",
                fontWeight: "500",
            }}
            >
            <i className="bi-person-badge me-2"></i>
            {rol}
            </p>
      </div>

      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            <i className="bi-person-circle me-2"></i>
            Mi perfil
          </h4>

          {!editando && (
            <Button variant="outline-dark" onClick={() => setEditando(true)}>
              <i className="bi-pencil-square me-2"></i>
              Editar
            </Button>
          )}
        </div>

        <Button
        variant="outline-secondary"
        size="sm"
        className="mb-3"
        onClick={() => navigate(-1)}
        >
        <i className="bi-arrow-left me-2"></i>
        Volver
        </Button>

        {mensaje && <Alert variant={tipoMensaje}>{mensaje}</Alert>}

        <Form>
          {rol === "empleado" && editando && (
            <Form.Group className="mb-4">
              <Form.Label>
                <i className="bi-image me-2"></i>
                Cambiar foto de perfil
              </Form.Label>

              <Form.Control
                type="file"
                accept="image/*"
                onChange={manejarImagen}
              />

              <Form.Text className="text-muted">
                Solo los empleados pueden actualizar su foto de perfil.
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
                <i className="bi-person-fill me-2"></i>
                Nombre
            </Form.Label>

            {!editando ? (
                <div
                className="p-3 rounded-3 border"
                style={{
                backgroundColor: "#f1f3f5",
                border: "1px solid #dee2e6",
                color: "#212529",
                }}
                >
                {perfil.nombre || "Sin nombre registrado"}
                </div>
            ) : (
                <Form.Control
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={manejarCambio}
                />
            )}
            </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
                <i className="bi-person-lines-fill me-2"></i>
                Apellido
            </Form.Label>

            {!editando ? (
                <div
                className="p-3 rounded-3 border"
                style={{
                backgroundColor: "#f1f3f5",
                border: "1px solid #dee2e6",
                color: "#212529",
                }}
                >
                {perfil.apellido || "Sin apellido registrado"}
                </div>
            ) : (
                <Form.Control
                type="text"
                name="apellido"
                value={perfil.apellido}
                onChange={manejarCambio}
                />
            )}
            </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
                <i className="bi-telephone-fill me-2"></i>
                Teléfono
            </Form.Label>

            {!editando ? (
                <div
                className="p-3 rounded-3 border"
                style={{
                backgroundColor: "#f1f3f5",
                border: "1px solid #dee2e6",
                color: "#212529",
                }}
                >
                {perfil.telefono || "Sin teléfono registrado"}
                </div>
            ) : (
                <Form.Control
                type="text"
                name="telefono"
                value={perfil.telefono}
                onChange={manejarCambio}
                maxLength={8}
                />
            )}
            </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
                <i className="bi-envelope-fill me-2"></i>
                Correo electrónico
            </Form.Label>

            <div
                className="p-3 rounded-3 border"
                style={{
                backgroundColor: "#f1f3f5",
                border: "1px solid #dee2e6",
                color: "#212529",
                }}
                >
                {perfil.correo || "Sin correo registrado"}
            </div>

            <Form.Text className="text-muted">
                El correo electrónico no se puede modificar desde esta sección.
            </Form.Text>
            </Form.Group>

          <div
            className="p-3 rounded-3 border"
            style={{
            backgroundColor: "#f1f3f5",
            border: "1px solid #dee2e6",
            color: "#212529",
            }}
            >
            <h6 className="mb-3 text-muted">
                <i className="bi-info-circle me-2"></i>
                Información de la cuenta
            </h6>

            <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tipo de usuario</span>
                <strong className="text-capitalize">{rol}</strong>
            </div>

            <div className="d-flex justify-content-between">
                <span className="text-muted">Estado del perfil</span>
                <span className="badge bg-success">Activo</span>
            </div>
            </div>

          {editando && (
            <div className="d-flex flex-column flex-sm-row gap-2">
              <Button variant="success" onClick={guardarCambios}>
                <i className="bi-check-circle me-2"></i>
                Guardar cambios
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                    setEditando(false);
                    setImagen(null);
                    setPreviewImagen("");
                    cargarPerfil();
                }}
                >
                <i className="bi-x-circle me-2"></i>
                Cancelar
                </Button>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  </Container>
);
};

export default Perfil;