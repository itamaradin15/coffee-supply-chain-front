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

const ImpactoModal = ({
  isOpenImpacto,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  const [impactoData, setImpactoData] = useState({
    ayudaFamilias: "",
    pagoSobrePromedio: "",
    reduccionPesticidas: "",
    usoComposta: "",
    fechaImpacto: "", // Nuevo campo para la fecha
  });

  const [isImpactoAdded, setIsImpactoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");

  const handleInputChangeImpacto = (field, value) => {
    setImpactoData({
      ...impactoData,
      [field]: value,
    });
  };

  const addImpactoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        // Validar que todos los campos estén completos
        if (
          !impactoData.ayudaFamilias ||
          !impactoData.pagoSobrePromedio ||
          !impactoData.reduccionPesticidas ||
          !impactoData.usoComposta ||
          !impactoData.fechaImpacto // Validar el nuevo campo
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }

        // Llamar al contrato con los nuevos datos
        await contract.addImpactoData(
          lotId,
          impactoData.ayudaFamilias,
          impactoData.pagoSobrePromedio,
          impactoData.reduccionPesticidas,
          impactoData.usoComposta,
          impactoData.fechaImpacto // Enviar la fecha
        );

        setIsImpactoAdded(true);
        setOnErrorStatus(false);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de impacto:", error);
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
    setImpactoData({
      ayudaFamilias: "",
      pagoSobrePromedio: "",
      reduccionPesticidas: "",
      usoComposta: "",
      fechaImpacto: "", // Reiniciar el campo de fecha
    });
    setIsImpactoAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenImpacto} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Agregar Datos de Impacto Social y Ambiental
            </ModalHeader>
            <ModalBody>
              {!isImpactoAdded && (
                <>
                  <Input
                    label="Ayuda a familias de caficultores:"
                    value={impactoData.ayudaFamilias}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeImpacto("ayudaFamilias", e.target.value)
                    }
                  />
                  <Input
                    label="Pago sobre el promedio:"
                    value={impactoData.pagoSobrePromedio}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeImpacto("pagoSobrePromedio", e.target.value)
                    }
                  />
                  <Input
                    label="Reducción de pesticidas:"
                    value={impactoData.reduccionPesticidas}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeImpacto("reduccionPesticidas", e.target.value)
                    }
                  />
                  <Input
                    label="Uso de composta:"
                    value={impactoData.usoComposta}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeImpacto("usoComposta", e.target.value)
                    }
                  />
                  <Input
                    type="date" // Nuevo campo de tipo fecha
                    label="Fecha del impacto:"
                    value={impactoData.fechaImpacto}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeImpacto("fechaImpacto", e.target.value)
                    }
                  />
                </>
              )}
              {isImpactoAdded && (
                <div className="flex items-center justify-center w-full">
                  <Alert
                    hideIcon
                    color="success"
                    description="Los datos de impacto han sido agregados exitosamente."
                    title="Datos de impacto registrados."
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
              {!isImpactoAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addImpactoData}
                  >
                    {loading ? "Registrando..." : "Registrar impacto"}
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

export default ImpactoModal;