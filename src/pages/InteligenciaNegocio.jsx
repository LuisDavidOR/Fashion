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

  const urlsTableau = {
    rentabilidad:
      "https://public.tableau.com/views/Dashboardrentabilidad/Dashboard1?:language=es-ES&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",

    productividad:
      "https://public.tableau.com/views/DashboardF1_17808758226050/Dashboard1?:language=en-US&publish=yes&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",

    satisfaccion:
      "https://public.tableau.com/views/DashboardF2/Dashboard1?:language=es-ES&publish=yes&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link",
  };

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const crearUrlTableau = (url) => {
    const base = url.split("?")[0];

    return `${base}?:showVizHome=no&:embed=true&:toolbar=no&:tabs=no&:showAppBanner=false&:display_count=n&:device=desktop`;
  };

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

      const nombreEmpleado = `${empleado.nombre} ${
        empleado.apellido || ""
      }`.trim();

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

  const generarReporteSatisfaccion = async () => {
    const { data: calificaciones, error } = await supabase
      .from("Calificaciones")
      .select("puntuacion");

    if (error) {
      console.error("Error generando reporte de satisfacción:", error.message);
      return;
    }

    if (!calificaciones || calificaciones.length === 0) {
      alert("No hay calificaciones registradas para generar el reporte.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Satisfacción", 14, 20);

    doc.setFontSize(11);
    doc.text("Proyecto Fashion - Salón de Belleza", 14, 28);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-NI")}`, 14, 35);

    const filas = calificaciones.map((item) => {
      const puntuacion = Number(item.puntuacion || 0);

      return [puntuacion, puntuacion >= 4 ? "Satisfecho" : "Por mejorar"];
    });

    autoTable(doc, {
      startY: 45,
      head: [["Puntuación", "Clasificación"]],
      body: filas,
    });

    doc.save("reporte_satisfaccion_fashion.pdf");
  };

  const DashboardTableau = ({
    etiqueta,
    titulo,
    descripcion,
    url,
    textoBoton,
  }) => {
    return (
      <section className="dashboard-section">
        <div className="dashboard-info">
          <span className="dashboard-tag">{etiqueta}</span>
          <h2>{titulo}</h2>
          <p>{descripcion}</p>
        </div>

        <Card className="dashboard-card-fashion mb-4">
          <Card.Body>
            <div className="dashboard-reducido-wrapper">
              <iframe
                title={titulo}
                src={crearUrlTableau(url)}
                className="dashboard-reducido-iframe"
              />
            </div>

            <div className="dashboard-mobile-link">
              <p>
                Para una mejor visualización en celular, abre este dashboard en pantalla completa.
              </p>

              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn-fashion-primary"
              >
                {textoBoton}
              </a>
            </div>

            <div className="dashboard-actions mt-3">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn-fashion-primary"
              >
                {textoBoton}
              </a>
            </div>
          </Card.Body>
        </Card>
      </section>
    );
  };

  return (
    <Container fluid className="inteligencia-container py-5 px-4">
      <section className="bi-hero">
        <span className="bi-etiqueta">Panel Ejecutivo</span>

        <h1>📊 Centro de Inteligencia del Negocio</h1>

        <p>
          Analiza la rentabilidad, productividad y satisfacción de Salón Fashion
          mediante dashboards ejecutivos, indicadores principales y reportes en
          PDF.
        </p>
      </section>

      <Row className="g-4 mb-5">
        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h4>💰 Ganancia Total</h4>
            <h1 className="text-success fw-bold">
              C${gananciaTotal.toLocaleString("es-NI")}
            </h1>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h4>⭐ Satisfacción</h4>
            <h1 className="text-success fw-bold">
              {satisfaccion.toFixed(0)}%
            </h1>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h5 className="mb-2">🤴🏼 Mejor empleado</h5>
            <h1 className="fw-bold">{mejorEmpleado}</h1>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="kpi-card shadow text-center h-100">
            <h5 className="mb-3">💬 Calificación Promedio</h5>
            <h1 className="fw-bold">
              {calificacionPromedio.toFixed(1)} ⭐
            </h1>
          </Card>
        </Col>
      </Row>

      <section className="reportes-panel mb-5">
        <h3>Reportes ejecutivos</h3>

        <p>
          Descarga informes en PDF con los principales resultados del salón para
          presentar la rentabilidad, productividad y satisfacción de forma clara.
        </p>

        <div className="reportes-botones">
          <Button className="btn-fashion-primary" onClick={generarReporteGeneral}>
            📄 Reporte Ejecutivo
          </Button>

          <Button className="btn-fashion-outline" onClick={generarReporteRentabilidad}>
            📈 Rentabilidad
          </Button>

          <Button className="btn-fashion-outline" onClick={generarReporteProductividad}>
            👥 Productividad
          </Button>

          <Button className="btn-fashion-outline" onClick={generarReporteSatisfaccion}>
            ⭐ Satisfacción
          </Button>
        </div>
      </section>

      <hr className="my-5" />

      <DashboardTableau
        etiqueta="Análisis financiero"
        titulo="📈 Rentabilidad del Negocio"
        descripcion="Este dashboard permite visualizar la ganancia del salón, los servicios más rentables, los servicios con menor rentabilidad y el comportamiento económico según los días de la semana."
        url={urlsTableau.rentabilidad}
        textoBoton="Ver Dashboard Completo de Rentabilidad"
      />

      <DashboardTableau
        etiqueta="Desempeño del equipo"
        titulo="👥 Productividad del Personal"
        descripcion="Este dashboard muestra el rendimiento de los empleados según citas atendidas, ingresos generados y relación entre productividad y rentabilidad."
        url={urlsTableau.productividad}
        textoBoton="Ver Dashboard Completo de Productividad"
      />

      <DashboardTableau
        etiqueta="Experiencia del cliente"
        titulo="⭐ Satisfacción de Clientes"
        descripcion="Este dashboard resume la percepción de los clientes mediante calificaciones, servicios mejor valorados y servicios con oportunidades de mejora."
        url={urlsTableau.satisfaccion}
        textoBoton="Ver Dashboard Completo de Satisfacción"
      />

      <Card className="dashboard-conclusion">
        <Card.Body>
          <h3>📌 Conclusión ejecutiva</h3>

          <p>
            El Centro de Inteligencia del Negocio permite analizar el desempeño
            del salón desde tres perspectivas clave: rentabilidad, productividad
            y satisfacción del cliente.
          </p>

          <p>
            Esta información facilita la toma de decisiones para mejorar
            servicios, reconocer el rendimiento del personal y fortalecer la
            experiencia de los clientes.
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InteligenciaNegocio;