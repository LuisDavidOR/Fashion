import { Container, Row, Col, Card } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { supabase } from "../database/supabaseconfig";

const InteligenciaNegocio = () => {
  const [gananciaTotal, setGananciaTotal] = useState(0);
  const [calificacionPromedio, setCalificacionPromedio] = useState(0);
  const [satisfaccion, setSatisfaccion] = useState(0);
  const [mejorEmpleado, setMejorEmpleado] = useState("Sin datos");

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      const { data: detalles, error: errorDetalles } = await supabase
        .from("Detalle_cita")
        .select(`
          id_detalle_cita,
          subtotal,
          costo_empleado,
          costo_insumo,
          Servicios(nombre),
          Citas(
            id_cita,
            estado_cita,
            id_empleado,
            Empleados(nombre, apellido)
          )
        `);

      if (errorDetalles) throw errorDetalles;

      const detallesValidos = (detalles || []).filter(
        (detalle) => detalle.Citas?.estado_cita === "completada"
      );

      const ganancia = detallesValidos.reduce((total, detalle) => {
        const subtotal = Number(detalle.subtotal || 0);
        const costoEmpleado = Number(detalle.costo_empleado || 0);
        const costoInsumo = Number(detalle.costo_insumo || 0);

        return total + (subtotal - costoEmpleado - costoInsumo);
      }, 0);

      setGananciaTotal(ganancia);

      const empleadosMap = {};

      detallesValidos.forEach((detalle) => {
        const cita = detalle.Citas;
        const empleado = cita?.Empleados;

        if (!empleado) return;

        const nombreEmpleado = `${empleado.nombre} ${
          empleado.apellido || ""
        }`.trim();

        if (!empleadosMap[nombreEmpleado]) {
          empleadosMap[nombreEmpleado] = {
            empleado: nombreEmpleado,
            ingresos: 0,
          };
        }

        empleadosMap[nombreEmpleado].ingresos += Number(detalle.subtotal || 0);
      });

      const empleados = Object.values(empleadosMap);

      if (empleados.length > 0) {
        const mejor = [...empleados].sort((a, b) => b.ingresos - a.ingresos)[0];
        setMejorEmpleado(mejor.empleado);
      }

      const { data: calificaciones, error: errorCalificaciones } =
        await supabase.from("Calificaciones").select("puntuacion");

      if (errorCalificaciones) throw errorCalificaciones;

      if ((calificaciones || []).length > 0) {
        const promedio =
          calificaciones.reduce(
            (total, item) => total + Number(item.puntuacion || 0),
            0
          ) / calificaciones.length;

        setCalificacionPromedio(promedio);

        const satisfechos = calificaciones.filter(
          (item) => Number(item.puntuacion) >= 4
        ).length;

        setSatisfaccion((satisfechos / calificaciones.length) * 100);
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error.message);
    }
  };

  return (
    <Container fluid className="inteligencia-container py-5 px-4">
      <h1 className="text-center fw-bold mb-5">
        <Card className="dashboard-hero border-0 shadow-lg mb-5"></Card>
        📊 Centro de Inteligencia del Negocio
      </h1>

      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h4>💰 Ganancia Total</h4>
            <h1 className="text-success fw-bold">
              C${gananciaTotal.toLocaleString("es-NI")}
            </h1>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h4>⭐ Satisfacción</h4>
            <h1 className="text-success fw-bold">
              {satisfaccion.toFixed(0)}%
            </h1>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h5 className="mb-2">🤴🏼 Mejor empleado </h5>
            <h1 className="fw-bold">{mejorEmpleado}</h1>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="kpi-card shadow text-center h-100">
        <h5 className="mb-3">
        💬 Calificación Promedio
        </h5>
            <h1 className="fw-bold">
              {calificacionPromedio.toFixed(1)} ⭐
            </h1>
          </Card>
        </Col>
      </Row>

      <hr className="my-5" />

      <Card className="shadow mb-5">
        <Card.Header className="fw-bold fs-5">
          📈 Rentabilidad del Negocio
Indicadores financieros y servicios más rentables.
        </Card.Header>

        <Card.Body>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            <div className="text-center">
              <h4>Dashboard pendiente</h4>
              <p className="text-muted mb-0">
                Esperando enlace de Tableau Public.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow mb-5">
        <Card.Header className="fw-bold fs-5">
          👥 Productividad del Personal 
          Análisis del desempeño y generación de ingresos.
        </Card.Header>

        <div className="tableau-wrapper">
            <iframe
                title="Dashboard Productividad"
                src="https://public.tableau.com/views/DashboardF1_17808758226050/Dashboard1?:showVizHome=no"
                className="tableau-iframe"
            />
            </div>
      </Card>

      <Card className="shadow mb-5">
        <Card.Header className="fw-bold fs-5">
          ⭐ Satisfacción de Clientes
Percepción y experiencia de nuestros servicios.
        </Card.Header>
        
    
        <Card.Body style={{ padding: 0 }}>
          <iframe
            title="Dashboard Satisfacción"
            src="https://public.tableau.com/views/DashboardF2/Dashboard1?:showVizHome=no"
            width="100%"
            height="850"
            frameBorder="0"
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InteligenciaNegocio;