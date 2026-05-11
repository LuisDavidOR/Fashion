import React, { useMemo, useState } from "react";
import { Table, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCitas = ({
  citas,
  citaExpandida,
  setCitaExpandida,
  esEmpleado = false,
  aceptarCita,
  aceptandoCita,
  completarCita,
  completandoCita,
  vistaEmpleado = "disponibles",
}) => {

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");

  const obtenerColorEstado = (estado) => {
    if (estado === "pendiente") return "warning";
    if (estado === "aceptado") return "primary";
    if (estado === "completada") return "success";
    if (estado === "cancelada") return "danger";
    return "secondary";
  };

  const calcularTotal = (detalles) => {
    return detalles?.reduce((total, item) => total + Number(item.subtotal || 0), 0) || 0;
  };

  const formatearHora = (hora) => {
    if (!hora) return "Sin hora";

    const [h, m] = hora.split(":");
    const fecha = new Date();
    fecha.setHours(Number(h), Number(m));

    return fecha.toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const [year, month, day] = fecha.split("-");
    const fechaLocal = new Date(year, month - 1, day);

    return fechaLocal.toLocaleDateString("es-NI", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const citasFiltradas = useMemo(() => {
    return citas.filter((cita) => {
      const textoBusqueda = busqueda.toLowerCase();

      const cliente = `${cita.Clientes?.nombre || ""} ${cita.Clientes?.apellido || ""}`.toLowerCase();

      const empleado = `${cita.Empleados?.nombre || ""} ${cita.Empleados?.apellido || ""}`.toLowerCase();

      const estado = cita.estado_cita?.toLowerCase() || "";

      const servicios =
        cita.Detalle_cita?.map((detalle) => detalle.Servicios?.nombre || "")
          .join(" ")
          .toLowerCase() || "";

      const coincideBusqueda =
        cliente.includes(textoBusqueda) ||
        empleado.includes(textoBusqueda) ||
        estado.includes(textoBusqueda) ||
        servicios.includes(textoBusqueda);

      const coincideFecha = fechaFiltro
        ? cita.fecha === fechaFiltro
        : true;

      return coincideBusqueda && coincideFecha;
    });
  }, [citas, busqueda, fechaFiltro]);

  return (
    <>
      <div className="filtros-citas-box mb-3">
        <Row className="g-2 align-items-end">
          <Col xs={12} md={6}>
            <Form.Label className="fw-semibold">
              Buscar cita
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Buscar por cliente, empleado, estado o servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Col>

          <Col xs={8} md={4}>
            <Form.Label className="fw-semibold">
              Filtrar por fecha
            </Form.Label>
            <Form.Control
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
          </Col>

          <Col xs={4} md={2}>
            <Button
              variant="outline-secondary"
              className="w-100"
              onClick={() => {
                setBusqueda("");
                setFechaFiltro("");
              }}
            >
              Limpiar
            </Button>
          </Col>
        </Row>
      </div>

      <div className="tabla-citas-contenedor">
        <Table responsive borderless className="tabla-citas align-middle">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Empleado</th>
              <th>Estado</th>
              <th>Total</th>
              <th className="text-center">Detalles</th>
              {esEmpleado && <th className="text-center">Acción</th>}
            </tr>
          </thead>

          <tbody>
            {citasFiltradas.length > 0 ? (
              citasFiltradas.map((cita) => {
                const total = calcularTotal(cita.Detalle_cita);

                return (
                  <tr className="fila-cita" key={cita.id_cita}>
                    <td>
                      <strong>{formatearFecha(cita.fecha)}</strong>
                    </td>

                    <td>{formatearHora(cita.hora)}</td>

                    <td>
                      {cita.Clientes?.nombre} {cita.Clientes?.apellido}
                    </td>

                    <td>
                      {cita.Empleados?.nombre ? (
                        <>
                          <i className="bi bi-person-check me-1 text-success"></i>
                          {cita.Empleados.nombre} {cita.Empleados.apellido}
                        </>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-hourglass-split me-1"></i>
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td>
                      <Badge bg={obtenerColorEstado(cita.estado_cita)}>
                        {cita.estado_cita}
                      </Badge>
                    </td>

                    <td>
                      <strong>C$ {total.toFixed(2)}</strong>
                    </td>

                    <td className="text-center">
                      <Button
                        size="sm"
                        className="btn-ver-detalle-cita"
                        onClick={() => setCitaSeleccionada(cita)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Ver
                      </Button>
                    </td>

                    {esEmpleado && (
                      <td className="text-center">
                        {vistaEmpleado === "disponibles" &&
                        cita.estado_cita === "pendiente" &&
                        !cita.id_empleado ? (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={aceptandoCita === cita.id_cita}
                            onClick={() => aceptarCita(cita)}
                          >
                            {aceptandoCita === cita.id_cita ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Aceptando
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-1"></i>
                                Aceptar
                              </>
                            )}
                          </Button>
                        ) : vistaEmpleado === "asignadas" &&
                          cita.estado_cita === "aceptado" ? (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={completandoCita === cita.id_cita}
                            onClick={() => completarCita(cita)}
                          >
                            {completandoCita === cita.id_cita ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Completando
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check2-circle me-1"></i>
                                Completar
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted small">Sin acción</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={esEmpleado ? 8 : 7} className="text-center py-4 text-muted">
                  No se encontraron citas con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal
        show={!!citaSeleccionada}
        onHide={() => setCitaSeleccionada(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-receipt-cutoff me-2"></i>
            Detalle de cita
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {citaSeleccionada && (
            <>
              <Row className="mb-3 g-3">
                <Col xs={12} md={4}>
                  <strong>Fecha:</strong>
                  <p className="mb-0">{formatearFecha(citaSeleccionada.fecha)}</p>
                </Col>

                <Col xs={12} md={4}>
                  <strong>Hora:</strong>
                  <p className="mb-0">{formatearHora(citaSeleccionada.hora)}</p>
                </Col>

                <Col xs={12} md={4}>
                  <strong>Estado:</strong>
                  <p className="mb-0">
                    <Badge bg={obtenerColorEstado(citaSeleccionada.estado_cita)}>
                      {citaSeleccionada.estado_cita}
                    </Badge>
                  </p>
                </Col>

                <Col xs={12} md={6}>
                  <strong>Cliente:</strong>
                  <p className="mb-0">
                    {citaSeleccionada.Clientes?.nombre}{" "}
                    {citaSeleccionada.Clientes?.apellido}
                  </p>
                </Col>

                <Col xs={12} md={6}>
                  <strong>Empleado:</strong>
                  <p className="mb-0">
                    {citaSeleccionada.Empleados?.nombre
                      ? `${citaSeleccionada.Empleados.nombre} ${citaSeleccionada.Empleados.apellido}`
                      : "Pendiente de asignación"}
                  </p>
                </Col>
              </Row>

              <h6 className="fw-bold mb-3">
                <i className="bi bi-stars me-2"></i>
                Servicios realizados
              </h6>

              {citaSeleccionada.Detalle_cita?.length > 0 ? (
                <div className="detalle-cita-grid">
                  {citaSeleccionada.Detalle_cita.map((detalle) => (
                    <div
                      className="detalle-servicio-card"
                      key={detalle.id_detalle_cita}
                    >
                      <div>
                        <strong>
                          {detalle.Servicios?.nombre || "Servicio"}
                        </strong>

                        <p className="mb-0 text-muted small">
                          Precio base: C${" "}
                          {Number(detalle.Servicios?.precio || 0).toFixed(2)}
                        </p>

                        <p className="mb-0 text-muted small">
                          Costo insumos: C${" "}
                          {Number(detalle.costo_insumo || 0).toFixed(2)}
                        </p>

                        <p className="mb-0 text-muted small">
                          Costo empleado: C${" "}
                          {Number(detalle.costo_empleado || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-end">
                        <span>Subtotal</span>
                        <strong>
                          C$ {Number(detalle.subtotal || 0).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">
                  Esta cita no tiene servicios registrados.
                </p>
              )}

              <div className="text-end mt-4">
                <span className="text-muted d-block">Total</span>
                <h5 className="fw-bold">
                  C$ {calcularTotal(citaSeleccionada.Detalle_cita).toFixed(2)}
                </h5>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TablaCitas;