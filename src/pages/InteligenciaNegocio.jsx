import { Container, Row, Col, Card, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { supabase } from "../database/supabaseconfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const InteligenciaNegocio = () => {
  const [gananciaTotal, setGananciaTotal] = useState(0);
  const [calificacionPromedio, setCalificacionPromedio] = useState(0);
  const [satisfaccion, setSatisfaccion] = useState(0);
  const [mejorEmpleado, setMejorEmpleado] = useState("Sin datos");
  const [detallesReporte, setDetallesReporte] = useState([]);
  const [calificacionesReporte, setCalificacionesReporte] = useState([]);

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
      setDetallesReporte(detallesValidos);

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
        setCalificacionesReporte(calificaciones || []);

        const satisfechos = calificaciones.filter(
          (item) => Number(item.puntuacion) >= 4
        ).length;

        setSatisfaccion((satisfechos / calificaciones.length) * 100);
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error.message);
    }
  };

  const generarReporteGeneral = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte Ejecutivo - Centro de Inteligencia", 14, 20);

  doc.setFontSize(11);
  doc.text("Proyecto Fashion - Salón de Belleza", 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-NI")}`, 14, 35);

  autoTable(doc, {
    startY: 45,
    head: [["Indicador", "Valor"]],
    body: [
      ["Ganancia total", `C$${gananciaTotal.toLocaleString("es-NI")}`],
      ["Satisfacción", `${satisfaccion.toFixed(0)}%`],
      ["Mejor empleado", mejorEmpleado],
      ["Calificación promedio", calificacionPromedio.toFixed(2)],
    ],
  });

  doc.save("reporte_centro_inteligencia.pdf");
};

const generarReporteRentabilidad = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Rentabilidad", 14, 20);

  doc.setFontSize(11);
  doc.text("Proyecto Fashion - Salón de Belleza", 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-NI")}`, 14, 35);

  const filas = detallesReporte.map((detalle) => {
    const subtotal = Number(detalle.subtotal || 0);
    const costoEmpleado = Number(detalle.costo_empleado || 0);
    const costoInsumo = Number(detalle.costo_insumo || 0);
    const ganancia = subtotal - costoEmpleado - costoInsumo;

    return [
      detalle.Servicios?.nombre || "Sin servicio",
      `C$${subtotal.toFixed(2)}`,
      `C$${costoEmpleado.toFixed(2)}`,
      `C$${costoInsumo.toFixed(2)}`,
      `C$${ganancia.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [["Servicio", "Subtotal", "Costo empleado", "Costo insumo", "Ganancia"]],
    body: filas,
  });

  doc.save("reporte_rentabilidad_fashion.pdf");
};

const generarReporteProductividad = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Productividad", 14, 20);

  doc.setFontSize(11);
  doc.text("Proyecto Fashion - Salón de Belleza", 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-NI")}`, 14, 35);

  const empleadosMap = {};

  detallesReporte.forEach((detalle) => {
    const cita = detalle.Citas;
    const empleado = cita?.Empleados;

    if (!empleado) return;

    const nombreEmpleado = `${empleado.nombre} ${empleado.apellido || ""}`.trim();

    if (!empleadosMap[nombreEmpleado]) {
      empleadosMap[nombreEmpleado] = {
        citasSet: new Set(),
        ingresos: 0,
      };
    }

    empleadosMap[nombreEmpleado].citasSet.add(cita.id_cita);
    empleadosMap[nombreEmpleado].ingresos += Number(detalle.subtotal || 0);
  });

  const filas = Object.entries(empleadosMap).map(([empleado, datos]) => [
    empleado,
    datos.citasSet.size,
    `C$${datos.ingresos.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Empleado", "Citas atendidas", "Ingresos generados"]],
    body: filas,
  });

  doc.save("reporte_productividad_fashion.pdf");
};

const generarReporteSatisfaccion = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Satisfacción", 14, 20);

  doc.setFontSize(11);
  doc.text("Proyecto Fashion - Salón de Belleza", 14, 28);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-NI")}`, 14, 35);

  const filas = calificacionesReporte.map((item) => [
    item.puntuacion,
    item.puntuacion >= 4 ? "Satisfecho" : "Por mejorar",
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Puntuación", "Clasificación"]],
    body: filas,
  });

  doc.save("reporte_satisfaccion_fashion.pdf");
};

const crearUrlTableau = (url) => {
  return `${url}?:showVizHome=no&:embed=true&:toolbar=yes&:showAppBanner=false&:display_count=n&:device=desktop`;
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
      <div className="text-center mb-5">
        <Button variant="dark" onClick={generarReporteGeneral}>
          📄 Generar Reporte Ejecutivo PDF
        </Button>
      </div>
      <div className="text-center mb-5 d-flex justify-content-center gap-3 flex-wrap">
      <Button variant="success" onClick={generarReporteRentabilidad}>
        📈 PDF Rentabilidad
      </Button>

      <Button variant="warning" onClick={generarReporteProductividad}>
        👥 PDF Productividad
      </Button>

      <Button variant="info" onClick={generarReporteSatisfaccion}>
        ⭐ PDF Satisfacción
      </Button>
    </div>

      <hr className="my-5" />

      <Card className="dashboard-card shadow mb-5">
        <Card.Header className="fw-bold fs-5">
            📈 Rentabilidad del Negocio
            <p className="mb-0 text-muted fs-6">
            Indicadores financieros y servicios más rentables.
            </p>
        </Card.Header>

       <Card.Body style={{ padding: 0 }}>
          <div className="tableau-wrapper">
            <iframe
              title="Dashboard Rentabilidad"
              src={crearUrlTableau("https://public.tableau.com/views/RentabilidadFS/Dashboard1")}
              className="tableau-iframe"
            />
          </div>

          <div className="text-center p-3">
            <a
              href="https://public.tableau.com/views/RentabilidadFS/Dashboard1?:showVizHome=no"
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark"
            >
              Abrir en pantalla completa
            </a>
          </div>
        </Card.Body>
        </Card>

      <Card className="shadow mb-5">
        <Card.Header className="fw-bold fs-5">
          👥 Productividad del Personal 
          Análisis del desempeño y generación de ingresos.
        </Card.Header>

        <Card.Body style={{ padding: 0 }}>
          <div className="tableau-wrapper">
            <iframe
              title="Dashboard Productividad"
              src={crearUrlTableau("https://public.tableau.com/views/DashboardF1_17808758226050/Dashboard1")}
              className="tableau-iframe"
            />
          </div>

          <div className="text-center p-3">
            <a
              href="https://public.tableau.com/views/DashboardF1_17808758226050/Dashboard1?:showVizHome=no"
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark"
            >
              Abrir en pantalla completa
            </a>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow mb-5">
        <Card.Header className="fw-bold fs-5">
          ⭐ Satisfacción de Clientes
Percepción y experiencia de nuestros servicios.
        </Card.Header>
        
    
        <Card.Body style={{ padding: 0 }}>
          <div className="tableau-wrapper">
            <iframe
              title="Dashboard Satisfacción"
              src={crearUrlTableau("https://public.tableau.com/views/DashboardF2/Dashboard1")}
              className="tableau-iframe"
            />
          </div>

          <div className="text-center p-3">
            <a
              href="https://public.tableau.com/views/DashboardF2/Dashboard1?:showVizHome=no"
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark"
            >
              Abrir en pantalla completa
            </a>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InteligenciaNegocio;