import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalCalificacionServicio from "../components/catalogo/ModalCalificacionServicio";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import ModalDetalleServicio from "../components/catalogo/ModalDetalleServicio";

const Catalogo = () => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");

  const [mostrarModalCalificacion, setMostrarModalCalificacion] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [nuevaCalificacion, setNuevaCalificacion] = useState({
    puntuacion: 5,
    comentario: "",
  });

  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [servicioDetalle, setServicioDetalle] = useState(null);

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
        .select("*, Categorias(nombre)")
        .eq("estado", "activo");

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
          Clientes (
            id_cliente,
            nombre,
            apellido
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

  const guardarCalificacion = async () => {
        try {
          if (!servicioSeleccionado) return;

          const idClienteDemo = 1;

          const { error } = await supabase.from("Calificaciones").insert([
            {
              id_cliente: idClienteDemo,
              id_servicio: servicioSeleccionado.id_servicio,
              puntuacion: parseInt(nuevaCalificacion.puntuacion),
              comentario: nuevaCalificacion.comentario.trim() || null,
            },
          ]);

          if (error) throw error;

          setMostrarModalCalificacion(false);
          await cargarCatalogo();
        } catch (err) {
          console.error("Error al guardar calificación:", err.message);
        }
      };

    const serviciosFiltrados =
      categoriaSeleccionada === "todas"
        ? servicios
        : servicios.filter(
          (servicio) =>
            String(servicio.id_categoria) === String(categoriaSeleccionada)
        );
    
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

    const serviciosAgrupados = agruparPorCategoria(serviciosFiltrados);

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

      {!cargando && servicios.length > 0 && (
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
                      abrirModalDetalle={(servicio) => {
                        setServicioDetalle(servicio);
                        setMostrarModalDetalle(true);
                      }}
                      abrirModalCalificacion={(servicio) => {
                        setServicioSeleccionado(servicio);
                        setNuevaCalificacion({
                          puntuacion: 5,
                          comentario: "",
                        });
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
      />

      <ModalDetalleServicio
        mostrarModal={mostrarModalDetalle}
        setMostrarModal={setMostrarModalDetalle}
        servicio={servicioDetalle}
      />
    </Container>
  );
};

export default Catalogo;