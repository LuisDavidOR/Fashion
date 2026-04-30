import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TarjetaInsumo from "../components/insumos/TarjetaInsumo";
import ModalRegistroInsumo from "../components/insumos/ModalRegistroInsumo";
import ModalEdicionInsumo from "../components/insumos/ModalEdicionInsumo";
import ModalEliminacionInsumo from "../components/insumos/ModalEliminacionInsumo";
import ModalEstadoInsumo from "../components/insumos/ModalEstadoInsumo";

import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Insumos = () => {
  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const [insumos, setInsumos] = useState([]);
  const [insumosFiltrados, setInsumosFiltrados] = useState([]);

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

  const [insumoAEliminar, setInsumoAEliminar] = useState(null);
  const [insumoEstado, setInsumoEstado] = useState(null);

  const [nuevoInsumo, setNuevoInsumo] = useState({
    nombre: "",
    descripcion: "",
    costo_producto: "",
    contenido_total: "",
    unidad_medida: "",
    stock: "",
    archivo: null,
  });

  const [insumoEditar, setInsumoEditar] = useState({
    id_insumo: "",
    nombre: "",
    descripcion: "",
    costo_producto: "",
    contenido_total: "",
    unidad_medida: "",
    stock: "",
    url_imagen: "",
    archivo: null,
  });

  const insumosPaginados = insumosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  useEffect(() => {
    cargarInsumos();
  }, []);

  useEffect(() => {
    setBuscando(true);

    let resultado = insumos.filter((insumo) => insumo.estado === filtroEstado);

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();

      resultado = resultado.filter((insumo) => {
        const nombre = insumo.nombre?.toLowerCase() || "";
        const descripcion = insumo.descripcion?.toLowerCase() || "";
        const unidad = insumo.unidad_medida?.toLowerCase() || "";
        const costo = insumo.costo_producto?.toString() || "";
        const contenido = insumo.contenido_total?.toString() || "";
        const stock = insumo.stock?.toString() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          unidad.includes(textoLower) ||
          costo.includes(textoLower) ||
          contenido.includes(textoLower) ||
          stock.includes(textoLower)
        );
      });
    }

    setInsumosFiltrados(resultado);
    setBuscando(false);
  }, [textoBusqueda, insumos, filtroEstado]);

  useEffect(() => {
    establecerPaginaActual(1);
  }, [textoBusqueda, registrosPorPagina]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const limpiarInsumo = () => {
    setNuevoInsumo({
      nombre: "",
      descripcion: "",
      costo_producto: "",
      contenido_total: "",
      unidad_medida: "",
      stock: "",
      archivo: null,
    });
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;

    setNuevoInsumo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;

    setInsumoEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const esImagenValida = (archivo) => {
    return (
      archivo?.type?.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp)$/i.test(archivo?.name || "")
    );
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    if (esImagenValida(archivo)) {
      setNuevoInsumo((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      setToast({
        mostrar: true,
        mensaje: "Selecciona una imagen válida: JPG, JPEG, PNG o WEBP.",
        tipo: "advertencia",
      });
    }
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    if (esImagenValida(archivo)) {
      setInsumoEditar((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      setToast({
        mostrar: true,
        mensaje: "Selecciona una imagen válida: JPG, JPEG, PNG o WEBP.",
        tipo: "advertencia",
      });
    }
  };

  const cargarInsumos = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("Insumos")
        .select("*")
        .order("id_insumo", { ascending: true });

      if (error) {
        console.error("Error al cargar insumos:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al cargar insumos.",
          tipo: "error",
        });

        return;
      }

      setInsumos(data || []);
    } catch (err) {
      console.error("Excepción al cargar insumos:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar insumos.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const subirImagenInsumo = async (archivo) => {
    const nombreArchivo = `${Date.now()}_${archivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes_insumos")
      .upload(nombreArchivo, archivo);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("imagenes_insumos")
      .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
  };

  const eliminarImagenAnterior = async (urlImagen) => {
    if (!urlImagen) return;

    try {
      const nombreAnterior = urlImagen.split("/").pop().split("?")[0];

      await supabase.storage
        .from("imagenes_insumos")
        .remove([nombreAnterior]);
    } catch (err) {
      console.warn("No se pudo eliminar la imagen anterior:", err.message);
    }
  };

  const abrirModalEdicion = (insumo) => {
    setInsumoEditar({
      id_insumo: insumo.id_insumo,
      nombre: insumo.nombre || "",
      descripcion: insumo.descripcion || "",
      costo_producto: insumo.costo_producto || "",
      contenido_total: insumo.contenido_total || "",
      unidad_medida: insumo.unidad_medida || "",
      stock: insumo.stock || "",
      url_imagen: insumo.url_imagen || "",
      archivo: null,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (insumo) => {
    setInsumoAEliminar(insumo);
    setMostrarModalEliminacion(true);
  };

  const abrirModalEstado = (insumo) => {
    setInsumoEstado(insumo);
    setMostrarModalEstado(true);
  };

  const agregarInsumo = async () => {
    try {
      if (
        !nuevoInsumo.nombre.trim() ||
        !nuevoInsumo.costo_producto ||
        !nuevoInsumo.contenido_total ||
        !nuevoInsumo.unidad_medida.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar los campos obligatorios.",
          tipo: "advertencia",
        });

        return;
      }

      let urlImagen = "";

      if (nuevoInsumo.archivo) {
        urlImagen = await subirImagenInsumo(nuevoInsumo.archivo);
      }

      const { error } = await supabase.from("Insumos").insert([
        {
          nombre: nuevoInsumo.nombre.trim(),
          descripcion: nuevoInsumo.descripcion.trim() || null,
          costo_producto: parseFloat(nuevoInsumo.costo_producto),
          contenido_total: parseFloat(nuevoInsumo.contenido_total),
          unidad_medida: nuevoInsumo.unidad_medida.trim(),
          stock: nuevoInsumo.stock === "" ? null : parseInt(nuevoInsumo.stock),
          url_imagen: urlImagen || null,
        },
      ]);

      if (error) {
        console.error("Error al registrar insumo:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al registrar insumo.",
          tipo: "error",
        });

        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Insumo "${nuevoInsumo.nombre}" registrado correctamente.`,
        tipo: "exito",
      });

      limpiarInsumo();
      await cargarInsumos();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al registrar insumo:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar insumo.",
        tipo: "error",
      });
    }
  };

  const actualizarInsumo = async () => {
    try {
      if (
        !insumoEditar.nombre.trim() ||
        !insumoEditar.costo_producto ||
        !insumoEditar.contenido_total ||
        !insumoEditar.unidad_medida.trim()
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
        nombre: insumoEditar.nombre.trim(),
        descripcion: insumoEditar.descripcion.trim() || null,
        costo_producto: parseFloat(insumoEditar.costo_producto),
        contenido_total: parseFloat(insumoEditar.contenido_total),
        unidad_medida: insumoEditar.unidad_medida.trim(),
        stock: insumoEditar.stock === "" ? null : parseInt(insumoEditar.stock),
        url_imagen: insumoEditar.url_imagen || null,
      };

      if (insumoEditar.archivo) {
        const nuevaUrlImagen = await subirImagenInsumo(insumoEditar.archivo);

        datosActualizados.url_imagen = nuevaUrlImagen;

        await eliminarImagenAnterior(insumoEditar.url_imagen);
      }

      const { error } = await supabase
        .from("Insumos")
        .update(datosActualizados)
        .eq("id_insumo", insumoEditar.id_insumo);

      if (error) {
        console.error("Error al actualizar insumo:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al actualizar insumo.",
          tipo: "error",
        });

        return;
      }

      await cargarInsumos();

      setToast({
        mostrar: true,
        mensaje: `Insumo "${insumoEditar.nombre}" actualizado correctamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al actualizar insumo:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar insumo.",
        tipo: "error",
      });
    }
  };

  const eliminarInsumo = async () => {
    if (!insumoAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("Insumos")
        .delete()
        .eq("id_insumo", insumoAEliminar.id_insumo);

      if (error) {
        console.error("Error al eliminar insumo:", error.message);

        if (error.code === "23503") {
          setToast({
            mostrar: true,
            mensaje:
              "No se puede eliminar este insumo porque tiene registros relacionados.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: "Error al eliminar insumo.",
          tipo: "error",
        });

        return;
      }

      await eliminarImagenAnterior(insumoAEliminar.url_imagen);
      await cargarInsumos();

      setToast({
        mostrar: true,
        mensaje: `Insumo "${insumoAEliminar.nombre}" eliminado correctamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al eliminar insumo:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar insumo.",
        tipo: "error",
      });
    }
  };

  const cambiarEstadoInsumo = async () => {
    if (!insumoEstado) return;

    try {
      const nuevoEstado =
        insumoEstado.estado === "activo" ? "inactivo" : "activo";

      const { error } = await supabase
        .from("Insumos")
        .update({ estado: nuevoEstado })
        .eq("id_insumo", insumoEstado.id_insumo);

      if (error) {
        console.error("Error al cambiar estado:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al cambiar estado del insumo.",
          tipo: "error",
        });

        return;
      }

      setMostrarModalEstado(false);

      setToast({
        mostrar: true,
        mensaje: `Insumo "${insumoEstado.nombre}" ${
          nuevoEstado === "activo" ? "activado" : "inactivado"
        } correctamente.`,
        tipo: "exito",
      });

      setInsumoEstado(null);
      await cargarInsumos();
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
            <i className="bi-box-seam-fill me-2"></i> Insumos
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Insumo</span>
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
            placeholder="Buscar por nombre, unidad, costo o stock..."
          />
        </Col>
      </Row>

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando insumos...</p>
          </Col>
        </Row>
      )}

      {!cargando &&
        !buscando &&
        textoBusqueda.trim() &&
        insumosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No se encontraron insumos que coincidan con "{textoBusqueda}".
          </Alert>
        )}

      {!cargando &&
        !buscando &&
        !textoBusqueda.trim() &&
        insumosFiltrados.length === 0 && (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No hay insumos{" "}
            {filtroEstado === "activo" ? "activos" : "inactivos"}.
          </Alert>
        )}

      {!cargando && insumosPaginados.length > 0 && (
        <TarjetaInsumo
          insumos={insumosPaginados}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
          cambiarEstadoInsumo={abrirModalEstado}
        />
      )}

      <ModalRegistroInsumo
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoInsumo={nuevoInsumo}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarInsumo={agregarInsumo}
        limpiarInsumo={limpiarInsumo}
      />

      <ModalEdicionInsumo
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        insumoEditar={insumoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarInsumo={actualizarInsumo}
      />

      <ModalEliminacionInsumo
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarInsumo={eliminarInsumo}
        insumo={insumoAEliminar}
      />

      <ModalEstadoInsumo
        mostrarModalEstado={mostrarModalEstado}
        setMostrarModalEstado={setMostrarModalEstado}
        insumo={insumoEstado}
        cambiarEstadoInsumo={cambiarEstadoInsumo}
      />

      {insumosFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={insumosFiltrados.length}
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

export default Insumos;