import React, {useState} from "react";
import { Modal, Form, Button, Table } from "react-bootstrap";

import ModalSeleccionServicios from "./ModalSeleccionServicios";

const ModalRegistroCita = ({
  mostrarModal,
  setMostrarModal,
  nuevaCita,
  manejoCambioInput,
  agregarCita,
  limpiarCita,
  clientes,
  empleados,
  servicios,
  detalleCita,
  agregarServicioDetalle,
  eliminarServicioDetalle,
  rol,
  esAdmin,
  esCliente,
  horariosNoDisponibles,
  cargandoHorarios,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [mostrarModalServicios, setMostrarModalServicios] = useState(false);

  const calcularTotal = () => {
    return detalleCita.reduce(
      (total, item) => total + Number(item.subtotal || 0),
      0
    );
  };

  const calcularDuracionTotal = () => {
    return detalleCita.reduce(
      (total, item) => total + Number(item.duracion || 0),
      0
    );
  };

  const formatearDuracion = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0 && mins > 0) {
      return `${horas} h ${mins} min`;
    }

    if (horas > 0) {
      return `${horas} h`;
    }

    return `${mins} min`;
  };

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const generarHorasDisponibles = () => {
    const horas = [];

    for (let hora = 8; hora <= 19; hora++) {
      for (let minuto of [0, 30]) {
        const valor = `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
        const hora12 = hora % 12 === 0 ? 12 : hora % 12;
        const periodo = hora < 12 ? "AM" : "PM";
        const etiqueta = `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;

        horas.push({ valor, etiqueta });
      }
    }

    return horas;
  };

  const horasDisponibles = generarHorasDisponibles();

  const horasManana = horasDisponibles.filter((hora) => hora.valor < "12:00");
  const horasTarde = horasDisponibles.filter((hora) => hora.valor >= "12:00");

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCita();
    setDeshabilitado(false);
  };
  return (
    <>
      <Modal
        show={mostrarModal}
        onHide={() => {
          limpiarCita();
          setMostrarModal(false);
        }}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
          {esCliente ? "Agendar cita" : "Agregar cita"}
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {esCliente && (
            <p className="text-muted mb-3">
              Selecciona la fecha, hora y los servicios que deseas agendar. Tu cita quedará pendiente hasta que un empleado la acepte.
            </p>
          )}
          <Form>
            <div className="nota-cita-tiempo">
              <i className="bi bi-info-circle me-2"></i>
              Puedes agendar con al menos 1 hora de anticipación.
            </div>

            <div className="agenda-selector-box">
              <Form.Group className="mb-3">
                <Form.Label className="agenda-label">
                  <i className="bi bi-calendar-event me-2"></i>
                  Fecha de la cita
                </Form.Label>

                <Form.Control
                  type="date"
                  name="fecha"
                  min={obtenerFechaHoy()}
                  value={nuevaCita.fecha}
                  onChange={manejoCambioInput}
                  className="agenda-fecha-input"
                />
              </Form.Group>

              <div>
                <div className="agenda-label mb-2">
                  <i className="bi bi-clock me-2"></i>
                  Horarios disponibles
                </div>

                <div className="agenda-periodo">
                  <span>Mañana</span>
                  <div className="agenda-horas-grid">
                    {horasManana.map((hora) => {
                      const noDisponible =
                        horariosNoDisponibles?.includes(hora.valor);

                      return (
                        <button
                          type="button"
                          key={hora.valor}
                          disabled={noDisponible}
                          className={
                            noDisponible
                              ? "agenda-hora-chip no-disponible"
                              : nuevaCita.hora === hora.valor
                                ? "agenda-hora-chip seleccionado"
                                : "agenda-hora-chip"
                          }
                          onClick={() =>
                            !noDisponible &&
                            manejoCambioInput({
                              target: {
                                name: "hora",
                                value: hora.valor,
                              },
                            })
                          }
                        >
                          {hora.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="agenda-periodo mt-3">
                  <span>Tarde</span>
                  <div className="agenda-horas-grid">
                    {horasTarde.map((hora) => {
                      const noDisponible =
                        horariosNoDisponibles?.includes(hora.valor);

                      return (
                        <button
                          type="button"
                          key={hora.valor}
                          disabled={noDisponible}
                          className={
                            noDisponible
                              ? "agenda-hora-chip no-disponible"
                              : nuevaCita.hora === hora.valor
                                ? "agenda-hora-chip seleccionado"
                                : "agenda-hora-chip"
                          }
                          onClick={() =>
                            !noDisponible &&
                            manejoCambioInput({
                              target: {
                                name: "hora",
                                value: hora.valor,
                              },
                            })
                          }
                        >
                          {hora.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          {esAdmin && (
          <Form.Group className="mb-3">
            <Form.Label>Cliente</Form.Label>
            <Form.Select
              name="id_cliente"
              value={nuevaCita.id_cliente}
              onChange={manejoCambioInput}
            >
              <option value="">Seleccione un cliente</option>

              {clientes.map((cat) => (
                <option key={cat.id_cliente} value={cat.id_cliente}>
                  {cat.nombre} {cat.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
            {esAdmin && (
            <Form.Group className="mb-3">
              <Form.Label>Empleado</Form.Label>
              <Form.Select
                name="id_empleado"
                value={nuevaCita.id_empleado}
                onChange={manejoCambioInput}
              >
                <option value="">Seleccione un empleado</option>

                {empleados.map((cat) => (
                  <option key={cat.id_empleado} value={cat.id_empleado}>
                    {cat.nombre} {cat.apellido}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

            <hr />

            <h5>Detalle de servicios</h5>

            <div className="bloque-servicios-cita mb-3">
              <div>
                <h5 className="mb-1">Servicios seleccionados</h5>
                <p className="text-muted small mb-0">
                  Agrega uno o varios servicios para calcular duración y total.
                </p>
              </div>

              <Button
                className="btn-buscar-servicios-cita"
                onClick={() => setMostrarModalServicios(true)}
              >
                <i className="bi bi-search me-2"></i>
                Buscar servicios
              </Button>
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Duración</th>
                  <th>Precio</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {detalleCita.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No hay servicios agregados.
                    </td>
                  </tr>
                ) : (
                  detalleCita.map((item) => (
                    <tr key={item.id_servicio}>
                      <td>{item.nombre}</td>
                      <td>{item.duracion} min</td>
                      <td>C$ {item.subtotal.toFixed(2)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarServicioDetalle(item.id_servicio)}
                        >
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <div className="resumen-cita mt-3">
              <div>
                <span className="text-muted">Duración estimada</span>
                <h6 className="mb-0">
                  {formatearDuracion(calcularDuracionTotal())}
                </h6>
              </div>

              <div className="text-end">
                <span className="text-muted">Total</span>
                <h5 className="mb-0">
                  C$ {calcularTotal().toFixed(2)}
                </h5>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              limpiarCita();
              setMostrarModal(false);
            }}
          >
            Cancelar
          </Button>
          <Button
          style={{
              backgroundColor: "#7A564A",
              borderColor: "#7A564A",
              color: "#ffffff"
            }}
            onClick={handleRegistrar}
            disabled={
            nuevaCita.fecha.trim() === "" ||
            nuevaCita.hora.trim() === "" ||
            detalleCita.length === 0 ||
            deshabilitado ||
            (
              esAdmin &&
              (
                nuevaCita.id_cliente === "" ||
                nuevaCita.id_empleado === ""
              )
            )
          }
          >
          {deshabilitado
            ? "Guardando..."
            : esCliente
              ? "Agendar cita"
              : "Guardar"}
        </Button>
        </Modal.Footer>
      </Modal>

      <ModalSeleccionServicios
        mostrarModalServicios={mostrarModalServicios}
        setMostrarModalServicios={setMostrarModalServicios}
        servicios={servicios}
        detalleCita={detalleCita}
        agregarServicioDetalle={agregarServicioDetalle}
        eliminarServicioDetalle={eliminarServicioDetalle}
      />
    </>
  );
};

export default ModalRegistroCita;