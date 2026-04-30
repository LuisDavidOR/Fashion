import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TarjetaServicio from "../components/servicios/TarjetaServicio";
import ModalRegistroServicio from "../components/servicios/ModalRegistroServicio";
import ModalEdicionServicio from "../components/servicios/ModalEdicionServicio";
import ModalEliminacionServicio from "../components/servicios/ModalEliminacionServicio";
import ModalEstadoServicio from "../components/servicios/ModalEstadoServicio";

import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Servicios = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [servicios, setServicios] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activo");

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(6);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);

  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [servicioEstado, setServicioEstado] = useState(null);

  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
    id_categoria: "",
    archivo: null,
  });

  const [servicioEditar, setServicioEditar] = useState({
    id_servicio: "",
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
    id_categoria: "",
    url_imagen: "",
    archivo: null,
  });

  const serviciosPaginados = serviciosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  useEffect(() => {
    cargarServicios();
    cargarCategorias();
  }, []);

  useEffect(() => {
    setBuscando(true);

    let resultado = servicios.filter(
      (servicio) => servicio.estado === filtroEstado
    );

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();

      resultado = resultado.filter((servicio) => {
        const categoriaNombre =
          servicio.Categorias?.nombre?.toLowerCase() || "";

        return (
          servicio.nombre?.toLowerCase().includes(textoLower) ||
          servicio.descripcion?.toLowerCase().includes(textoLower) ||
          servicio.precio?.toString().includes(textoLower) ||
          servicio.duracion?.toString().includes(textoLower) ||
          categoriaNombre.includes(textoLower)
        );
      });
    }

    setServiciosFiltrados(resultado);
    setBuscando(false);
  }, [textoBusqueda, servicios, filtroEstado]);

  useEffect(() => {
    establecerPaginaActual(1);
  }, [textoBusqueda, registrosPorPagina]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const limpiarServicio = () => {
    setNuevoServicio({
      nombre: "",
      descripcion: "",
      precio: "",
      duracion: "",
      id_categoria: "",
      archivo: null,
    });
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;

    setNuevoServicio((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;

    setServicioEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoServicio((prev) => ({ ...prev, archivo }));
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
      setServicioEditar((prev) => ({ ...prev, archivo }));
    } else {
      setToast({
        mostrar: true,
        mensaje: "Selecciona una imagen válida.",
        tipo: "advertencia",
      });
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("Categorias")
        .select("*")
        .eq("estado", "activo")
        .order("id_categoria", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err.message);
    }
  };

  const cargarServicios = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("Servicios")
        .select("*, Categorias(nombre)")
        .order("id_servicio", { ascending: true });

      if (error) {
        console.error("Error al cargar servicios:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cargar servicios.",
          tipo: "error",
        });
        return;
      }

      setServicios(data || []);
    } catch (err) {
      console.error("Excepción al cargar servicios:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar servicios.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const subirImagenServicio = async (archivo) => {
    const nombreArchivo = `${Date.now()}_${archivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_servicios")
      .upload(nombreArchivo, archivo);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("imagenes_servicios")
      .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
  };

  const eliminarImagenAnterior = async (urlImagen) => {
    if (!urlImagen) return;

    try {
      const nombreAnterior = urlImagen.split("/").pop().split("?")[0];

      await supabase.storage
        .from("imagenes_servicios")
        .remove([nombreAnterior]);
    } catch (err) {
      console.warn("No se pudo eliminar la imagen anterior:", err.message);
    }
  };

  const abrirModalEdicion = (servicio) => {
    setServicioEditar({
      id_servicio: servicio.id_servicio,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || "",
      precio: servicio.precio,
      duracion: servicio.duracion,
      id_categoria: servicio.id_categoria,
      url_imagen: servicio.url_imagen || "",
      archivo: null,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (servicio) => {
    setServicioAEliminar(servicio);
    setMostrarModalEliminacion(true);
  };

  const abrirModalEstado = (servicio) => {
    setServicioEstado(servicio);
    setMostrarModalEstado(true);
  };

  const agregarServicio = async () => {
    try {
      if (
        !nuevoServicio.nombre.trim() ||
        !nuevoServicio.precio ||
        !nuevoServicio.duracion ||
        !nuevoServicio.id_categoria
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar los campos obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      let urlImagen = "";

      if (nuevoServicio.archivo) {
        urlImagen = await subirImagenServicio(nuevoServicio.archivo);
      }

      const { error } = await supabase.from("Servicios").insert([
        {
          nombre: nuevoServicio.nombre.trim(),
          descripcion: nuevoServicio.descripcion.trim() || null,
          precio: parseFloat(nuevoServicio.precio),
          duracion: parseInt(nuevoServicio.duracion),
          id_categoria: nuevoServicio.id_categoria,
          url_imagen: urlImagen || null,
        },
      ]);

      if (error) {
        console.error("Error al registrar servicio:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al registrar servicio.",
          tipo: "error",
        });
        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Servicio "${nuevoServicio.nombre}" registrado correctamente.`,
        tipo: "exito",
      });

      limpiarServicio();
      await cargarServicios();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al registrar servicio:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar servicio.",
        tipo: "error",
      });
    }
  };

  const actualizarServicio = async () => {
    try {
      if (
        !servicioEditar.nombre.trim() ||
        !servicioEditar.precio ||
        !servicioEditar.duracion ||
        !servicioEditar.id_categoria
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar los campos obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      let datosActualizados = {
        nombre: servicioEditar.nombre.trim(),
        descripcion: servicioEditar.descripcion.trim() || null,
        precio: parseFloat(servicioEditar.precio),
        duracion: parseInt(servicioEditar.duracion),
        id_categoria: servicioEditar.id_categoria,
        url_imagen: servicioEditar.url_imagen || null,
      };

      if (servicioEditar.archivo) {
        const nuevaUrlImagen = await subirImagenServicio(servicioEditar.archivo);
        datosActualizados.url_imagen = nuevaUrlImagen;

        await eliminarImagenAnterior(servicioEditar.url_imagen);
      }

      const { error } = await supabase
        .from("Servicios")
        .update(datosActualizados)
        .eq("id_servicio", servicioEditar.id_servicio);

      if (error) {
        console.error("Error al actualizar servicio:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al actualizar servicio.",
          tipo: "error",
        });
        return;
      }

      await cargarServicios();

      setToast({
        mostrar: true,
        mensaje: `Servicio "${servicioEditar.nombre}" actualizado correctamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al actualizar servicio:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar servicio.",
        tipo: "error",
      });
    }
  };

  const eliminarServicio = async () => {
    if (!servicioAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("Servicios")
        .delete()
        .eq("id_servicio", servicioAEliminar.id_servicio);

      if (error) {
        console.error("Error al eliminar servicio:", error.message);

        if (error.code === "23503") {
          setToast({
            mostrar: true,
            mensaje:
              "No se puede eliminar este servicio porque tiene registros relacionados.",
            tipo: "advertencia",
          });
          return;
        }

        setToast({
          mostrar: true,
          mensaje: "Error al eliminar servicio.",
          tipo: "error",
        });
        return;
      }

      await eliminarImagenAnterior(servicioAEliminar.url_imagen);
      await cargarServicios();

      setToast({
        mostrar: true,
        mensaje: `Servicio "${servicioAEliminar.nombre}" eliminado correctamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al eliminar servicio:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar servicio.",
        tipo: "error",
      });
    }
  };

  const cambiarEstadoServicio = async () => {
    if (!servicioEstado) return;

    try {
      const nuevoEstado =
        servicioEstado.estado === "activo" ? "inactivo" : "activo";

      const { error } = await supabase
        .from("Servicios")
        .update({ estado: nuevoEstado })
        .eq("id_servicio", servicioEstado.id_servicio);

      if (error) {
        console.error("Error al cambiar estado:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cambiar estado del servicio.",
          tipo: "error",
        });
        return;
      }

      setMostrarModalEstado(false);

      setToast({
        mostrar: true,
        mensaje: `Servicio "${servicioEstado.nombre}" ${
          nuevoEstado === "activo" ? "activado" : "inactivado"
        } correctamente.`,
        tipo: "exito",
      });

      setServicioEstado(null);
      await cargarServicios();
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
            <i className="bi-scissors me-2"></i> Servicios
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Servicio</span>
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
            placeholder="Buscar por servicio, categoría, precio o duración..."
          />
        </Col>
      </Row>

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando servicios...</p>
          </Col>
        </Row>
      )}

      {!cargando &&
        !buscando &&
        textoBusqueda.trim() &&
        serviciosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No se encontraron servicios que coincidan con "{textoBusqueda}".
          </Alert>
        )}

      {!cargando &&
        !buscando &&
        !textoBusqueda.trim() &&
        serviciosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No hay servicios{" "}
            {filtroEstado === "activo" ? "activos" : "inactivos"}.
          </Alert>
        )}

      {!cargando && serviciosPaginados.length > 0 && (
        <TarjetaServicio
          servicios={serviciosPaginados}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
          cambiarEstadoServicio={abrirModalEstado}
        />
      )}

      <ModalRegistroServicio
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoServicio={nuevoServicio}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarServicio={agregarServicio}
        limpiarServicio={limpiarServicio}
        categorias={categorias}
      />

      <ModalEdicionServicio
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        servicioEditar={servicioEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarServicio={actualizarServicio}
        categorias={categorias}
      />

      <ModalEliminacionServicio
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarServicio={eliminarServicio}
        servicio={servicioAEliminar}
      />

      <ModalEstadoServicio
        mostrarModalEstado={mostrarModalEstado}
        setMostrarModalEstado={setMostrarModalEstado}
        servicio={servicioEstado}
        cambiarEstadoServicio={cambiarEstadoServicio}
      />

      {serviciosFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={serviciosFiltrados.length}
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

export default Servicios;