import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../database/supabaseconfig";
import NotificacionOperacion from "../NotificacionOperacion";
import ChatIA from "../ia/ChatIA";


const Encabezado = () => {

  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarChatIA, setMostrarChatIA] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); //Para detectar la ruta actual

  const { usuario, rol, perfil, cerrarSesion } = useAuth();

  const esAdmin = usuario && rol === "admin";
  const esCliente = usuario && rol === "cliente";
  const esEmpleado = usuario && rol === "empleado";
  const esInvitado = !usuario;

  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [toastNotification, setToastNotification] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [citasAceptadasCliente, setCitasAceptadasCliente] = useState([]);
  const [hayNotificacionNueva, setHayNotificacionNueva] = useState(false);
  const [notificacionesEmpleadoLocal, setNotificacionesEmpleadoLocal] = useState([]);
  const [notificacionServicioNuevo, setNotificacionServicioNuevo] = useState(null);

  const cargarNotificacionesEmpleadoLocal = () => {
  if (!esEmpleado || !perfil?.id_empleado) return;

  const guardadas =
    JSON.parse(localStorage.getItem("notificacionesEmpleado")) || [];

  const propias = guardadas.filter(
    (noti) => String(noti.id_empleado) === String(perfil.id_empleado)
  );

  setNotificacionesEmpleadoLocal(propias);
};

  const cargarCitasAceptadasCliente = async () => {
      try {
        if (!usuario || rol !== "cliente") return;

        const { data: usuarioActual, error: errorUsuario } = await supabase
          .from("Usuarios")
          .select("id_cliente")
          .eq("auth_id", usuario.id)
          .single();

        if (errorUsuario || !usuarioActual?.id_cliente) return;

        const { data, error } = await supabase
          .from("Citas")
          .select(`
            id_cita,
            fecha,
            hora,
            Empleados (nombre, apellido),
            Detalle_cita (
              Servicios (nombre)
            )
          `)
          .eq("id_cliente", usuarioActual.id_cliente)
          .eq("estado_cita", "aceptado")
          .order("id_cita", { ascending: false });

        if (error) throw error;

        setCitasAceptadasCliente(data || []);
      } catch (err) {
        console.error("Error al cargar citas aceptadas del cliente:", err);
      }
    };

    const cargarNotificacionServicioNuevo = async () => {
      if (!esCliente || !usuario) return;

      const { data, error } = await supabase
        .from("Servicios")
        .select("id_servicio, nombre")
        .eq("estado", "activo")
        .order("id_servicio", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        setNotificacionServicioNuevo(null);
        return;
      }

      setNotificacionServicioNuevo({
        id: `servicio-${data.id_servicio}`,
        tipo: "servicio_nuevo",
        id_servicio: data.id_servicio,
        titulo: "Nuevo servicio disponible",
        mensaje: `Ya está disponible el servicio ${data.nombre}.`,
        fecha: new Date().toISOString(),
      });
    };

  const cargarCitasPendientes = async () => {
      try {
        const { data, error } = await supabase
          .from("Citas")
          .select(`
            id_cita,
            fecha,
            hora,
            Clientes (nombre, apellido),
            Detalle_cita (
              Servicios (nombre)
            )
          `)
          .eq("estado_cita", "pendiente")
          .is("id_empleado", null)
          .order("id_cita", { ascending: false });

        if (error) throw error;

        setCitasPendientes(data || []);
      } catch (err) {
        console.error("Error al cargar citas pendientes:", err);
      }
    };

  useEffect(() => {
  if (!usuario) {
    setCitasPendientes([]);
    setCitasAceptadasCliente([]);
    setMostrarNotificaciones(false);
    return;
  }

  if (rol === "admin" || rol === "empleado") {
    cargarCitasPendientes();
  }

  if (rol === "empleado") {
    cargarNotificacionesEmpleadoLocal();
  }

  if (rol === "cliente") {
    cargarCitasAceptadasCliente();
    cargarNotificacionServicioNuevo();
  }

  const canal = supabase
    .channel("citas-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Citas" },
      () => {
        if (rol === "admin" || rol === "empleado") {
            cargarCitasPendientes();
          }

          if (rol === "empleado") {
            cargarNotificacionesEmpleadoLocal();
          }

        if (rol === "cliente") {
          cargarCitasAceptadasCliente();
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Sistema de notificaciones de citas conectado.");
      } else if (status === "CHANNEL_ERROR") {
        console.error("Error al conectar el canal de notificaciones.");
        setToastNotification({
          mostrar: true,
          mensaje: "Error al conectar el sistema de notificaciones en tiempo real.",
          tipo: "error",
        });
      }
    });

  return () => {
    supabase.removeChannel(canal);
  };
}, [usuario, rol, perfil]);

 const notificacionesActuales = esCliente
  ? [
      ...(notificacionServicioNuevo ? [notificacionServicioNuevo] : []),
      ...citasAceptadasCliente,
    ]
  : esEmpleado
    ? [...notificacionesEmpleadoLocal, ...citasPendientes]
    : citasPendientes;

  const tituloNotificaciones = "Notificaciones";

  const mensajeSinNotificaciones = "Sin actividad reciente.";

  const obtenerUltimoIdNotificacion = () => {
  if (!notificacionesActuales || notificacionesActuales.length === 0) {
    return null;
  }

  const ultima = notificacionesActuales[0];

  if (esCliente) {
    return `${ultima.id_cita}-${ultima.fecha}-${ultima.hora}-${ultima.Empleados?.nombre || "sin-empleado"}`;
  }

  return ultima.id || ultima.id_cita;
};

useEffect(() => {
  if (!usuario || !rol) return;

  const ultimoId = obtenerUltimoIdNotificacion();

  if (!ultimoId) {
    setHayNotificacionNueva(false);
    return;
  }

  const claveStorage = `ultimaNotificacionVista_${usuario.id}_${rol}`;
  const ultimoIdVisto = localStorage.getItem(claveStorage);

  if (String(ultimoId) !== String(ultimoIdVisto)) {
    setHayNotificacionNueva(true);
  } else {
    setHayNotificacionNueva(false);
  }
}, [notificacionesActuales, usuario, rol]);

  const manejarToggle = () => {
  const nuevoEstado = !mostrarMenu;
  setMostrarMenu(nuevoEstado);

  if (nuevoEstado) {
    document.body.classList.add("menu-abierto");
  } else {
    document.body.classList.remove("menu-abierto");
  }
};

  const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
    document.body.classList.remove("menu-abierto");
  };

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    setMostrarMenu(false);
    document.body.classList.remove("menu-abierto");
    navigate("/login");
  };

  //Detectar rutas especiales
  const esRutaAuth = [
    "/login",
    "/registro",
    "/recuperar-credenciales",
    "/restablecer-password",
  ].includes(location.pathname);

  //Contenido del menú
  let contenidoMenu;

  if (esRutaAuth) {
    contenidoMenu = null;
  }
  else if (esInvitado) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">

        <Nav.Link
        onClick={() => manejarNavegacion("/")}
        className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
      >
        {!esAdmin && (
          <i className="bi-house-fill me-2"></i>
        )}

        <strong>Inicio</strong>
      </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          <i className="bi-grid-fill me-2"></i>
          <strong>Catálogo</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/citas")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
           <i className="bi-person-fill-lock me-2"></i>
          <strong>Agendar cita</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          <i className="bi-person-fill-lock me-2"></i>
          <strong>Iniciar sesión</strong>
        </Nav.Link>

      </Nav>
    );
  } else {
    contenidoMenu = (
      <>
        <Nav className="ms-auto pe-2">
          <Nav.Link
          onClick={() => manejarNavegacion("/")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {!esAdmin && (
            <i className="bi-house-fill me-2"></i>
          )}

          <strong>Inicio</strong>
        </Nav.Link>


          {esAdmin && (
            <>
              <Nav.Link
                onClick={() => manejarNavegacion("/categorias")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                
                <strong>Categorías</strong>
              </Nav.Link>


              <Nav.Link
                onClick={() => manejarNavegacion("/servicios")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                
                <strong>Servicios</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/clientes")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
               
                <strong>Clientes</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/empleados")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
               
                <strong>Empleados</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/insumos")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                
                <strong>Insumos</strong>
              </Nav.Link>
            </>
          )}

          {(esAdmin || esCliente || esEmpleado) && (
          <Nav.Link
            onClick={() => manejarNavegacion("/citas")}
            className={
              mostrarMenu
                ? "navbar-fashion-link-offcanvas"
                : "navbar-fashion-link"
            }
          >
            {!esAdmin && (
              <i className="bi-calendar-check-fill me-2"></i>
            )}

            <strong>
              {esCliente ? "Mis Citas" : "Citas"}
            </strong>
          </Nav.Link>
        )}

          <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {!esAdmin && (
            <i className="bi-grid-fill me-2"></i>
          )}

          <strong>Catálogo</strong>
        </Nav.Link>

          {(esCliente || esEmpleado) && (
            <Nav.Link
              onClick={() => manejarNavegacion("/perfil")}
              className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
            >
              <i className="bi-person-circle me-2"></i>
              <strong>Perfil</strong>
            </Nav.Link>
          )}

        {!mostrarMenu && (
        <Nav.Link
          onClick={manejarCerrarSesion}
          className="navbar-fashion-link"
        >
          <i className={`bi-box-arrow-right ${esCliente || esEmpleado ? "me-2" : ""}`}></i>

          {(esCliente || esEmpleado) && (
            <strong>Salir</strong>
          )}
        </Nav.Link>
      )}
      </Nav>
      {mostrarMenu && usuario && (
        <div className="mt-3 px-3">
          <button
            className="btn btn-outline-danger w-100"
            onClick={manejarCerrarSesion}
          >
            <i className="bi-box-arrow-right me-2"></i>
            Cerrar sesión
          </button>
        </div>
      )}
      </>
    );
  }

  const formatearFechaNotificacion = (fecha) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleDateString("es-NI", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatearHoraNotificacion = (fecha) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };



  console.log(notificacionesActuales);

  return (
    <>
      <Navbar expand="md" fixed="top" className="navbar-fashion shadow-sm" variant="dark">
        <Container>

          <Navbar.Brand
            onClick={() => manejarNavegacion(usuario ? "/" : "/catalogo")}
            className="navbar-fashion-brand d-flex align-items-center ms-2"
            style={{cursor: "pointer"}}
          >
            
            <img
              alt="Logo Fashion"
              src={logo}
              width="42"
              height="42"
              className="d-inline-block me-2"
              style={{
                objectFit: "contain",
                borderRadius: "10px",
              }}
            />
            
              <h4 className="mb-0 navbar-fashion-title">
                Salón Fashion
              </h4>
          </Navbar.Brand>

          {/* Campana de Notificaciones (para admin y empleado) */}
          {(esAdmin || esEmpleado || esCliente) && (
            <div className="nav-item-notificaciones position-relative align-self-center ms-auto me-3">
              <button
                className="btn btn-link text-white p-0 position-relative d-flex align-items-center"
                onClick={() => {
                  const nuevoEstado = !mostrarNotificaciones;
                  setMostrarNotificaciones(nuevoEstado);

                  if (nuevoEstado) {
                    const ultimoId = obtenerUltimoIdNotificacion();

                    if (ultimoId) {
                      const claveStorage = `ultimaNotificacionVista_${usuario.id}_${rol}`;
                      localStorage.setItem(claveStorage, String(ultimoId));
                    }

                    setHayNotificacionNueva(false);
                  }
                }}
                style={{ textDecoration: "none", border: "none", background: "none" }}
              >
                <i className={`bi bi-bell-fill icono-campana-notificacion ${
                    notificacionesActuales.length > 0 ? "campana-activa" : ""}`}></i>
                {hayNotificacionNueva && (
                  <span className="badge-notificacion position-absolute top-0 start-100 translate-middle">
                    1
                  </span>
                )}
              </button>

              {mostrarNotificaciones && (
                <div className="dropdown-notificaciones text-dark position-absolute end-0 mt-2">
                  <h6 className="fw-bold border-bottom pb-2 mb-2 d-flex justify-content-between align-items-center text-dark">
                    {tituloNotificaciones}
                    {hayNotificacionNueva && (
                        <span className="badge bg-danger text-white">1</span>
                      )}
                  </h6>
                  <div
                      className="notificaciones-lista"
                      style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        overscrollBehavior: "contain",
                      }}
                    >
                    {notificacionesActuales.length === 0 ? (
                      <div className="text-center py-3 text-muted small">
                        {mensajeSinNotificaciones}
                      </div>
                    ) : (
                      notificacionesActuales.map((cita) => {
                        const esNotificacionLocal =
                        cita.tipo === "cita_cancelada" ||
                        cita.tipo === "cita_reagendada" ||
                        cita.tipo === "servicio_nuevo";

                      const serviciosNombres = cita.Detalle_cita?.map(
                        (d) => d.Servicios?.nombre
                      ).filter(Boolean).join(", ") || "Sin servicios";

                        return (
                          <div
                              key={cita.id || cita.id_cita}
                              className="notificacion-item"
                              onClick={() => {
                                setMostrarNotificaciones(false);

                                if (cita.tipo === "servicio_nuevo") {
                                localStorage.setItem(
                                  `ultimoServicioVisto_${usuario.id}`,
                                  String(cita.id_servicio)
                                );

                                setHayNotificacionNueva(false);
                                navigate("/catalogo");
                                return;
                              }

                                navigate(`/citas?id_cita=${cita.id_cita}`);
                              }}
                            >
                            <div className="small fw-bold text-dark">
                              {esNotificacionLocal
                              ? cita.titulo
                              : esCliente
                                ? cita.Empleados
                                  ? `Tu cita fue aceptada por ${cita.Empleados.nombre}`
                                  : "Actualización de cita"
                                : cita.Clientes
                                  ? `${cita.Clientes.nombre} ${cita.Clientes.apellido}`
                                  : "Cliente"}
                            </div>
                           <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {esNotificacionLocal ? cita.mensaje : serviciosNombres}
                            </div>
                            <div className="text-muted d-flex justify-content-between mt-1" style={{ fontSize: "0.7rem" }}>
                              <span>
                              <i className="bi bi-calendar-event me-1"></i>
                              {formatearFechaNotificacion(cita.fecha)}
                            </span>

                            <span>
                              <i className="bi bi-clock me-1"></i>
                              {cita.tipo === "servicio_nuevo"
                                ? formatearHoraNotificacion(cita.fecha)
                                : new Date(`2000-01-01T${cita.hora}`).toLocaleTimeString(
                                    "es-NI",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                            </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón del menú */}
          {!esRutaAuth && (
            <Navbar.Toggle
            aria-controls="menu-offcanvas"
            onClick={manejarToggle}
            className="toggle-fashion-menu"
          />
          )}

          {/*Menú lateral */}
          <Navbar.Offcanvas
            id="menu-offcanvas"
            placement="end"
            show={mostrarMenu}
           onHide={() => {
            setMostrarMenu(false);
            document.body.classList.remove("menu-abierto");
          }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menú Fashion</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
              {contenidoMenu}
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      {esAdmin && !esRutaAuth && (
        <button
          className="boton-ia-flotante"
          onClick={() => setMostrarChatIA(true)}
        >
          <i className="bi bi-robot"></i>
        </button>
      )}

      {esAdmin && (
        <ChatIA
          mostrar={mostrarChatIA}
          onCerrar={() => setMostrarChatIA(false)}
        />
      )}

      <NotificacionOperacion
        mostrar={toastNotification.mostrar}
        mensaje={toastNotification.mensaje}
        tipo={toastNotification.tipo}
        onCerrar={() => setToastNotification({ ...toastNotification, mostrar: false })}
      />
    </>
  );
}

export default Encabezado;
