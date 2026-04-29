import React, {useState} from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroInsumo = ({
  mostrarModal,
  setMostrarModal,
  nuevoInsumo,
  manejoCambioInput,
  agregarInsumo,
  limpiarInsumo
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarInsumo();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => {
        limpiarInsumo();
        setMostrarModal(false);
      }}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Insumo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoInsumo.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre de Insumo"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              type="textarea"
              name="descripcion"
              value={nuevoInsumo.descripcion}
              onChange={manejoCambioInput}
              placeholder="Ingresa la descripción"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Costo</Form.Label>
            <Form.Control
              type="number"
              name="costo_producto"
              value={nuevoInsumo.costo_producto}
              onChange={manejoCambioInput}
              placeholder="Ingresa el costo del producto"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contenido del Producto</Form.Label>
            <Form.Control
              type="number"
              name="contenido_total"
              value={nuevoInsumo.contenido_total}
              onChange={manejoCambioInput}
              placeholder="Ingresa el contenido total del producto (ej. 1000)"
            />
          </Form.Group>
          <Form.Select
            name="unidad_medida"
            value={nuevoInsumo.unidad_medida}
            onChange={manejoCambioInput}
          >
            <option value="">Seleccione una unidad</option>
            <option value="ml">ml - mililitros</option>
            <option value="g">g - gramos</option>
            <option value="kg">kg - kilogramos</option>
            <option value="oz">oz - onzas</option>
            <option value="lb">lb - libras</option>
            <option value="lt">lt - litros</option>
          </Form.Select>
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="text"
              name="stock"
              value={nuevoInsumo.stock}
              onChange={manejoCambioInput}
              placeholder="Ingresa el Stock"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            limpiarInsumo();
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
          disabled={nuevoInsumo.nombre.trim() === "" || deshabilitado}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroInsumo;