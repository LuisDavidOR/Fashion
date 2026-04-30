import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalCalificacionServicio from "../components/catalogo/ModalCalificacionServicio";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";



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
      const { data: calificacionesData } = await supabase
        .from("Calificaciones")
        .select("id_servicio, puntuacion");

      // 3. Agrupar calificaciones
      const mapaCalificaciones = {};

      calificacionesData?.forEach((cal) => {
        if (!mapaCalificaciones[cal.id_servicio]) {
          mapaCalificaciones[cal.id_servicio] = [];
        }

        mapaCalificaciones[cal.id_servicio].push(cal.puntuacion);
      });

      // 4. Calcular promedio
      const serviciosConRating = serviciosData.map((servicio) => {
        const calificaciones = mapaCalificaciones[servicio.id_servicio] || [];

        const promedio =
          calificaciones.length > 0
            ? calificaciones.reduce((a, b) => a + b, 0) /
              calificaciones.length
            : 0;

        return {
          ...servicio,
          rating: promedio,
          totalReviews: calificaciones.length,
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

  return (
    <Container className="mt-4">
      <h3 className="mb-4">
        <i className="bi bi-grid-fill me-2"></i> Catálogo de Servicios
          </h3>
      <div className="mb-4 catalogo-filtros">
        <button
          className={
            categoriaSeleccionada === "todas"
              ? "catalogo-filtro-activo"
              : "catalogo-filtro"
          }
          onClick={() => setCategoriaSeleccionada("todas")}
        >
          Todos
        </button>

        {categorias.map((categoria) => (
          <button
            key={categoria.id_categoria}
            className={
              String(categoriaSeleccionada) === String(categoria.id_categoria)
                ? "catalogo-filtro-activo"
                : "catalogo-filtro"
            }
            onClick={() => setCategoriaSeleccionada(categoria.id_categoria)}
          >
            {categoria.nombre}
          </button>
        ))}
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
        <TarjetaCatalogo
          servicios={serviciosFiltrados}
          abrirModalCalificacion={(servicio) => {
            setServicioSeleccionado(servicio);
            setNuevaCalificacion({
              puntuacion: 5,
              comentario: "",
            });
            setMostrarModalCalificacion(true);
          }}
        />
      )}

      <ModalCalificacionServicio
      mostrarModal={mostrarModalCalificacion}
      setMostrarModal={setMostrarModalCalificacion}
      servicio={servicioSeleccionado}
      nuevaCalificacion={nuevaCalificacion}
      setNuevaCalificacion={setNuevaCalificacion}
      guardarCalificacion={guardarCalificacion}
      />
    </Container>
  );
};

export default Catalogo;