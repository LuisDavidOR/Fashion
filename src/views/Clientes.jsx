import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCliente from "../components/clientes/ModalRegistroCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Clientes = () => {

  const [toast, setToast] = useState({mostrar: false, mensaje: "", tipo: ""});
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
  });

  const limpiarCliente = () => {
    setNuevoCliente({
      nombre: "",
      apellido: "",
      telefono: "",
      correo: "",
    });
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarCliente = async () => {
    try {
      //Validar campos vacios
      if (
        !nuevoCliente.nombre.trim() ||
        !nuevoCliente.apellido.trim() ||
        !nuevoCliente.telefono.trim() ||
        !nuevoCliente.correo.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar teléfono (8 dígitos)
      const telefonoRegex = /^[0-9]{8}$/;
      if (!telefonoRegex.test(nuevoCliente.telefono)) {
        setToast({
          mostrar: true,
          mensaje: "El teléfono debe tener exactamente 8 dígitos numéricos.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar formato de correo
      const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!correoRegex.test(nuevoCliente.correo)) {
        setToast({
          mostrar: true,
          mensaje: "Ingrese un correo válido.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("Clientes"). insert([
        {
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          telefono: nuevoCliente.telefono,
          correo: nuevoCliente.correo,
        },
      ]);

      if(error) {
        console.error("Error al agregar cliente: ", error.message);
          if (error.message.toLowerCase().includes("duplicate")) {
          setToast({
            mostrar: true,
            mensaje: "Ya existe un cliente con ese correo.",
            tipo: "advertencia",
          });
        } else {
          setToast({
            mostrar: true,
            mensaje: "Error al registrar al cliente.",
            tipo: "error",
          });
        }
        return;
      }

      //Éxito
      setToast({
        mostrar: true,
        mensaje: `El cliente "${nuevoCliente.nombre} ${nuevoCliente.apellido}" ha sido registrado exitosamente.`,
        tipo: "exito",
      });

      //Limpiar formulario y cerrar modal
      setNuevoCliente({ nombre: "", apellido: "", telefono: "", correo: ""});
      //await cargarClientes();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al agregar cliente: ", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar cliente.",
        tipo: "error",
      });
    }
  };

  return (
    
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Clientes
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-ms-inline ms-2">Nuevo Cliente</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
        limpiarCliente={limpiarCliente}
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

export default Clientes;