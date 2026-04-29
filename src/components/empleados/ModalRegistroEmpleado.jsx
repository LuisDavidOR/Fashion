import React, {useState} from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroEmpleado = ({
  mostrarModal,
  setMostrarModal,
  nuevoEmpleado,
  manejoCambioInput,
  agregarEmpleado,
  limpiarEmpleado
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarEmpleado();
    setDeshabilitado(false);
  };

  

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarEmpleado();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoEmpleado.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre del empleado"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoEmpleado.apellido}
              onChange={manejoCambioInput}
              placeholder="Ingresa el apellido del empleado"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={nuevoEmpleado.telefono}
              onChange={manejoCambioInput}
              placeholder="Ingresa el número de teléfono (8 dígitos)"
              maxLength={8}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={nuevoEmpleado.correo}
              onChange={manejoCambioInput}
              placeholder="Ingresa el correo (ej: usuario@gmail.com)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Especialidad</Form.Label>
            <Form.Select
              name="especialidad"
              value={nuevoEmpleado.especialidad}
              onChange={manejoCambioInput}
            >
              <option value="">Seleccione una especialidad</option>
              <option value="Corte">Corte</option>
              <option value="Coloración">Coloración</option>
              <option value="Manicure">Manicure</option>
              <option value="Pedicure">Pedicure</option>
              <option value="Maquillaje">Maquillaje</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Comisión {nuevoEmpleado.comision || 0}%</Form.Label>
            <Form.Control
              type="number"
              name="comision"
              value={nuevoEmpleado.comision}
              onChange={manejoCambioInput}
              placeholder="Ingresa la comisión del empleado (ej: 30)"
              min="0"
              max="100"
              step="0.1"
            />
          </Form.Group>
          <small className="text-muted">
            Se aplicará como {nuevoEmpleado.comision || 0}%
          </small>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            limpiarEmpleado();
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
            nuevoEmpleado.nombre.trim() === "" ||
            nuevoEmpleado.apellido.trim() === "" ||
            //!/^[0-9]{8}$/.test(nuevoEmpleado.telefono) ||
            //!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmpleado.correo) ||
            deshabilitado
          }
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroEmpleado;