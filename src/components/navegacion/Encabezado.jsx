import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../database/supabaseconfig";
import NotificacionOperacion from "../NotificacionOperacion";


const Encabezado = () => {

  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); //Para detectar la ruta actual

  const { usuario, rol, cerrarSesion } = useAuth();

  const esAdmin = usuario && rol === "admin";
  const esCliente = usuario && rol === "cliente";
  const esEmpleado = usuario && rol === "empleado";
  const esInvitado = !usuario;

  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [toastNotification, setToastNotification] = useState({ mostrar: false, mensaje: "", tipo: "" });

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
        .is("id_empleado", null);

      if (error) throw error;
      setCitasPendientes(data || []);
    } catch (err) {
      console.error("Error al cargar citas pendientes:", err);
    }
  };

  useEffect(() => {
    if (!usuario || (rol !== "admin" && rol !== "empleado")) {
      setCitasPendientes([]);
      setMostrarNotificaciones(false);
      return;
    }

    cargarCitasPendientes();

    const canal = supabase
      .channel("citas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Citas" },
        () => {
          cargarCitasPendientes();
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
  }, [usuario, rol]);

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
  };

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    setMostrarMenu(false);
    navigate("/login");
  };

  //Detectar rutas especiales
  const esRutaAuth =
    location.pathname === "/login" || location.pathname === "/registro";

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
          {(esAdmin || esEmpleado) && (
            <div className="nav-item-notificaciones position-relative align-self-center ms-auto me-3">
              <button
                className="btn btn-link text-white p-0 position-relative d-flex align-items-center"
                onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                style={{ textDecoration: "none", border: "none", background: "none" }}
              >
                <i className="bi bi-bell-fill" style={{ fontSize: "1.25rem" }}></i>
                {citasPendientes.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                    {citasPendientes.length}
                  </span>
                )}
              </button>

              {mostrarNotificaciones && (
                <div className="dropdown-notificaciones shadow-lg border rounded-3 bg-white p-3 text-dark position-absolute end-0 mt-2" style={{ width: "300px", zIndex: 1000 }}>
                  <h6 className="fw-bold border-bottom pb-2 mb-2 d-flex justify-content-between align-items-center text-dark">
                    Citas Pendientes
                    <span className="badge bg-danger text-white">{citasPendientes.length}</span>
                  </h6>
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    {citasPendientes.length === 0 ? (
                      <div className="text-center py-3 text-muted small">
                        No hay citas pendientes.
                      </div>
                    ) : (
                      citasPendientes.map((cita) => {
                        const serviciosNombres = cita.Detalle_cita?.map(
                          (d) => d.Servicios?.nombre
                        ).filter(Boolean).join(", ") || "Sin servicios";

                        return (
                          <div key={cita.id_cita} className="notificacion-item border-bottom py-2" style={{ cursor: "pointer" }} onClick={() => {
                            setMostrarNotificaciones(false);
                            navigate("/citas");
                          }}>
                            <div className="small fw-bold text-dark">{cita.Clientes ? `${cita.Clientes.nombre} ${cita.Clientes.apellido}` : "Cliente"}</div>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>{serviciosNombres}</div>
                            <div className="text-muted d-flex justify-content-between mt-1" style={{ fontSize: "0.7rem" }}>
                              <span><i className="bi bi-calendar-event me-1"></i>{cita.fecha}</span>
                              <span><i className="bi bi-clock me-1"></i>{cita.hora}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="text-center border-top pt-2 mt-2">
                    <button
                      className="btn btn-sm text-white w-100"
                      style={{ backgroundColor: "#7A564A" }}
                      onClick={() => {
                        setMostrarNotificaciones(false);
                        navigate("/citas");
                      }}
                    >
                      Ver todas las citas
                    </button>
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
              className={(esAdmin || esEmpleado) ? "ms-0" : "ms-auto"}
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
