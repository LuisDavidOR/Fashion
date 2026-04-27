import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroInsumo from "../components/insumos/ModalRegistroInsumo";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Insumos = () => {

  const [toast, setToast] = useState({mostrar: false, mensaje: "", tipo: ""});
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoInsumo, setNuevoInsumo] = useState({
    nombre: "",
    descripcion: "",
    costo_producto: "",
    contenido_total: "",
    unidad_medida: "",
    stock: 0,
  });

  const limpiarInsumo = () => {
    setNuevoInsumo({
      nombre: "",
      descripcion: "",
      costo_producto: "",
      contenido_total: "",
      unidad_medida: "",
      stock: 0,
    });
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoInsumo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarInsumo = async () => {
    try {
      if (
        !nuevoInsumo.nombre.trim() ||
        !nuevoInsumo.costo_producto.trim() ||
        !nuevoInsumo.contenido_total.trim() ||
        !nuevoInsumo.unidad_medida.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar costo_producto
      const costo = parseFloat(nuevoInsumo.costo_producto);

      if (isNaN(costo) || costo <= 0) {
        setToast({
          mostrar: true,
          mensaje: "El costo debe ser un número mayor a 0.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar contenido_total
      const contenido = parseFloat(nuevoInsumo.contenido_total);

      if (isNaN(contenido) || contenido <= 0) {
        setToast({
          mostrar: true,
          mensaje: "El contenido debe ser un número mayor a 0.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar stock
      const stock = parseInt(nuevoInsumo.stock);

      if (isNaN(stock) || stock < 0) {
        setToast({
          mostrar: true,
          mensaje: "El stock debe ser un número entero mayor o igual a 0.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("Insumos"). insert([
        {
          nombre: nuevoInsumo.nombre,
          descripcion: nuevoInsumo.descripcion,
          costo_producto: costo,
          contenido_total: contenido,
          stock: stock,
          unidad_medida: nuevoInsumo.unidad_medida
        },
      ]);

      if(error) {
        console.error("Error al agregar Insumo: ", error.message);
        setToast({
          mostrar:true,
          mensaje: "Error al registrar Insumo.",
          tipo: "error",
        });
        return;
      }

      //Éxito
      setToast({
        mostrar: true,
        mensaje: `Insumo "${nuevoInsumo.nombre}" registrada exitosamente.`,
        tipo: "exito",
      });

      //Limpiar formulario y cerrar modal
      setNuevoInsumo({ nombre: "", descripcion: "", contenido_total: "", costo_producto: "", stock: "", unidad_medida: ""});
      //await cargarInsumos();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al agregar Insumo: ", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar Insumo.",
        tipo: "error",
      });
    }
  };

  return (
    
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Insumos
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-ms-inline ms-2">Nuevo Insumo</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <ModalRegistroInsumo
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoInsumo={nuevoInsumo}
        manejoCambioInput={manejoCambioInput}
        agregarInsumo={agregarInsumo}
        limpiarInsumo={limpiarInsumo}
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

export default Insumos;