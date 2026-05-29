import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import { useAuth } from "../context/AuthContext";

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

    setPerfil({
      ...perfil,
      [name]: value,
    });
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
    <Container className="mt-5 pt-5">
      <Card className="shadow-sm border-0 mx-auto" style={{ maxWidth: "650px" }}>
        <Card.Body className="p-4">
          <h3 className="mb-3">
            <i className="bi-person-circle me-2"></i>
            Mi perfil
          </h3>

          {mensaje && <Alert variant={tipoMensaje}>{mensaje}</Alert>}

          {rol === "empleado" && (
            <Form.Group className="mb-4">
                <Form.Label>Foto de perfil</Form.Label>

                {perfil.url_imagen && (
                <div className="mb-3 text-center">
                <img
                    src={
                    perfil.url_imagen ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="Foto de perfil"
                    style={{
                    width: "130px",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #8b6b61",
                    }}
                />
                </div>
                )}

                <Form.Control
                type="file"
                accept="image/*"
                disabled={!editando}
                onChange={(e) => setImagen(e.target.files[0])}
                />

                <Form.Text className="text-muted">
                Solo los empleados pueden actualizar su foto de perfil.
                </Form.Text>
            </Form.Group>
            )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={manejarCambio}
                disabled={!editando}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="apellido"
                value={perfil.apellido}
                onChange={manejarCambio}
                disabled={!editando}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={perfil.telefono}
                onChange={manejarCambio}
                disabled={!editando}
                maxLength={8}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={perfil.correo}
                disabled
              />
              <Form.Text className="text-muted">
                El correo electrónico no se puede modificar desde esta sección.
              </Form.Text>
            </Form.Group>

            {!editando ? (
              <Button variant="dark" onClick={() => setEditando(true)}>
                <i className="bi-pencil-square me-2"></i>
                Editar perfil
              </Button>
            ) : (
              <>
                <Button variant="success" className="me-2" onClick={guardarCambios}>
                  <i className="bi-check-circle me-2"></i>
                  Guardar cambios
                </Button>

                <Button variant="secondary" onClick={() => {
                  setEditando(false);
                  cargarPerfil();
                }}>
                  Cancelar
                </Button>
              </>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Perfil;