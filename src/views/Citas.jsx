import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCita from "../components/citas/ModalRegistroCita";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCitas from "../components/citas/TablaCitas";

const Citas = () => {

  const [toast, setToast] = useState({mostrar: false, mensaje: "", tipo: ""});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    fecha: "",
    hora: "",
    id_cliente: "",
    id_empleado: "",
    estado_cita: "pendiente",
  });
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [detalleCita, setDetalleCita] = useState([]);
  const [citas, setCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);
  const [citaExpandida, setCitaExpandida] = useState(null);

  const limpiarCita = () => {
    setNuevaCita({
      fecha: "",
      hora: "",
      id_cliente: "",
      id_empleado: "",
      estado_cita: "pendiente",
    });

    setDetalleCita([]);
  };

  const cargarCitas = async () => {
      try {
        setCargandoCitas(true);

        const { data, error } = await supabase
          .from("Citas")
          .select(`
            id_cita,
            fecha,
            hora,
            estado_cita,
            Clientes (
              nombre,
              apellido
            ),
            Empleados (
              nombre,
              apellido
            ),
            Detalle_cita (
              id_detalle_cita,
              subtotal,
              costo_empleado,
              costo_insumo,
              Servicios (
                nombre,
                precio
              )
            )
          `)
          .order("fecha", { ascending: false })
          .order("hora", { ascending: false });

        if (error) {
          console.error("Error cargando citas:", error.message);
          setToast({
            mostrar: true,
            mensaje: "Error al cargar citas.",
            tipo: "error",
          });
          return;
        }

        setCitas(data || []);
      } catch (err) {
        console.error("Excepción al cargar citas:", err.message);
      } finally {
        setCargandoCitas(false);
      }
    };

  const cargarClientes = async () => {
    const { data, error } = await supabase
      .from("Clientes")
      .select("id_cliente, nombre, apellido")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando clientes:", error.message);
    } else {
      const ordenadas = data.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );

      setClientes(ordenadas);
    }
  };

  const cargarEmpleados = async () => {
    const { data, error } = await supabase
      .from("Empleados")
      .select("id_empleado, nombre, apellido")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando empleados:", error.message);
    } else {
      const ordenadas = data.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );

      setEmpleados(ordenadas);
    }
  };

  const cargarServicios = async () => {
    const { data, error } = await supabase
      .from("Servicios")
      .select("id_servicio, nombre, precio")
      .eq("estado", "activo")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando servicios:", error.message);
    } else {
      const ordenadas = data.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

      setServicios(ordenadas);
    }
  };

  useEffect(() => {
    cargarClientes();
    cargarEmpleados();
    cargarServicios();
    cargarCitas();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCita((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarServicioDetalle = (idServicio) => {
    const servicio = servicios.find(
      (serv) => String(serv.id_servicio) === String(idServicio)
    );

    if (!servicio) return;

    const yaExiste = detalleCita.some(
      (detalle) => String(detalle.id_servicio) === String(idServicio)
    );

    if (yaExiste) {
      setToast({
        mostrar: true,
        mensaje: "Este servicio ya fue agregado a la cita.",
        tipo: "advertencia",
      });
      return;
    }

    const subtotal = parseFloat(servicio.precio);

    setDetalleCita((prev) => [
      ...prev,
      {
        id_servicio: servicio.id_servicio,
        nombre: servicio.nombre,
        precio: subtotal,
        costo_empleado: 0,
        costo_insumo: 0,
        subtotal: subtotal,
      },
    ]);
  };

  const eliminarServicioDetalle = (idServicio) => {
    setDetalleCita((prev) =>
      prev.filter(
        (detalle) => String(detalle.id_servicio) !== String(idServicio)
      )
    );
  };

  const agregarCita = async () => {
    try {
      if (
        !nuevaCita.fecha.trim() ||
        !nuevaCita.hora.trim() ||
        !nuevaCita.id_cliente ||
        !nuevaCita.id_empleado
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      if (detalleCita.length === 0) {
        setToast({
          mostrar: true,
          mensaje: "Debe agregar al menos un servicio a la cita.",
          tipo: "advertencia",
        });
        return;
      }

      const { data: citaInsertada, error: errorCita } = await supabase
        .from("Citas")
        .insert([
          {
            fecha: nuevaCita.fecha,
            hora: nuevaCita.hora,
            id_cliente: nuevaCita.id_cliente,
            id_empleado: nuevaCita.id_empleado,
            estado_cita: nuevaCita.estado_cita,
          },
        ])
        .select("id_cita")
        .single();

      if (errorCita) {
        console.log("ERROR COMPLETO CITA:", errorCita);
        console.error("Error al agregar cita: ", errorCita.message);
        setToast({
          mostrar: true,
          mensaje: "Error al agendar cita.",
          tipo: "error",
        });
        return;
      }

      const detalles = detalleCita.map((item) => ({
        id_cita: citaInsertada.id_cita,
        id_servicio: item.id_servicio,
        costo_empleado: item.costo_empleado,
        costo_insumo: item.costo_insumo,
        subtotal: item.subtotal,
      }));

      const { error: errorDetalle } = await supabase
        .from("Detalle_cita")
        .insert(detalles);

      if (errorDetalle) {
      console.log("ERROR COMPLETO DETALLE:", errorDetalle);
      console.error("Error al agregar detalle de cita: ", errorDetalle.message);
        setToast({
          mostrar: true,
          mensaje: "La cita fue creada, pero ocurrió un error en el detalle.",
          tipo: "error",
        });
        return;
      }

      setToast({
        mostrar: true,
        mensaje: "La cita ha sido registrada exitosamente.",
        tipo: "exito",
      });

      limpiarCita();
      setMostrarModal(false);

      await cargarCitas();

    } catch (err) {
      console.error("Excepción al agregar cita: ", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar cita.",
        tipo: "error",
      });
    }
  };

  return (
    
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Citas
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-ms-inline ms-2">Nueva Cita</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {cargandoCitas ? (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Cargando citas...</p>
          </Col>
        </Row>
      ) : citas.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No hay citas registradas.
        </Alert>
      ) : (
        <TablaCitas
          citas={citas}
          citaExpandida={citaExpandida}
          setCitaExpandida={setCitaExpandida}
        />
      )}

      <ModalRegistroCita
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaCita={nuevaCita}
        manejoCambioInput={manejoCambioInput}
        agregarCita={agregarCita}
        limpiarCita={limpiarCita}
        clientes={clientes}
        empleados={empleados}
        servicios={servicios}
        detalleCita={detalleCita}
        agregarServicioDetalle={agregarServicioDetalle}
        eliminarServicioDetalle={eliminarServicioDetalle}
      />

      <NotificacionOperacion 
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false})}
      />
    </Container>
  )
}

export default Citas;