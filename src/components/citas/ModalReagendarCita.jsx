import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";

const ModalReagendarCita = ({
  mostrar,
  onHide,
  cita,
  calcularHorariosNoDisponibles,
  onGuardar,
}) => {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horariosNoDisponibles, setHorariosNoDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [deshabilitado, setDeshabilitado] = useState(false);

  useEffect(() => {
    if (cita && mostrar) {
      setFecha(cita.fecha || "");
      setHora(cita.hora || "");
    }
  }, [cita, mostrar]);

  useEffect(() => {
    const fetchHorarios = async () => {
      if (!fecha || !cita || !mostrar) {
        setHorariosNoDisponibles([]);
        return;
      }
      setCargandoHorarios(true);
      const bloqueados = await calcularHorariosNoDisponibles(
        fecha,
        cita.id_cliente,
        cita.id_cita
      );
      setHorariosNoDisponibles(bloqueados);
      setCargandoHorarios(false);
    };

    fetchHorarios();
  }, [fecha, cita, mostrar]);

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
  const horasManana = horasDisponibles.filter((h) => h.valor < "12:00");
  const horasTarde = horasDisponibles.filter((h) => h.valor >= "12:00");

  const handleGuardarLocal = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await onGuardar(cita, fecha, hora);
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrar}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Reagendar cita</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">
          Selecciona una nueva fecha y hora para reagendar tu cita. Recuerda que
          solo puedes programarla con al menos 1 hora de anticipación.
        </p>
        <Form>
          <div className="agenda-selector-box">
            <Form.Group className="mb-3">
              <Form.Label className="agenda-label">
                <i className="bi bi-calendar-event me-2"></i>
                Nueva fecha
              </Form.Label>
              <Form.Control
                type="date"
                min={obtenerFechaHoy()}
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setHora(""); // Restablecer la hora al cambiar de fecha
                }}
                className="agenda-fecha-input"
              />
            </Form.Group>

            <div>
              <div className="agenda-label mb-2 d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-clock me-2"></i>
                  Horarios disponibles
                </span>
                {cargandoHorarios && (
                  <Spinner animation="border" size="sm" variant="secondary" />
                )}
              </div>

              <div className="agenda-periodo">
                <span>Mañana</span>
                <div className="agenda-horas-grid">
                  {horasManana.map((h) => {
                    const noDisponible = horariosNoDisponibles?.includes(
                      h.valor
                    );
                    return (
                      <button
                        type="button"
                        key={h.valor}
                        disabled={noDisponible}
                        className={
                          noDisponible
                            ? "agenda-hora-chip no-disponible"
                            : hora === h.valor
                            ? "agenda-hora-chip seleccionado"
                            : "agenda-hora-chip"
                        }
                        onClick={() => !noDisponible && setHora(h.valor)}
                      >
                        {h.etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="agenda-periodo mt-3">
                <span>Tarde</span>
                <div className="agenda-horas-grid">
                  {horasTarde.map((h) => {
                    const noDisponible = horariosNoDisponibles?.includes(
                      h.valor
                    );
                    return (
                      <button
                        type="button"
                        key={h.valor}
                        disabled={noDisponible}
                        className={
                          noDisponible
                            ? "agenda-hora-chip no-disponible"
                            : hora === h.valor
                            ? "agenda-hora-chip seleccionado"
                            : "agenda-hora-chip"
                        }
                        onClick={() => !noDisponible && setHora(h.valor)}
                      >
                        {h.etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={deshabilitado}>
          Cancelar
        </Button>
        <Button
          style={{
            backgroundColor: "#7A564A",
            borderColor: "#7A564A",
            color: "#ffffff",
          }}
          onClick={handleGuardarLocal}
          disabled={
            fecha.trim() === "" ||
            hora.trim() === "" ||
            cargandoHorarios ||
            deshabilitado ||
            (cita && fecha === cita.fecha && hora === cita.hora)
          }
        >
          {deshabilitado ? "Reagendando..." : "Reagendar cita"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalReagendarCita;
