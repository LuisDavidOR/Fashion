  import React, {useState} from "react";
  import { Modal, Form, Button, Table } from "react-bootstrap";

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
  }) => {
    const [deshabilitado, setDeshabilitado] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState("");

    const handleRegistrar = async () => {
      if (deshabilitado) return;
      setDeshabilitado(true);
      await agregarCita();
      setDeshabilitado(false);
    };
    return (
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
          <Modal.Title>Agregar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={nuevaCita.fecha}
                onChange={manejoCambioInput}
                placeholder="Ingresa la fecha de la cita"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora</Form.Label>
              <Form.Control
                type="time"
                name="hora"
                value={nuevaCita.hora}
                onChange={manejoCambioInput}
                placeholder="Ingresa la hora de la cita"
              />
            </Form.Group>
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

            <hr />

            <h5>Detalle de servicios</h5>

            <Form.Group className="mb-3">
              <Form.Label>Servicio</Form.Label>

              <div className="d-flex gap-2">
                <Form.Select
                  value={servicioSeleccionado}
                  onChange={(e) => setServicioSeleccionado(e.target.value)}
                >
                  <option value="">Seleccione un servicio</option>

                  {servicios.map((servicio) => (
                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                      {servicio.nombre} - C$ {servicio.precio}
                    </option>
                  ))}
                </Form.Select>

                <Button
                  variant="success"
                  onClick={() => {
                    agregarServicioDetalle(servicioSeleccionado);
                    setServicioSeleccionado("");
                  }}
                  disabled={servicioSeleccionado === ""}
                >
                  Agregar
                </Button>
              </div>
            </Form.Group>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
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
                      <td>C$ {item.precio.toFixed(2)}</td>
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

            <h5 className="text-end">
              Total: C${" "}
              {detalleCita
                .reduce((total, item) => total + Number(item.subtotal), 0)
                .toFixed(2)}
            </h5>
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
            variant="primary"
            onClick={handleRegistrar}
            disabled={
              nuevaCita.fecha.trim() === "" ||
              nuevaCita.hora.trim() === "" ||
              nuevaCita.id_cliente === "" ||
              nuevaCita.id_empleado === "" ||
              detalleCita.length === 0 ||
              deshabilitado
            }
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  export default ModalRegistroCita;