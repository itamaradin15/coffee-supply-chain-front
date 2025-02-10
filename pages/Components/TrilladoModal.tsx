import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
  Spinner,
} from "@nextui-org/react";

const TrilladoModal = ({
  isOpenTrillado,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  const [trilladoData, setTrilladoData] = useState({
    fechaTrillado: "",
    cantidadTrillada: "",
  });

  const [isTrilladoAdded, setIsTrilladoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");

  const handleInputChangeTrillado = (field, value) => {
    setTrilladoData({
      ...trilladoData,
      [field]: value,
    });
  };

  const addTrilladoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        if (!trilladoData.fechaTrillado || !trilladoData.cantidadTrillada) {
          throw new Error("Por favor, complete todos los campos.");
        }

        await contract.addTrilladoData(
          lotId,
          trilladoData.fechaTrillado,
          trilladoData.cantidadTrillada
        );

        setIsTrilladoAdded(true);
        setOnErrorStatus(false);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de trillado:", error);
        setOnErrorStatus(true);
        if (error instanceof Error) {
          setOnErrorMessage(error.message);
        } else {
          setOnErrorMessage("Ocurrió un error desconocido.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setOnErrorStatus(true);
      setOnErrorMessage("El contrato no está cargado o no se ha seleccionado un lote.");
    }
  };

  const handleCloseModal = () => {
    setTrilladoData({
      fechaTrillado: "",
      cantidadTrillada: "",
    });
    setIsTrilladoAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenTrillado} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Agregar Datos de Trillado
            </ModalHeader>
            <ModalBody>
              {!isTrilladoAdded && (
                <>
                  <Input
                    label="Fecha de trillado:"
                    type="date"
                    value={trilladoData.fechaTrillado}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeTrillado("fechaTrillado", e.target.value)
                    }
                  />
                  <Input
                    label="Cantidad de café trillado:"
                    value={trilladoData.cantidadTrillada}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeTrillado("cantidadTrillada", e.target.value)
                    }
                  />
                </>
              )}
              {isTrilladoAdded && (
                <div className="flex items-center justify-center w-full">
                  <Alert
                    hideIcon
                    color="success"
                    description="Los datos de trillado han sido agregados exitosamente."
                    title="Datos de trillado registrados."
                    variant="faded"
                  />
                </div>
              )}
              {onErrorStatus && (
                <div className="flex items-center justify-center w-full">
                  <Alert
                    hideIcon
                    color="danger"
                    title={onErrorMessage}
                    variant="faded"
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={handleCloseModal}>
                Cerrar
              </Button>
              {!isTrilladoAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addTrilladoData}
                  >
                    {loading ? "Registrando..." : "Registrar trillado"}
                  </Button>
                  {loading && <Spinner />}
                </div>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TrilladoModal;