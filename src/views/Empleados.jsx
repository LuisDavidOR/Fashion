import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroEmpleado from "../components/empleados/ModalRegistroEmpleado";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Empleados = () => {

  const [toast, setToast] = useState({mostrar: false, mensaje: "", tipo: ""});
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    comision: "",
    especialidad: ""
  });

  const limpiarEmpleado = () => {
    setNuevoEmpleado({
      nombre: "",
      apellido: "",
      telefono: "",
      correo: "",
      comision: "",
      especialidad: ""
    });
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarEmpleado = async () => {
    try {
      //Validar campos vacios
      if (
        !nuevoEmpleado.nombre.trim() ||
        !nuevoEmpleado.apellido.trim() ||
        !nuevoEmpleado.telefono.trim() ||
        !nuevoEmpleado.correo.trim() ||
        !nuevoEmpleado.especialidad.trim()
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
      if (!telefonoRegex.test(nuevoEmpleado.telefono)) {
        setToast({
          mostrar: true,
          mensaje: "El teléfono debe tener exactamente 8 dígitos numéricos.",
          tipo: "advertencia",
        });
        return;
      }

      // 🔒 Validar formato de correo
      const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!correoRegex.test(nuevoEmpleado.correo)) {
        setToast({
          mostrar: true,
          mensaje: "Ingrese un correo válido.",
          tipo: "advertencia",
        });
        return;
      }

      if (nuevoEmpleado.comision === "") {
        setToast({
          mostrar: true,
          mensaje: "Debe ingresar la comisión.",
          tipo: "advertencia",
        });
        return;
      }

      //Validar comision
      const comisionNumero = parseFloat(nuevoEmpleado.comision);
      if (isNaN(comisionNumero)) {
        setToast({
          mostrar: true,
          mensaje: "La comisión debe ser un número.",
          tipo: "advertencia",
        });
        return;
      }

      if (comisionNumero < 0 || comisionNumero > 100) {
        setToast({
          mostrar: true,
          mensaje: "La comisión debe estar entre 0 y 100.",
          tipo: "advertencia",
        });
        return;
      }

      const comisionDecimal = comisionNumero / 100;

      const { error } = await supabase.from("Empleados"). insert([
        {
          nombre: nuevoEmpleado.nombre,
          apellido: nuevoEmpleado.apellido,
          telefono: nuevoEmpleado.telefono,
          correo: nuevoEmpleado.correo,
          comision: comisionDecimal,
          especialidad: nuevoEmpleado.especialidad,
        },
      ]);

      if(error) {
        console.error("Error al agregar empleado: ", error.message);
          if (error.message.toLowerCase().includes("duplicate")) {
          setToast({
            mostrar: true,
            mensaje: "Ya existe un empleado con ese correo.",
            tipo: "advertencia",
          });
        } else {
          setToast({
            mostrar: true,
            mensaje: "Error al registrar al empleado.",
            tipo: "error",
          });
        }
        return;
      }

      //Éxito
      setToast({
        mostrar: true,
        mensaje: `El empleado "${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}" ha sido registrado exitosamente.`,
        tipo: "exito",
      });

      //Limpiar formulario y cerrar modal
      setNuevoEmpleado({ nombre: "", apellido: "", telefono: "", correo: "", comision: "", especialidad: "",});
      //await cargarEmpleados();
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al agregar empleado: ", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar empleado.",
        tipo: "error",
      });
    }
  };

  return (
    
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bookmark-plus-fill me-2"></i> Empleados
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-ms-inline ms-2">Nuevo Empleado</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <ModalRegistroEmpleado
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoEmpleado={nuevoEmpleado}
        manejoCambioInput={manejoCambioInput}
        agregarEmpleado={agregarEmpleado}
        limpiarEmpleado={limpiarEmpleado}
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

export default Empleados;