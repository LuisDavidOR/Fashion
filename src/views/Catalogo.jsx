import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Form, Modal, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalCalificacionServicio from "../components/catalogo/ModalCalificacionServicio";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import ModalDetalleServicio from "../components/catalogo/ModalDetalleServicio";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Catalogo = () => {
  const navigate = useNavigate();
  const { usuario, rol, perfil } = useAuth();

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  const [mostrarModalCalificacion, setMostrarModalCalificacion] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [nuevaCalificacion, setNuevaCalificacion] = useState({
    puntuacion: 5,
    comentario: "",
  });
  const [calificacionExistente, setCalificacionExistente] = useState(null);

  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [servicioDetalle, setServicioDetalle] = useState(null);
  const [mensajeCalificacion, setMensajeCalificacion] = useState("");

  const [mostrarModalAcceso, setMostrarModalAcceso] = useState(false);
  const [mensajeAcceso, setMensajeAcceso] = useState("");

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  useEffect(() => {
    cargarCategorias();
    cargarCatalogo();
  }, []);

  const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("Categorias")
        .select("*")
        .eq("estado", "activo")
        .order("nombre", { ascending: true });

      if (!error) setCategorias(data || []);
    };

  const cargarCatalogo = async () => {
    try {
      setCargando(true);

      // 1. Traer servicios activos
      const { data: serviciosData, error } = await supabase
        .from("Servicios")
        .select(`
          *,
          Categorias!inner (
            nombre,
            estado
          )
        `)
        .eq("estado", "activo")
        .eq("Categorias.estado", "activo")
        .order("nombre", { ascending: true });

      if (error) throw error;

      // 2. Traer calificaciones
      const { data: calificacionesData, error: errorCalificaciones } = await supabase
        .from("Calificaciones")
        .select(`
          id_calificacion,
          id_cliente,
          id_servicio,
          puntuacion,
          comentario,
          respuesta,
          Clientes (
            id_cliente,
            nombre,
            apellido,
            url_imagen
          )
        `);

      if (errorCalificaciones) {
        console.error("Error cargando calificaciones:", errorCalificaciones.message);
        console.log("Calificaciones:", calificacionesData);
      }

      // 3. Agrupar calificaciones
      const mapaCalificaciones = {};

      calificacionesData?.forEach((cal) => {
        if (!mapaCalificaciones[cal.id_servicio]) {
          mapaCalificaciones[cal.id_servicio] = [];
        }

        mapaCalificaciones[cal.id_servicio].push(cal);
      });

      // 4. Calcular promedio
      const serviciosConRating = serviciosData.map((servicio) => {
        const calificaciones = mapaCalificaciones[servicio.id_servicio] || [];

        const promedio =
          calificaciones.length > 0
            ? calificaciones.reduce((total, cal) => total + Number(cal.puntuacion), 0) /
              calificaciones.length
            : 0;

        return {
          ...servicio,
          rating: promedio,
          totalReviews: calificaciones.length,
          calificaciones,
        };
      });

      setServicios(serviciosConRating);
    } catch (err) {
      console.error("Error cargando catálogo:", err.message);
    } finally {
      setCargando(false);
    }
  };

  const validarClienteParaCalificar = () => {
    if (!usuario) {
      setMensajeAcceso("Debes iniciar sesión para calificar un servicio.");
      setMostrarModalAcceso(true);
      return false;
    }

    if (rol !== "cliente" || !perfil?.id_cliente) {
      setMensajeAcceso("Solo los clientes pueden calificar servicios.");
      setMostrarModalAcceso(true);
      return false;
    }

    return true;
  };

  const guardarCalificacion = async () => {
    try {
      if (!servicioSeleccionado) return;

      const puntuacion = parseInt(nuevaCalificacion.puntuacion);
      const comentario = nuevaCalificacion.comentario.trim();

      if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5) {
        setMensajeCalificacion("Selecciona una puntuación válida entre 1 y 5 estrellas.");
        return;
      }

      if (comentario.length > 250) {
        setMensajeCalificacion("El comentario no puede superar los 250 caracteres.");
        return;
      }

      if (!validarClienteParaCalificar()) return;

      if (calificacionExistente) {
        const esMiCalificacion =
          Number(calificacionExistente.id_cliente) === Number(perfil.id_cliente);

        if (!esMiCalificacion) {
          setMensajeCalificacion("No tienes permiso para editar esta calificación.");
          return;
        }
        
        const { error } = await supabase
          .from("Calificaciones")
          .update({
            puntuacion,
            comentario: comentario || null,
          })
          .eq("id_calificacion", calificacionExistente.id_calificacion);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("Calificaciones").insert([
          {
            id_cliente: perfil.id_cliente,
            id_servicio: servicioSeleccionado.id_servicio,
            puntuacion,
            comentario: comentario || null,
            respuesta: null,
          },
        ]);

        if (error) throw error;
      }

      setToast({
        mostrar: true,
        mensaje: calificacionExistente
          ? "Calificación actualizada correctamente."
          : "Calificación guardada correctamente.",
        tipo: "exito",
      });

      setMostrarModalCalificacion(false);
      setCalificacionExistente(null);

      await cargarCatalogo();
    } catch (err) {
      console.error("Error al guardar calificación:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error al guardar la calificación.",
        tipo: "error",
      });
    }
  };

  const eliminarCalificacion = async (calificacion, idServicio) => {
    try {
      if (!usuario) {
        setToast({
          mostrar: true,
          mensaje: "Debes iniciar sesión para eliminar una calificación.",
          tipo: "error",
        });
        return;
      }

      const esAdminOEmpleado = rol === "admin" || rol === "empleado";

      const esPropietario =
        rol === "cliente" &&
        Number(perfil?.id_cliente) === Number(calificacion.id_cliente);

      if (!esAdminOEmpleado && !esPropietario) {
        setToast({
          mostrar: true,
          mensaje: "No tienes permiso para eliminar esta calificación.",
          tipo: "error",
        });
        return;
      }

      const { error } = await supabase
        .from("Calificaciones")
        .delete()
        .eq("id_calificacion", calificacion.id_calificacion);

      if (error) throw error;

      await cargarCatalogo();

      if (servicioDetalle && servicioDetalle.id_servicio === idServicio) {
        setServicioDetalle((prev) => {
          const nuevasCalificaciones = prev.calificaciones.filter(
            (c) => c.id_calificacion !== calificacion.id_calificacion
          );

          const totalReviews = nuevasCalificaciones.length;

          const rating =
            totalReviews > 0
              ? nuevasCalificaciones.reduce(
                  (total, cal) => total + Number(cal.puntuacion),
                  0
                ) / totalReviews
              : 0;

          return {
            ...prev,
            calificaciones: nuevasCalificaciones,
            rating,
            totalReviews,
          };
        });
      }

      setToast({
        mostrar: true,
        mensaje: "Calificación eliminada correctamente.",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al eliminar calificación:", err.message);

      setToast({
        mostrar: true,
        mensaje: "Error al eliminar la calificación.",
        tipo: "error",
      });
    }
  };

  const responderCalificacion = async (idCalificacion, idServicio, respuestaTexto) => {
    try {
      const { error } = await supabase
        .from("Calificaciones")
        .update({ respuesta: respuestaTexto })
        .eq("id_calificacion", idCalificacion);

      if (error) throw error;

      await cargarCatalogo();

      if (servicioDetalle && servicioDetalle.id_servicio === idServicio) {
        setServicioDetalle((prev) => {
          const nuevasCalificaciones = prev.calificaciones.map((c) => {
            if (c.id_calificacion === idCalificacion) {
              return { ...c, respuesta: respuestaTexto };
            }
            return c;
          });
          return {
            ...prev,
            calificaciones: nuevasCalificaciones,
          };
        });
      }

      setToast({
        mostrar: true,
        mensaje: respuestaTexto ? "Respuesta guardada correctamente." : "Respuesta eliminada correctamente.",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al responder calificación:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error al registrar la respuesta.",
        tipo: "error",
      });
    }
  };

  const serviciosFiltrados = servicios.filter((servicio) => {
    const coincideCategoria =
      categoriaSeleccionada === "todas" ||
      String(servicio.id_categoria) === String(categoriaSeleccionada);

    const textoBusqueda = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      textoBusqueda === "" ||
      servicio.nombre.toLowerCase().includes(textoBusqueda) ||
      (servicio.descripcion || "").toLowerCase().includes(textoBusqueda) ||
      (servicio.Categorias?.nombre || "").toLowerCase().includes(textoBusqueda);

    return coincideCategoria && coincideBusqueda;
  });
    
  const agruparPorCategoria = (listaServicios) => {
    return listaServicios.reduce((acc, servicio) => {
      const categoria = servicio.Categorias?.nombre || "Sin categoría";

      if (!acc[categoria]) {
        acc[categoria] = [];
      }

      acc[categoria].push(servicio);
      return acc;
    }, {});
  };

  const serviciosAgrupados = Object.fromEntries(
    Object.entries(agruparPorCategoria(serviciosFiltrados)).sort(
      ([categoriaA], [categoriaB]) =>
        categoriaA.localeCompare(categoriaB)
    )
  );

  return (
    <Container className="mt-4">
      <h3 className="mb-4">
        <i className="bi bi-grid-fill me-2"></i> Catálogo de Servicios
          </h3>
    
      <div className="catalogo-categorias-section mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="catalogo-categorias-titulo mb-0">
            Explorar por categoría
          </h6>

          {categoriaSeleccionada !== "todas" && (
            <button
              className="catalogo-limpiar-filtro"
              onClick={() => setCategoriaSeleccionada("todas")}
            >
              Ver todas
            </button>
          )}
        </div>

        <div className="catalogo-categorias-wrapper">
          <button
            className="catalogo-flecha-scroll"
            onClick={() =>
              document
                .querySelector(".catalogo-categorias-scroll")
                ?.scrollBy({ left: -180, behavior: "smooth" })
            }
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="catalogo-categorias-scroll">
            <button
              className={
                categoriaSeleccionada === "todas"
                  ? "catalogo-categoria-card todas activa"
                  : "catalogo-categoria-card todas"
              }
              onClick={() => setCategoriaSeleccionada("todas")}
            >
              <div className="catalogo-categoria-bg categoria-todas-bg"></div>
              <div className="catalogo-categoria-overlay"></div>

              <span>
                <i className="bi bi-grid me-2"></i>
                Todas
              </span>
            </button>

            {categorias.map((categoria) => (
              <button
                key={categoria.id_categoria}
                className={
                  String(categoriaSeleccionada) === String(categoria.id_categoria)
                    ? "catalogo-categoria-card activa"
                    : "catalogo-categoria-card"
                }
                onClick={() => setCategoriaSeleccionada(categoria.id_categoria)}
              >
                <div
                  className="catalogo-categoria-bg"
                  style={{
                    backgroundImage: categoria.url_imagen
                      ? `url(${categoria.url_imagen})`
                      : "none",
                  }}
                ></div>

                <div className="catalogo-categoria-overlay"></div>

                <span>{categoria.nombre}</span>
              </button>
            ))}
          </div>

          <button
            className="catalogo-flecha-scroll"
            onClick={() =>
              document
                .querySelector(".catalogo-categorias-scroll")
                ?.scrollBy({ left: 180, behavior: "smooth" })
            }
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <Row className="mb-4">
        <Col xs={12} md={6}>
          <Form.Group>
            <Form.Control
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar servicio, descripción o categoría..."
            />
          </Form.Group>
        </Col>
      </Row>
    

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" />
            <p className="mt-2">Cargando catálogo...</p>
          </Col>
        </Row>
      )}

      {!cargando && servicios.length === 0 && (
        <Alert variant="info" className="text-center">
          No hay servicios disponibles.
        </Alert>
      )}

      {!cargando && servicios.length > 0 && serviciosFiltrados.length === 0 && (
        <Alert variant="warning" className="text-center">
          No se encontraron servicios que coincidan con la búsqueda.
        </Alert>
      )}

      {!cargando && servicios.length > 0 && serviciosFiltrados.length > 0 && (
        <>
          {Object.entries(serviciosAgrupados).map(([categoria, servicios]) => (
            <section key={categoria} className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="fw-bold mb-0">{categoria}</h4>
                <span className="text-muted small">
                  {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="catalogo-scroll-horizontal">
                {servicios.map((servicio) => (
                  <div className="catalogo-card-scroll" key={servicio.id_servicio}>
                    <TarjetaCatalogo
                      servicios={[servicio]}
                      rol={rol}
                      perfil={perfil}
                      abrirModalDetalle={(servicio) => {
                        setServicioDetalle(servicio);
                        setMostrarModalDetalle(true);
                      }}
                      abrirModalCalificacion={(servicio) => {
                        if (!validarClienteParaCalificar()) return;

                        const miCalificacion = servicio.calificaciones?.find(
                          (calificacion) =>
                            Number(calificacion.id_cliente) === Number(perfil.id_cliente)
                        );

                        setServicioSeleccionado(servicio);
                        setCalificacionExistente(miCalificacion || null);

                        setNuevaCalificacion({
                          puntuacion: miCalificacion ? miCalificacion.puntuacion : 5,
                          comentario: miCalificacion?.comentario || "",
                        });

                        setMensajeCalificacion("");
                        setMostrarModalCalificacion(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <ModalCalificacionServicio
        mostrarModal={mostrarModalCalificacion}
        setMostrarModal={setMostrarModalCalificacion}
        servicio={servicioSeleccionado}
        nuevaCalificacion={nuevaCalificacion}
        setNuevaCalificacion={setNuevaCalificacion}
        guardarCalificacion={guardarCalificacion}
        calificacionExistente={calificacionExistente}
        mensajeCalificacion={mensajeCalificacion}
      />

      <ModalDetalleServicio
        mostrarModal={mostrarModalDetalle}
        setMostrarModal={setMostrarModalDetalle}
        servicio={servicioDetalle}
        onEliminarCalificacion={eliminarCalificacion}
        onResponderCalificacion={responderCalificacion}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      <Modal
        show={mostrarModalAcceso}
        onHide={() => setMostrarModalAcceso(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Acceso requerido</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-0">{mensajeAcceso}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setMostrarModalAcceso(false)}
          >
            Cancelar
          </Button>

          {!usuario && (
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
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Catalogo;