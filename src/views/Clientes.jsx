import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCliente from "../components/clientes/ModalRegistroCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaClientes from "../components/clientes/TablaClientes";
import TarjetaCliente from "../components/clientes/TarjetaCliente";
import ModalEdicionCliente from "../components/clientes/ModalEdicionCliente.jsx";
import ModalEliminacionCliente from "../components/clientes/ModalEliminacionCliente";
import ModalEstadoCliente from "../components/clientes/ModalEstadoCliente";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Clientes = () => {
  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
  });

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [clienteEstado, setClienteEstado] = useState(null);

  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [clienteEditar, setClienteEditar] = useState({
    id_cliente: "",
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
  });

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("activo");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const limpiarCliente = () => {
    setNuevoCliente({
      nombre: "",
      apellido: "",
      telefono: "",
      correo: "",
    });
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    setBuscando(true);

    let resultado = clientes.filter(
      (cliente) => cliente.estado === filtroEstado
    );

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();

      resultado = resultado.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(textoLower) ||
          cliente.apellido.toLowerCase().includes(textoLower) ||
          cliente.telefono.toLowerCase().includes(textoLower) ||
          cliente.correo.toLowerCase().includes(textoLower)
      );
    }

    setClientesFiltrados(resultado);
    setBuscando(false);
  }, [textoBusqueda, clientes, filtroEstado]);

  useEffect(() => {
    establecerPaginaActual(1);
  }, [textoBusqueda, registrosPorPagina]);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;

    setNuevoCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;

    setClienteEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const abrirModalEdicion = (cliente) => {
    setClienteEditar({
      id_cliente: cliente.id_cliente,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      correo: cliente.correo,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminacion(true);
  };

  const abrirModalEstado = (cliente) => {
    setClienteEstado(cliente);
    setMostrarModalEstado(true);
  };

  const cargarClientes = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("Clientes")
        .select("*")
        .order("id_cliente", { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al cargar clientes.",
          tipo: "error",
        });

        return;
      }

      setClientes(data || []);
    } catch (err) {
      console.error("Excepción al cargar clientes:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar clientes.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const validarCorreo = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const agregarCliente = async () => {
    try {
      if (
        !nuevoCliente.nombre.trim() ||
        !nuevoCliente.apellido.trim() ||
        !nuevoCliente.telefono.trim() ||
        !nuevoCliente.correo.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar todos los campos del cliente.",
          tipo: "advertencia",
        });

        return;
      }

      if (!validarCorreo(nuevoCliente.correo)) {
        setToast({
          mostrar: true,
          mensaje: "Debe ingresar un correo válido.",
          tipo: "advertencia",
        });

        return;
      }

      const { error } = await supabase.from("Clientes").insert([
        {
          nombre: nuevoCliente.nombre.trim(),
          apellido: nuevoCliente.apellido.trim(),
          telefono: nuevoCliente.telefono.trim(),
          correo: nuevoCliente.correo.trim(),
        },
      ]);

      if (error) {
        console.error("Error al registrar cliente:", error.message);

        if (error.code === "23505") {
          setToast({
            mostrar: true,
            mensaje: "Ya existe un cliente registrado con ese correo.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: "Error al registrar cliente.",
          tipo: "error",
        });

        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Cliente "${nuevoCliente.nombre} ${nuevoCliente.apellido}" registrado exitosamente.`,
        tipo: "exito",
      });

      limpiarCliente();
      await cargarClientes();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al registrar cliente:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar cliente.",
        tipo: "error",
      });
    }
  };

  const actualizarCliente = async () => {
    try {
      if (
        !clienteEditar.nombre.trim() ||
        !clienteEditar.apellido.trim() ||
        !clienteEditar.telefono.trim() ||
        !clienteEditar.correo.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar todos los campos del cliente.",
          tipo: "advertencia",
        });

        return;
      }

      if (!validarCorreo(clienteEditar.correo)) {
        setToast({
          mostrar: true,
          mensaje: "Debe ingresar un correo válido.",
          tipo: "advertencia",
        });

        return;
      }

      setMostrarModalEdicion(false);

      const { error } = await supabase
        .from("Clientes")
        .update({
          nombre: clienteEditar.nombre.trim(),
          apellido: clienteEditar.apellido.trim(),
          telefono: clienteEditar.telefono.trim(),
          correo: clienteEditar.correo.trim(),
        })
        .eq("id_cliente", clienteEditar.id_cliente);

      if (error) {
        console.error("Error al actualizar cliente:", error.message);

        if (error.code === "23505") {
          setToast({
            mostrar: true,
            mensaje: "Ya existe otro cliente registrado con ese correo.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: `Error al actualizar el cliente ${clienteEditar.nombre}.`,
          tipo: "error",
        });

        return;
      }

      await cargarClientes();

      setToast({
        mostrar: true,
        mensaje: `Cliente ${clienteEditar.nombre} ${clienteEditar.apellido} actualizado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al actualizar cliente:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar cliente.",
        tipo: "error",
      });
    }
  };

  const eliminarCliente = async () => {
    if (!clienteAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("Clientes")
        .delete()
        .eq("id_cliente", clienteAEliminar.id_cliente);

      if (error) {
        console.error("Error al eliminar cliente:", error.message);

        if (error.code === "23503") {
          setToast({
            mostrar: true,
            mensaje:
              "No se puede eliminar este cliente porque tiene registros relacionados.",
            tipo: "advertencia",
          });

          return;
        }

        setToast({
          mostrar: true,
          mensaje: `Error al eliminar el cliente ${clienteAEliminar.nombre}.`,
          tipo: "error",
        });

        return;
      }

      await cargarClientes();

      setToast({
        mostrar: true,
        mensaje: `Cliente ${clienteAEliminar.nombre} ${clienteAEliminar.apellido} eliminado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error("Excepción al eliminar cliente:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar cliente.",
        tipo: "error",
      });
    }
  };

  const cambiarEstadoCliente = async () => {
    if (!clienteEstado) return;

    try {
      const nuevoEstado =
        clienteEstado.estado === "activo" ? "inactivo" : "activo";

      const { error } = await supabase
        .from("Clientes")
        .update({ estado: nuevoEstado })
        .eq("id_cliente", clienteEstado.id_cliente);

      if (error) {
        console.error("Error al cambiar estado del cliente:", error.message);

        setToast({
          mostrar: true,
          mensaje: "Error al cambiar el estado del cliente.",
          tipo: "error",
        });

        return;
      }

      setMostrarModalEstado(false);

      setToast({
        mostrar: true,
        mensaje: `Cliente "${clienteEstado.nombre} ${clienteEstado.apellido}" ${
          nuevoEstado === "activo" ? "activado" : "inactivado"
        } correctamente.`,
        tipo: "exito",
      });

      setClienteEstado(null);
      await cargarClientes();
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
            <i className="bi-people-fill me-2"></i> Clientes
          </h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Cliente</span>
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
            placeholder="Buscar por nombre, apellido, teléfono o correo..."
          />
        </Col>
      </Row>

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando clientes...</p>
          </Col>
        </Row>
      )}

      {!cargando &&
        !buscando &&
        textoBusqueda.trim() &&
        clientesFiltrados.length === 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="info" className="text-center">
                <i className="bi bi-info-circle me-2"></i>
                No se encontraron clientes que coincidan con "{textoBusqueda}".
              </Alert>
            </Col>
          </Row>
        )}

      {!cargando &&
        !buscando &&
        !textoBusqueda.trim() &&
        clientesFiltrados.length === 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="info" className="text-center">
                <i className="bi bi-info-circle me-2"></i>
                No hay clientes{" "}
                {filtroEstado === "activo" ? "activos" : "inactivos"}.
              </Alert>
            </Col>
          </Row>
        )}

      <div className="contenedor-tabla-paginacion">
        {!cargando && clientesPaginados.length > 0 && (
          <Row>
            <Col xs={12} sm={12} md={12} className="d-lg-none">
              <TarjetaCliente
                clientes={clientesPaginados}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                cambiarEstadoCliente={abrirModalEstado}
              />
            </Col>

            <Col lg={12} className="d-none d-lg-block">
              <TablaClientes
                clientes={clientesPaginados}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                cambiarEstadoCliente={abrirModalEstado}
              />
            </Col>
          </Row>
        )}
      </div>

      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
        limpiarCliente={limpiarCliente}
      />

      <ModalEdicionCliente
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        clienteEditar={clienteEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCliente={actualizarCliente}
      />

      <ModalEliminacionCliente
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCliente={eliminarCliente}
        cliente={clienteAEliminar}
      />

      <ModalEstadoCliente
        mostrarModalEstado={mostrarModalEstado}
        setMostrarModalEstado={setMostrarModalEstado}
        cliente={clienteEstado}
        cambiarEstadoCliente={cambiarEstadoCliente}
      />

      {clientesFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={clientesFiltrados.length}
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

export default Clientes;