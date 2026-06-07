import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const InteligenciaNegocio = () => {
  const productividadData = {
    labels: ["Snaijder", "David", "Iris", "Luffy"],
    datasets: [
      {
        label: "Citas atendidas",
        data: [7, 6, 5, 5],
        backgroundColor: "#4CAF50",
      },
    ],
  };

  const ingresosData = {
    labels: ["Snaijder", "Iris", "Luffy", "David"],
    datasets: [
      {
        label: "Ingresos C$",
        data: [9640, 6580, 6350, 6160],
        backgroundColor: "#D4A373",
      },
    ],
  };

  const rentabilidadData = {
    labels: [
      "Maquillaje",
      "Uñas",
      "Pintar cabello",
      "Combo uñas",
      "Manicura rusa",
    ],
    datasets: [
      {
        label: "Ganancia",
        data: [2902, 2681, 2557, 2482, 1909],
        backgroundColor: "#5CB85C",
      },
    ],
  };

  const demandaData = {
    labels: [
      "Manicura rusa",
      "Corte cabello",
      "Uñas acrílicas",
      "Retiro acrílico",
      "Peinado",
    ],
    datasets: [
      {
        label: "% Demanda",
        data: [24.4, 22, 22, 17.1, 14.6],
        backgroundColor: "#6C8EBF",
      },
    ],
  };

  return (
    <Container fluid className="py-5 px-4">
      <h1 className="text-center fw-bold mb-5">
        📊 Centro de Inteligencia del Negocio
      </h1>

      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="shadow text-center p-4 h-100">
            <h4>Ganancia Total</h4>
            <h1 className="text-success fw-bold">C$25,850</h1>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow text-center p-4 h-100">
            <h4>Satisfacción</h4>
            <h1 className="text-success fw-bold">93%</h1>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow text-center p-4 h-100">
            <h4>Mejor Empleado</h4>
            <h1 className="fw-bold">Snaijder</h1>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow text-center p-4 h-100">
            <h4>Calificación Promedio</h4>
            <h1 className="fw-bold">
              4.40 <span>⭐</span>
            </h1>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow p-4">
            <h4 className="mb-3">👨‍💼 Productividad del Personal</h4>
            <Bar data={productividadData} />
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow p-4">
            <h4 className="mb-3">💰 Ingresos por Empleado</h4>
            <Bar data={ingresosData} />
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow p-4">
            <h4 className="mb-3">📈 Servicios Más Rentables</h4>
            <Bar data={rentabilidadData} />
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow p-4">
            <h4 className="mb-3">🔥 Servicios con Mayor Demanda</h4>
            <Bar data={demandaData} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InteligenciaNegocio;