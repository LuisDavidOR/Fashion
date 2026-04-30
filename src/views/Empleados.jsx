import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroEmpleado from "../components/empleados/ModalRegistroEmpleado";
import ModalEdicionEmpleado from "../components/empleados/ModalEdicionEmpleado";
import ModalEliminacionEmpleado from "../components/empleados/ModalEliminacionEmpleado";
import ModalEstadoEmpleado from "../components/empleados/ModalEstadoEmpleado";
import TablaEmpleados from "../components/empleados/TablaEmpleados";
import TarjetaEmpleado from "../components/empleados/TarjetaEmpleado";

import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Empleados = () => {
  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscando, setBuscando] = useState(false);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activo");

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);

  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [empleadoEstado, setEmpleadoEstado] = useState(null);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    especialidad: "",
    comision: "",
    correo: "",
    archivo: null,
  });

  const [empleadoEditar, setEmpleadoEditar] = useState({
    id_empleado: "",
    nombre: "",
    apellido: "",
    telefono: "",
    especialidad: "",
    comision: "",
    correo: "",
    url_imagen: "",
    archivo: null,
  });

  const empleadosPaginados = empleadosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    setBuscando(true);

    let resultado = empleados.filter(
      (empleado) => empleado.estado === filtroEstado
    );

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();

      resultado = resultado.filter((empleado) => {
        const nombre = empleado.nombre?.toLowerCase() || "";
        const apellido = empleado.apellido?.toLowerCase() || "";
        const telefono = empleado.telefono?.toLowerCase() || "";
        const correo = empleado.correo?.toLowerCase() || "";
        const especialidad = empleado.especialidad?.toLowerCase() || "";
        const comision = empleado.comision?.toString() || "";

        return (
          nombre.includes(textoLower) ||
          apellido.includes(textoLower) ||
          telefono.includes(textoLower) ||
          correo.includes(textoLower) ||
          especialidad.includes(textoLower) ||
          comision.includes(textoLower)
        );
      });
    }

    setEmpleadosFiltrados(resultado);
    setBuscando(false);
  }, [textoBusqueda, empleados, filtroEstado]);

  useEffect(() => {
    establecerPaginaActual(1);
  }, [textoBusqueda, registrosPorPagina]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const limpiarEmpleado = () => {
    setNuevoEmpleado({
      nombre: "",
      apellido: "",
      telefono: "",
      especialidad: "",
      comision: "",
      correo: "",
      archivo: null,
    });
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;

    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;

    setEmpleadoEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoEmpleado((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      setToast({
        mostrar: true,
        mensaje: "Selecciona una imagen válida.",
        tipo: "advertencia",
      });
    }
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setEmpleadoEditar((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      setToast({
        mostrar: true,
        mensaje: "Selecciona una imagen válida.",
        tipo: "advertencia",
      });
    }
  };

  const validarCorreo = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const validarTelefono = (telefono) => {
    return /^[0-9]{8}$/.test(telefono);
  };

  const cargarEmpleados = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("Empleados")
        .select("*")
        .order("id_empleado", { ascending: true });

      if (error) {
        console.error("Error al cargar empleados:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al cargar empleados.",
          tipo: "error",
        });

        return;
      }

      setEmpleados(data || []);
    } catch (err) {
      console.error("Excepción al cargar empleados:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar empleados.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const subirImagenEmpleado = async (archivo) => {
    const nombreArchivo = `${Date.now()}_${archivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_empleados")
      .upload(nombreArchivo, archivo);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("imagenes_empleados")
      .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
  };

  const eliminarImagenAnterior = async (urlImagen) => {
    if (!urlImagen) return;

    try {
      const nombreAnterior = urlImagen.split("/").pop().split("?")[0];

      await supabase.storage
        .from("imagenes_empleados")
        .remove([nombreAnterior]);
    } catch (err) {
      console.warn("No se pudo eliminar la imagen anterior:", err.message);
    }
  };

  const abrirModalEdicion = (empleado) => {
    setEmpleadoEditar({
      id_empleado: empleado.id_empleado,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      telefono: empleado.telefono,
      especialidad: empleado.especialidad || "",
      comision: empleado.comision,
      correo: empleado.correo,
      url_imagen: empleado.url_imagen || "",
      archivo: null,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (empleado) => {
    setEmpleadoAEliminar(empleado);
    setMostrarModalEliminacion(true);
  };

  const abrirModalEstado = (empleado) => {
    setEmpleadoEstado(empleado);
    setMostrarModalEstado(true);
  };

  const agregarEmpleado = async () => {
    try {
      if (
        !nuevoEmpleado.nombre.trim() ||
        !nuevoEmpleado.apellido.trim() ||
        !nuevoEmpleado.telefono.trim() ||
        !nuevoEmpleado.comision ||
        !nuevoEmpleado.correo.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar los campos obligatorios.",
          tipo: "advertencia",
        });

        return;
      }

      if (!validarTelefono(nuevoEmpleado.telefono)) {
        setToast({
          mostrar: true,
          mensaje: "El teléfono debe tener exactamente 8 dígitos numéricos.",
          tipo: "advertencia",
        });

        return;
      }

      if (!validarCorreo(nuevoEmpleado.correo)) {
        setToast({
          mostrar: true,
          mensaje: "Debe ingresar un correo válido.",
          tipo: "advertencia",
        });

        return;
      }

      let urlImagen = "";

      if (nuevoEmpleado.archivo) {
        urlImagen = await subirImagenEmpleado(nuevoEmpleado.archivo);
      }

      const { error } = await supabase.from("Empleados").insert([
        {
          nombre: nuevoEmpleado.nombre.trim(),
          apellido: nuevoEmpleado.apellido.trim(),
          telefono: nuevoEmpleado.telefono.trim(),
          especialidad: nuevoEmpleado.especialidad.trim() || null,
          comision: parseFloat(nuevoEmpleado.comision),
          correo: nuevoEmpleado.correo.trim(),
          url_imagen: urlImagen || null,
        },
      ]);

      if (error) {
        console.error("Error al registrar empleado:", error.message);

        if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
          setToast({
            mostrar: true,
            mensaje: "Ya existe un empleado registrado con ese correo.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: "Error al registrar empleado.",
          tipo: "error",
        });

        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Empleado "${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}" registrado exitosamente.`,
        tipo: "exito",
      });

      limpiarEmpleado();
      await cargarEmpleados();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al registrar empleado:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar empleado.",
        tipo: "error",
      });
    }
  };

  const actualizarEmpleado = async () => {
    try {
      if (
        !empleadoEditar.nombre.trim() ||
        !empleadoEditar.apellido.trim() ||
        !empleadoEditar.telefono.trim() ||
        !empleadoEditar.comision ||
        !empleadoEditar.correo.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar los campos obligatorios.",
          tipo: "advertencia",
        });

        return;
      }

      if (!validarTelefono(empleadoEditar.telefono)) {
        setToast({
          mostrar: true,
          mensaje: "El teléfono debe tener exactamente 8 dígitos numéricos.",
          tipo: "advertencia",
        });

        return;
      }

      if (!validarCorreo(empleadoEditar.correo)) {
        setToast({
          mostrar: true,
          mensaje: "Debe ingresar un correo válido.",
          tipo: "advertencia",
        });

        return;
      }

      setMostrarModalEdicion(false);

      let datosActualizados = {
        nombre: empleadoEditar.nombre.trim(),
        apellido: empleadoEditar.apellido.trim(),
        telefono: empleadoEditar.telefono.trim(),
        especialidad: empleadoEditar.especialidad.trim() || null,
        comision: parseFloat(empleadoEditar.comision),
        correo: empleadoEditar.correo.trim(),
        url_imagen: empleadoEditar.url_imagen || null,
      };

      if (empleadoEditar.archivo) {
        const nuevaUrlImagen = await subirImagenEmpleado(empleadoEditar.archivo);

        datosActualizados.url_imagen = nuevaUrlImagen;

        await eliminarImagenAnterior(empleadoEditar.url_imagen);
      }

      const { error } = await supabase
        .from("Empleados")
        .update(datosActualizados)
        .eq("id_empleado", empleadoEditar.id_empleado);

      if (error) {
        console.error("Error al actualizar empleado:", error.message);

        if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
          setToast({
            mostrar: true,
            mensaje: "Ya existe otro empleado registrado con ese correo.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: "Error al actualizar empleado.",
          tipo: "error",
        });

        return;
      }

      await cargarEmpleados();

      setToast({
        mostrar: true,
        mensaje: `Empleado ${empleadoEditar.nombre} ${empleadoEditar.apellido} actualizado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al actualizar empleado:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar empleado.",
        tipo: "error",
      });
    }
  };

  const eliminarEmpleado = async () => {
    if (!empleadoAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("Empleados")
        .delete()
        .eq("id_empleado", empleadoAEliminar.id_empleado);

      if (error) {
        console.error("Error al eliminar empleado:", error.message);

        if (error.code === "23503") {
          setToast({
            mostrar: true,
            mensaje:
              "No se puede eliminar este empleado porque tiene registros relacionados.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: "Error al eliminar empleado.",
          tipo: "error",
        });

        return;
      }

      await eliminarImagenAnterior(empleadoAEliminar.url_imagen);
      await cargarEmpleados();

      setToast({
        mostrar: true,
        mensaje: `Empleado ${empleadoAEliminar.nombre} ${empleadoAEliminar.apellido} eliminado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al eliminar empleado:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar empleado.",
        tipo: "error",
      });
    }
  };

  const cambiarEstadoEmpleado = async () => {
    if (!empleadoEstado) return;

    try {
      const nuevoEstado =
        empleadoEstado.estado === "activo" ? "inactivo" : "activo";

      const { error } = await supabase
        .from("Empleados")
        .update({ estado: nuevoEstado })
        .eq("id_empleado", empleadoEstado.id_empleado);

      if (error) {
        console.error("Error al cambiar estado:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al cambiar el estado del empleado.",
          tipo: "error",
        });

        return;
      }

      setMostrarModalEstado(false);

      setToast({
        mostrar: true,
        mensaje: `Empleado "${empleadoEstado.nombre} ${empleadoEstado.apellido}" ${
          nuevoEstado === "activo" ? "activado" : "inactivado"
        } correctamente.`,
        tipo: "exito",
      });

      setEmpleadoEstado(null);
      await cargarEmpleados();
    } catch (err) {
      console.error("Error inesperado al cambiar estado:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cambiar estado.",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-person-badge-fill me-2"></i> Empleados
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Empleado</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <div className="d-flex gap-2 mb-3">
        <Button
          className={filtroEstado === "activo" ? "btn-activas" : "btn-inactivas"}
          onClick={() => {
            setFiltroEstado("activo");
            establecerPaginaActual(1);
          }}
        >
          Activos
        </Button>

        <Button
          className={
            filtroEstado === "inactivo" ? "btn-activas" : "btn-inactivas"
          }
          onClick={() => {
            setFiltroEstado("inactivo");
            establecerPaginaActual(1);
          }}
        >
          Inactivos
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, teléfono, correo o especialidad..."
          />
        </Col>
      </Row>

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando empleados...</p>
          </Col>
        </Row>
      )}

      {!cargando &&
        !buscando &&
        textoBusqueda.trim() &&
        empleadosFiltrados.length === 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="info" className="text-center">
                <i className="bi bi-info-circle me-2"></i>
                No se encontraron empleados que coincidan con "{textoBusqueda}".
              </Alert>
            </Col>
          </Row>
        )}

      {!cargando &&
        !buscando &&
        !textoBusqueda.trim() &&
        empleadosFiltrados.length === 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="info" className="text-center">
                <i className="bi bi-info-circle me-2"></i>
                No hay empleados{" "}
                {filtroEstado === "activo" ? "activos" : "inactivos"}.
              </Alert>
            </Col>
          </Row>
        )}

      <div className="contenedor-tabla-paginacion">
        {!cargando && empleadosPaginados.length > 0 && (
          <Row>
            

            <Col lg={12}>
            <TarjetaEmpleado
              empleados={empleadosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              cambiarEstadoEmpleado={abrirModalEstado}
            />
          </Col>
          </Row>
        )}
      </div>

      <ModalRegistroEmpleado
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoEmpleado={nuevoEmpleado}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarEmpleado={agregarEmpleado}
        limpiarEmpleado={limpiarEmpleado}
      />

      <ModalEdicionEmpleado
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        empleadoEditar={empleadoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarEmpleado={actualizarEmpleado}
      />

      <ModalEliminacionEmpleado
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarEmpleado={eliminarEmpleado}
        empleado={empleadoAEliminar}
      />

      <ModalEstadoEmpleado
        mostrarModalEstado={mostrarModalEstado}
        setMostrarModalEstado={setMostrarModalEstado}
        empleado={empleadoEstado}
        cambiarEstadoEmpleado={cambiarEstadoEmpleado}
      />

      {empleadosFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={empleadosFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Empleados;