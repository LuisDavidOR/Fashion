import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroServicio from "../components/servicios/ModalRegistroServicio";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Servicios = () => {

  const [toast, setToast] = useState({mostrar: false, mensaje: "", tipo: ""});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
    id_categoria: "",
  });
  const [categorias, setCategorias] = useState([]);

  const limpiarServicio = () => {
    setNuevoServicio({
      nombre: "",
      descripcion: "",
      precio: "",
      duracion: "",
      id_categoria: "",
    });
  };

  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("Categorias")
        .select("id_categoria, nombre")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error cargando categorías:", error.message);
      } else {
        const ordenadas = data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );

        setCategorias(ordenadas);
      }
    };

    cargarCategorias();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoServicio((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarServicio = async () => {
    try {
      //Validar campos vacios
      if (
        !nuevoServicio.nombre.trim() ||
        !nuevoServicio.precio.trim() ||
        !nuevoServicio.duracion.trim() ||
        !nuevoServicio.id_categoria
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      // Validar precio
      const precio = parseFloat(nuevoServicio.precio);

      if (isNaN(precio) || precio <= 0) {
        setToast({
          mostrar: true,
          mensaje: "El precio debe ser un número mayor a 0.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar duración
      const duracion = parseInt(nuevoServicio.duracion);

      if (isNaN(duracion) || duracion <= 0) {
        setToast({
          mostrar: true,
          mensaje: "La duración debe ser un número entero mayor a 0.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("Servicios"). insert([
        {
          nombre: nuevoServicio.nombre,
          descripcion: nuevoServicio.descripcion,
          precio: precio,
          duracion: duracion,
          id_categoria: nuevoServicio.id_categoria
        },
      ]);

      if(error) {
        console.error("Error al agregar servicio: ", error.message);
        setToast({
          mostrar:true,
          mensaje: "Error al registrar servicio.",
          tipo: "error",
        });
        return;
      }

      //Éxito
      setToast({
        mostrar: true,
        mensaje: `El Servicio "${nuevoServicio.nombre}" ha sido registrado exitosamente.`,
        tipo: "exito",
      });

      //Limpiar formulario y cerrar modal
      setNuevoServicio({ nombre: "", descripcion: "", precio: "", duracion: "", id_categoria: ""});
      //await cargarServicios();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al agregar Servicio: ", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar Servicio.",
        tipo: "error",
      });
    }
  };

  return (
    
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Servicios
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-ms-inline ms-2">Nuevo Servicio</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <ModalRegistroServicio
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoServicio={nuevoServicio}
        manejoCambioInput={manejoCambioInput}
        agregarServicio={agregarServicio}
        limpiarServicio={limpiarServicio}
        categorias={categorias}
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

export default Servicios;