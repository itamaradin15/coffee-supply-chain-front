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

const SecadoModal = ({
  isOpenSecado,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  const [secadoData, setSecadoData] = useState({
    metodoSecado: "",
    humedadFinal: "",
  });

  const [isSecadoAdded, setIsSecadoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");

  const handleInputChangeSecado = (field, value) => {
    setSecadoData({
      ...secadoData,
      [field]: value,
    });
  };

  const addSecadoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        if (!secadoData.metodoSecado || !secadoData.humedadFinal) {
          throw new Error("Por favor, complete todos los campos.");
        }

        await contract.addSecadoData(
          lotId,
          secadoData.metodoSecado,
          secadoData.humedadFinal
        );

        setIsSecadoAdded(true);
        setOnErrorStatus(false);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de secado:", error);
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
    setSecadoData({
      metodoSecado: "",
      humedadFinal: "",
    });
    setIsSecadoAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenSecado} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Agregar Datos de Secado
            </ModalHeader>
            <ModalBody>
              {!isSecadoAdded && (
                <>
                  <Input
                    label="Método de secado:"
                    value={secadoData.metodoSecado}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeSecado("metodoSecado", e.target.value)
                    }
                  />
                  <Input
                    label="Humedad final del grano:"
                    value={secadoData.humedadFinal}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeSecado("humedadFinal", e.target.value)
                    }
                  />
                </>
              )}
              {isSecadoAdded && (
                <div className="flex items-center justify-center w-full">
                  <Alert
                    hideIcon
                    color="success"
                    description="Los datos de secado han sido agregados exitosamente."
                    title="Datos de secado registrados."
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
              {!isSecadoAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addSecadoData}
                  >
                    {loading ? "Registrando..." : "Registrar secado"}
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

export default SecadoModal;