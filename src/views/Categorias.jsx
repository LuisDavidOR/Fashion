import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../components/categorias/TablaCategorias";
import TarjetaCategoria from "../components/categorias/TarjetaCategoria";
import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
import ModalEstadoCategoria from "../components/categorias/ModalEstadoCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Categorias = () => {

  //Manejar notificaciones
  const [toast, setToast] = useState({mostrar: false, mensaje: "", tipo: ""});
  //Agregar categoria
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  //Visualizar categorias
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true); //Estado de carga inicial
  //Eliminar categoria
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  //Controlar el estado de categoria
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [categoriaEstado, setCategoriaEstado] = useState(null);
  //Actualizar categoria
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState({
    id_categoria: "",
    nombre: "",
    descripcion: "",
  });
  //Manejar busqueda y filtros
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("activo");
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  //Manejar filtrado y paginación
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const categoriasPaginadas = categoriasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  //limpiar codigo
  const limpiarCategoria = () => {
    setNuevaCategoria({
      nombre: "",
      descripcion: "",
    });
  };

  //UseEffect Principal
  useEffect(() => {
    cargarCategorias();
  }, []);

  //useEffect para la busqueda
  useEffect(() => {
    setBuscando(true);

    let resultado = categorias.filter(
      (cat) => cat.estado === filtroEstado
    );

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();

      resultado = resultado.filter(
        (cat) =>
          cat.nombre.toLowerCase().includes(textoLower) ||
          (cat.descripcion &&
            cat.descripcion.toLowerCase().includes(textoLower))
      );
    }

    setCategoriasFiltradas(resultado);

    setBuscando(false);
  }, [textoBusqueda, categorias, filtroEstado]);

  //useEffect para que siempre busque en la pagina 1 y busque todo
  useEffect(() => {
    establecerPaginaActual(1);
  }, [textoBusqueda, registrosPorPagina]);

  //Para agregar nueva categoría
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //para modificar con Edicion
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setCategoriaEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Abrir modal Edición
  const abrirModalEdicion = (categoria) => {
    setCategoriaEditar({
      id_categoria: categoria.id_categoria,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    });
    setMostrarModalEdicion(true);
  };

  //Abrir modal Eliminación
  const abrirModalEliminacion = (categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarModalEliminacion(true);
  };

  //Abrir modal Estado
  const abrirModalEstado = (categoria) => {
    setCategoriaEstado(categoria);
    setMostrarModalEstado(true);
  };

  //Cargar categorias ya sea en tabla o tarjeta
  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Categorias")
        .select("*")
        .order("id_categoria", { ascending: true});
        if (error) {
          console.error("Error al cargar categorías", error.message);
          setToast({
            mostrar: true,
            mensaje: "Error al cargar categorías.",
            tipo: "error",
          });
          return;
        }
        setCategorias(data || []);
    } catch (err) {
      console.error("Excepción al cargar categorías:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar categorías.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  //Agregar una categoria nueva
  const agregarCategoria = async () => {
    try {
      if (
        !nuevaCategoria.nombre.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe agregar el nombre de una categoría.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("Categorias"). insert([
        {
          nombre: nuevaCategoria.nombre,
          descripcion: nuevaCategoria.descripcion,
        },
      ]);

      if(error) {
        console.error("Error al agregar categoría: ", error.message);
        setToast({
          mostrar:true,
          mensaje: "Error al registrar categoría.",
          tipo: "error",
        });
        return;
      }

      //Éxito
      setToast({
        mostrar: true,
        mensaje: `Categoría "${nuevaCategoria.nombre}" registrada exitosamente.`,
        tipo: "exito",
      });

      //Limpiar formulario y cerrar modal
      setNuevaCategoria({ nombre: "", descripcion: ""});
      await cargarCategorias();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al agregar categoría: ", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar categoría.",
        tipo: "error",
      });
    }
  };

  //Actualizar una categoría existente
  const actualizarCategoria = async () => {
    try {
      if (
        !categoriaEditar.nombre.trim()
      ) {
        setToast({
          mostrar:true,
          mensaje: "Debe agregar un nombre de categoría.",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      const { error } = await supabase
        .from("Categorias")
        .update({
          nombre: categoriaEditar.nombre,
          descripcion: categoriaEditar.descripcion,
        })
        .eq("id_categoria", categoriaEditar.id_categoria);

        if (error) {
          console.error("Error al actualizar categoría:", error.message);
          setToast({
            mostrar: true,
            mensaje: `Error al actualizar la categoría ${categoriaEditar.nombre}.`,
            tipo: "error",
          });
          return;
        }

        await cargarCategorias();
        setToast({
          mostrar: true,
          mensaje: `Categoría ${categoriaEditar.nombre} actualizada exitosamente.`,
          tipo: "exito",
        });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar categoría.",
        tipo: "error",
      });
      console.error("Excepción al actualizar categoría: ", err.message);
    }
  };

  //Eliminar una categoría existente
  const eliminarCategoria = async () => {
    if (!categoriaAEliminar) return;
    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("Categorias")
        .delete()
        .eq("id_categoria", categoriaAEliminar.id_categoria);
      
      if (error) {
        console.error("Error al eliminar categoría: ", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar la categoría ${categoriaAEliminar.nombre}.`,
          tipo: "error",
        });
        return;
      }
      
      await cargarCategorias();
      setToast({
        mostrar: true,
        mensaje: `Categoría ${categoriaAEliminar.nombre} eliminada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast ({
        mostrar: true,
        mensaje: "Error inesperado al eliminar categoría.",
        tipo: "error",
      });
      console.error("Excepción al eliminar categoría: ", err.message);
    }
  };

  //Cambiar el estado de una categoría Activo/Inactivo
  const cambiarEstadoCategoria = async () => {
    if (!categoriaEstado) return;

    try {
      const nuevoEstado =
        categoriaEstado.estado === "activo" ? "inactivo" : "activo";

      const { error } = await supabase
        .from("Categorias")
        .update({ estado: nuevoEstado })
        .eq("id_categoria", categoriaEstado.id_categoria);

      if (error) {
        console.error("Error al cambiar estado:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cambiar el estado de la categoría.",
          tipo: "error",
        });
        return;
      }

      setMostrarModalEstado(false);

      setToast({
        mostrar: true,
        mensaje: `Categoría "${categoriaEstado.nombre}" ${
          nuevoEstado === "activo" ? "activada" : "inactivada"
        } correctamente.`,
        tipo: "exito",
      });

      setCategoriaEstado(null);
      await cargarCategorias();
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
            <i className="bi-bookmark-plus-fill me-2"></i> Categorías
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-ms-inline ms-2">Nueva Categoría</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Botones para activar/inactivar */}
      <div className="d-flex gap-2 mb-3">
        <Button
          className={filtroEstado === "activo" ? "btn-activas" : "btn-inactivas"}
          onClick={() => {
            setFiltroEstado("activo");
            establecerPaginaActual(1);
          }}
        >
          Activas
        </Button>

        <Button
          className={filtroEstado === "inactivo" ? "btn-activas" : "btn-inactivas"}
          onClick={() => {
            setFiltroEstado("inactivo");
            establecerPaginaActual(1);
          }}
        >
          Inactivas
        </Button>
      </div>

      {/* Cuadro de búsqueda debajo de la línea divisoria */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre o descripción..."
          />
        </Col>
      </Row>

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando categorías...</p>
          </Col>
        </Row>
      )}

      {/* Mensaje de no coincidencias solo cuando hay búsqueda y no hay resultados */}
      {!cargando && !buscando && textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron categorías que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      {/* Mensaje cuando una tabla activa/inactiva de categoria esta vacia */}
      {!cargando && !buscando && !textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No hay categorías {filtroEstado === "activo" ? "activas" : "inactivas"}.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Lista de categorías cargadas */}
      <div className="contenedor-tabla-paginacion">
        {!cargando && categoriasPaginadas.length > 0 && (
          <Row>
            {/* Tarjeta para dispositivos moviles */}
            <Col xs={12} sm={12} md={12} className="d-lg-none">
              <TarjetaCategoria
                categorias={categoriasPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                cambiarEstadoCategoria={abrirModalEstado}
              />
            </Col>
            {/* Tabla para equipos de escritorio */}
            <Col lg={12} className="d-none d-lg-block">
              <TablaCategorias
                categorias={categoriasPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                cambiarEstadoCategoria={abrirModalEstado}
              />
            </Col>
          </Row>
        )}
      </div>
 
      {/* Modal para Agregar una categoría nueva */}
      <ModalRegistroCategoria 
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInput}
        agregarCategoria={agregarCategoria}
        limpiarCategoria={limpiarCategoria}
      />

      {/* Modal para editar una categoría */}
      <ModalEdicionCategoria
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        categoriaEditar={categoriaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCategoria={actualizarCategoria}
      />

      {/* Modal para eliminar una categoría */}
      <ModalEliminacionCategoria
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCategoria={eliminarCategoria}
        categoria={categoriaAEliminar}
      />

      {/* Modal para cambiar el estado de una categoría */}
      <ModalEstadoCategoria
        mostrarModalEstado={mostrarModalEstado}
        setMostrarModalEstado={setMostrarModalEstado}
        categoria={categoriaEstado}
        cambiarEstadoCategoria={cambiarEstadoCategoria}
      />

      {/* Paginación */}
      {categoriasFiltradas.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={categoriasFiltradas.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <NotificacionOperacion 
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false})}
      />
    </Container>
  )
}

export default Categorias;