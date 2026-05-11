import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert, Modal } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import ModalRegistroCita from "../components/citas/ModalRegistroCita";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCitas from "../components/citas/TablaCitas";


const Citas = () => {

  const { usuario, rol, perfil } = useAuth();
  const navigate = useNavigate();
  const esAdmin = rol === "admin";
  const esCliente = rol === "cliente";
  const esEmpleado = rol === "empleado";
  const esInvitado = !usuario;
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
  const [mostrarModalAcceso, setMostrarModalAcceso] = useState(false);
  const [horariosNoDisponibles, setHorariosNoDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

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

      let consulta = supabase
        .from("Citas")
        .select(`
          id_cita,
          fecha,
          hora,
          estado_cita,
          id_cliente,
          id_empleado,
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
              precio,
              duracion
            )
          )
        `);

      if (esCliente && perfil?.id_cliente) {
        consulta = consulta.eq("id_cliente", perfil.id_cliente);
      }

      if (esEmpleado && perfil?.id_empleado) {
        consulta = consulta.or(
          `estado_cita.eq.pendiente,id_empleado.eq.${perfil.id_empleado}`
        );
      }

      const { data, error } = await consulta
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
      .select(`
        id_servicio,
        nombre,
        precio,
        duracion,
        url_imagen,
        Categorias (
          id_categoria,
          nombre
        ),
        Servicio_Insumo (
          cantidad_usada,
          Insumos (
            costo_producto,
            contenido_total
          )
        )
      `)
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

    if (esInvitado) {
      setCitas([]);
      setCargandoCitas(false);
      return;
    }

    if (rol && perfil !== undefined) {
      cargarCitas();
    }
  }, [rol, perfil, usuario]);

  useEffect(() => {
    calcularHorariosNoDisponibles();
  }, [
    nuevaCita.fecha,
    nuevaCita.id_cliente,
    perfil?.id_cliente,
  ]);

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

    const costoInsumo =
      servicio.Servicio_Insumo?.reduce((total, relacion) => {
        const insumo = relacion.Insumos;

        if (!insumo || !insumo.contenido_total) return total;

        const costoPorUnidad =
          Number(insumo.costo_producto) / Number(insumo.contenido_total);

        const costoUsado =
          costoPorUnidad * Number(relacion.cantidad_usada);

        return total + costoUsado;
      }, 0) || 0;

    const subtotal = parseFloat(servicio.precio);

    setDetalleCita((prev) => [
      ...prev,
      {
        id_servicio: servicio.id_servicio,
        nombre: servicio.nombre,
        precio: subtotal,
        duracion: Number(servicio.duracion || 0),
        url_imagen: servicio.url_imagen,
        categoria: servicio.Categorias?.nombre || "Sin categoría",
        costo_empleado: 0,
        costo_insumo: costoInsumo,
        subtotal: subtotal,
      }
    ]);
  };

  const eliminarServicioDetalle = (idServicio) => {
    setDetalleCita((prev) =>
      prev.filter(
        (detalle) => String(detalle.id_servicio) !== String(idServicio)
      )
    );
  };

  const abrirModalRegistroCita = () => {
    if (esInvitado) {
      setMostrarModalAcceso(true);
      return;
    }

    if (esEmpleado) {
      setToast({
        mostrar: true,
        mensaje: "Los empleados no pueden agendar citas desde esta vista.",
        tipo: "advertencia",
      });
      return;
    }

    setMostrarModal(true);
  };

  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const convertirHoraAMinutos = (hora) => {
    if (!hora) return 0;

    const partes = hora.split(":");
    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);

    return horas * 60 + minutos;
  };

  const calcularDuracionTotal = () => {
    return detalleCita.reduce(
      (total, item) => total + Number(item.duracion || 0),
      0
    );
  };

  const seCruzanHorarios = (inicioA, finA, inicioB, finB) => {
    return inicioA < finB && finA > inicioB;
  };

  const generarHorasBase = () => {
    const horas = [];

    for (let hora = 8; hora <= 19; hora++) {
      for (let minuto of [0, 30]) {
        horas.push(
          `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`
        );
      }
    }

    return horas;
  };

  const calcularHorariosNoDisponibles = async () => {
    if (!nuevaCita.fecha) {
      setHorariosNoDisponibles([]);
      return;
    }

    try {
      setCargandoHorarios(true);

      const horasBase = generarHorasBase();
      const fechaActual = obtenerFechaLocal();
      const ahora = new Date();
      const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

      const idClienteCita = esCliente
        ? perfil?.id_cliente
        : nuevaCita.id_cliente;

      const { count: totalEmpleadosActivos, error: errorEmpleados } =
        await supabase
          .from("Empleados")
          .select("*", { count: "exact", head: true })
          .eq("estado", "activo");

      if (errorEmpleados) {
        console.error("Error contando empleados activos:", errorEmpleados.message);
        return;
      }

      const { data: citasDelDia, error: errorCitas } = await supabase
        .from("Citas")
        .select(`
          id_cita,
          id_cliente,
          id_empleado,
          hora,
          estado_cita,
          Detalle_cita (
            Servicios (
              duracion
            )
          )
        `)
        .eq("fecha", nuevaCita.fecha)
        .in("estado_cita", ["pendiente", "aceptado"]);

      if (errorCitas) {
        console.error("Error cargando citas del día:", errorCitas.message);
        return;
      }

      const bloqueadas = horasBase.filter((hora) => {
        const inicioHora = convertirHoraAMinutos(hora);

        if (
          nuevaCita.fecha === fechaActual &&
          inicioHora < minutosActuales + 60
        ) {
          return true;
        }

        const clienteTieneCruce = citasDelDia.some((cita) => {
          if (String(cita.id_cliente) !== String(idClienteCita)) return false;

          const inicioExistente = convertirHoraAMinutos(cita.hora);

          const duracionExistente =
            cita.Detalle_cita?.reduce(
              (total, detalle) =>
                total + Number(detalle.Servicios?.duracion || 0),
              0
            ) || 30;

          const finExistente = inicioExistente + duracionExistente;

          return inicioHora >= inicioExistente && inicioHora < finExistente;
        });

        if (clienteTieneCruce) return true;

        const empleadosOcupados = new Set();

        citasDelDia.forEach((cita) => {
          if (cita.estado_cita !== "aceptado" || !cita.id_empleado) return;

          const inicioExistente = convertirHoraAMinutos(cita.hora);

          const duracionExistente =
            cita.Detalle_cita?.reduce(
              (total, detalle) =>
                total + Number(detalle.Servicios?.duracion || 0),
              0
            ) || 30;

          const finExistente = inicioExistente + duracionExistente;

          if (inicioHora >= inicioExistente && inicioHora < finExistente) {
            empleadosOcupados.add(cita.id_empleado);
          }
        });

        return empleadosOcupados.size >= Number(totalEmpleadosActivos || 0);
      });

      setHorariosNoDisponibles(bloqueadas);
    } catch (err) {
      console.error("Error calculando horarios:", err.message);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const validarFechaHoraCita = () => {
    const { fecha, hora } = nuevaCita;

    if (!fecha || !hora) {
      setToast({
        mostrar: true,
        mensaje: "Debe seleccionar fecha y hora.",
        tipo: "advertencia",
      });
      return false;
    }

    const fechaActual = obtenerFechaLocal();

    if (fecha < fechaActual) {
      setToast({
        mostrar: true,
        mensaje: "No puedes agendar una cita en una fecha pasada.",
        tipo: "advertencia",
      });
      return false;
    }

    const ahora = new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
    const minutosSeleccionados = convertirHoraAMinutos(hora);

    if (fecha === fechaActual && minutosSeleccionados < minutosActuales + 60) {
      setToast({
        mostrar: true,
        mensaje:
          "Debes agendar con al menos 1 hora de anticipación.",
        tipo: "advertencia",
      });
      return false;
    }

    return true;
  };

  const validarCruceCliente = async (idClienteCita) => {
    const duracionNueva = calcularDuracionTotal();
    const inicioNueva = convertirHoraAMinutos(nuevaCita.hora);
    const finNueva = inicioNueva + duracionNueva;

    const { data, error } = await supabase
      .from("Citas")
      .select(`
        id_cita,
        hora,
        Detalle_cita (
          Servicios (
            duracion
          )
        )
      `)
      .eq("id_cliente", idClienteCita)
      .eq("fecha", nuevaCita.fecha)
      .in("estado_cita", ["pendiente", "aceptado"]);

    if (error) {
      console.error("Error validando citas del cliente:", error.message);

      setToast({
        mostrar: true,
        mensaje: "Error al validar tus citas existentes.",
        tipo: "error",
      });

      return false;
    }

    const existeCruce = data.some((cita) => {
      const inicioExistente = convertirHoraAMinutos(cita.hora);

      const duracionExistente =
        cita.Detalle_cita?.reduce(
          (total, detalle) =>
            total + Number(detalle.Servicios?.duracion || 0),
          0
        ) || 30;

      const finExistente = inicioExistente + duracionExistente;

      return seCruzanHorarios(
        inicioNueva,
        finNueva,
        inicioExistente,
        finExistente
      );
    });

    if (existeCruce) {
      setToast({
        mostrar: true,
        mensaje: "Ya tienes una cita registrada en ese rango de horario.",
        tipo: "advertencia",
      });

      return false;
    }

    return true;
  };

  const agregarCita = async () => {
    try {
      if (esInvitado) {
        setMostrarModalAcceso(true);
        return;
      }

      if (!esAdmin && !esCliente) {
        setToast({
          mostrar: true,
          mensaje: "No tienes permisos para agendar citas.",
          tipo: "advertencia",
        });
        return;
      }

      if (!validarFechaHoraCita()) {
        return;
      }

      if (esAdmin && (!nuevaCita.id_cliente || !nuevaCita.id_empleado)) {
        setToast({
          mostrar: true,
          mensaje: "Debe seleccionar cliente y empleado.",
          tipo: "advertencia",
        });
        return;
      }

      if (esCliente && !perfil?.id_cliente) {
        setToast({
          mostrar: true,
          mensaje: "No se encontró el cliente asociado a tu cuenta.",
          tipo: "error",
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

      const idClienteCita = esCliente
        ? perfil.id_cliente
        : nuevaCita.id_cliente;

      const cruceClienteValido = await validarCruceCliente(idClienteCita);

      if (!cruceClienteValido) {
        return;
      }

      if (horariosNoDisponibles.includes(nuevaCita.hora)) {
        setToast({
          mostrar: true,
          mensaje: "Ese horario no está disponible. Selecciona otra hora.",
          tipo: "advertencia",
        });

        return;
      }

      const idEmpleadoCita = esCliente
        ? null
        : nuevaCita.id_empleado || null;

      const estadoCita = esCliente
        ? "pendiente"
        : nuevaCita.estado_cita;

      const { data: citaInsertada, error: errorCita } = await supabase
        .from("Citas")
        .insert([
          {
            fecha: nuevaCita.fecha,
            hora: nuevaCita.hora,
            id_cliente: idClienteCita,
            id_empleado: idEmpleadoCita,
            estado_cita: estadoCita,
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

  const tituloVista = esAdmin
    ? "Gestión de citas"
    : esCliente
      ? "Mis citas"
      : esEmpleado
        ? "Citas disponibles"
        : "Agenda tu cita";

  const descripcionSinCitas = esAdmin
  ? "No hay citas registradas."
  : esCliente
    ? "Aún no tienes citas registradas."
    : esEmpleado
      ? "No hay citas pendientes o asignadas."
      : "Inicia sesión para agendar y dar seguimiento a tus citas.";

  const puedeCrearCita = esAdmin || esCliente || esInvitado;

  return (
    
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-calendar-check-fill me-2"></i>
            {tituloVista}
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          {puedeCrearCita && (
            <Button
              onClick={abrirModalRegistroCita}
              size="md"
            >
              <i className="bi-plus-lg"></i>
              <span className="d-none d-sm-inline ms-2">
                {esInvitado || esCliente ? "Agendar cita" : "Nueva Cita"}
              </span>
            </Button>
          )}
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
          {descripcionSinCitas}
        </Alert>
      ) : (
        <TablaCitas
          citas={citas}
          citaExpandida={citaExpandida}
          setCitaExpandida={setCitaExpandida}
        />
      )}

      <ModalRegistroCita
        rol={rol}
        esAdmin={esAdmin}
        esCliente={esCliente}
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
        horariosNoDisponibles={horariosNoDisponibles}
        cargandoHorarios={cargandoHorarios}
      />

      <Modal
        show={mostrarModalAcceso}
        onHide={() => setMostrarModalAcceso(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Inicia sesión para continuar</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-0">
            Para agendar una cita necesita iniciar sesión o registrarse en el sistema.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setMostrarModalAcceso(false)}
          >
            Cancelar
          </Button>

          <Button
            style={{
              backgroundColor: "#7A564A",
              borderColor: "#7A564A",
            }}
            onClick={() => {
              setMostrarModalAcceso(false);
              navigate("/login");
            }}
          >
            Iniciar sesión
          </Button>
        </Modal.Footer>
      </Modal>

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