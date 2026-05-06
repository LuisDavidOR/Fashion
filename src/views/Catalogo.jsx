import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalCalificacionServicio from "../components/catalogo/ModalCalificacionServicio";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import ModalDetalleServicio from "../components/catalogo/ModalDetalleServicio";

const Catalogo = () => {
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

      const { data: serviciosData, error } = await supabase
        .from("Servicios")
        .select("*, Categorias(nombre)")
        .eq("estado", "activo");

      if (error) throw error;

      const { data: calificacionesData } = await supabase
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

      const mapaCalificaciones = {};

      calificacionesData?.forEach((cal) => {
        if (!mapaCalificaciones[cal.id_servicio]) {
          mapaCalificaciones[cal.id_servicio] = [];
        }
        mapaCalificaciones[cal.id_servicio].push(cal);
      });

      const serviciosConRating = serviciosData.map((servicio) => {
        const calificaciones = mapaCalificaciones[servicio.id_servicio] || [];

        const promedio =
          calificaciones.length > 0
            ? calificaciones.reduce((t, c) => t + Number(c.puntuacion), 0) /
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
    if (!servicioSeleccionado) return;

    await supabase.from("Calificaciones").insert([
      {
        id_cliente: 1,
        id_servicio: servicioSeleccionado.id_servicio,
        puntuacion: parseInt(nuevaCalificacion.puntuacion),
        comentario: nuevaCalificacion.comentario.trim() || null,
      },
    ]);

    setMostrarModalCalificacion(false);
    await cargarCatalogo();
  };

  const serviciosFiltrados = servicios.filter((servicio) => {
    const coincideCategoria =
      categoriaSeleccionada === "todas" ||
      String(servicio.id_categoria) === String(categoriaSeleccionada);

    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      servicio.nombre.toLowerCase().includes(texto) ||
      (servicio.descripcion || "").toLowerCase().includes(texto);

    return coincideCategoria && coincideBusqueda;
  });

  const agruparPorCategoria = (listaServicios) => {
    return listaServicios.reduce((acc, servicio) => {
      const categoria = servicio.Categorias?.nombre || "Sin categoría";

      if (!acc[categoria]) acc[categoria] = [];

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

      {/* 🔍 NUEVO BUSCADOR MINIMALISTA */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="buscador-minimal">
            <i className="bi bi-search icono-buscador"></i>

            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-buscador"
            />
          </div>
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

      {!cargando && serviciosFiltrados.length === 0 && (
        <Alert variant="warning" className="text-center">
          No se encontraron resultados.
        </Alert>
      )}

      {!cargando && serviciosFiltrados.length > 0 && (
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
                  <div key={servicio.id_servicio}>
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