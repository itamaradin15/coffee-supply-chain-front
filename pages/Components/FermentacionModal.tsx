import React, { useState, useEffect } from "react";
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

const FermentacionModal = ({
  isOpenFermentacion,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estados para manejar los datos del formulario
  const [fermentacionData, setFermentacionData] = useState({
    duracionFermentacion: "",
    temperaturaPromedio: "",
    metodoFermentacion: "",
    fechaFermentacion: "",
  });
  const [isFermentacionAdded, setIsFermentacionAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenFermentacion && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false);
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            duracionFermentacion: lotData.fermentacion.duracionFermentacion || "",
            temperaturaPromedio: lotData.fermentacion.temperaturaPromedio || "",
            metodoFermentacion: lotData.fermentacion.metodoFermentacion || "",
            fechaFermentacion: lotData.fermentacion.fechaFermentacion || "",
          };
          setFermentacionData(formattedLotData);
          if (
            formattedLotData.duracionFermentacion &&
            formattedLotData.temperaturaPromedio &&
            formattedLotData.metodoFermentacion &&
            formattedLotData.fechaFermentacion
          ) {
            setIsFermentacionAdded(true);
          }
        } catch (error) {
          console.error("Error al consultar datos del lote:", error);
          setOnErrorStatus(true);
          setOnErrorMessage("Ocurrió un error al cargar los datos del lote.");
        } finally {
          setIsDataLoaded(true);
        }
      };
      fetchLotData();
    }
  }, [isOpenFermentacion, contract, lotId]);

  // Manejar cambios en los inputs
  const handleInputChangeFermentacion = (field, value) => {
    if (!isFermentacionAdded) {
      setFermentacionData({
        ...fermentacionData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de fermentación
  const addFermentacionData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);
        if (
          !fermentacionData.duracionFermentacion ||
          !fermentacionData.temperaturaPromedio ||
          !fermentacionData.metodoFermentacion ||
          !fermentacionData.fechaFermentacion
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }
        await contract.addFermentacionData(
          lotId,
          fermentacionData.duracionFermentacion,
          fermentacionData.temperaturaPromedio,
          fermentacionData.metodoFermentacion,
          fermentacionData.fechaFermentacion
        );
        setIsFermentacionAdded(true);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de fermentación:", error);
        setOnErrorStatus(true);
        setOnErrorMessage(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
      } finally {
        setLoading(false);
      }
    } else {
      setOnErrorStatus(true);
      setOnErrorMessage("El contrato no está cargado o no se ha seleccionado un lote.");
    }
  };

  // Función para cerrar la modal
  const handleCloseModal = () => {
    setFermentacionData({
      duracionFermentacion: "",
      temperaturaPromedio: "",
      metodoFermentacion: "",
      fechaFermentacion: "",
    });
    setIsFermentacionAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenFermentacion} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Agregar Datos de Fermentación</ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Duración de la fermentación:"
                    value={fermentacionData.duracionFermentacion}
                    variant="bordered"
                    isDisabled={isFermentacionAdded}
                    onChange={(e) =>
                      handleInputChangeFermentacion("duracionFermentacion", e.target.value)
                    }
                  />
                  <Input
                    label="Temperatura promedio:"
                    value={fermentacionData.temperaturaPromedio}
                    variant="bordered"
                    isDisabled={isFermentacionAdded}
                    onChange={(e) =>
                      handleInputChangeFermentacion("temperaturaPromedio", e.target.value)
                    }
                  />
                  <Input
                    label="Método de fermentación:"
                    value={fermentacionData.metodoFermentacion}
                    variant="bordered"
                    isDisabled={isFermentacionAdded}
                    onChange={(e) =>
                      handleInputChangeFermentacion("metodoFermentacion", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    label="Fecha de fermentación:"
                    value={fermentacionData.fechaFermentacion}
                    variant="bordered"
                    isDisabled={isFermentacionAdded}
                    onChange={(e) =>
                      handleInputChangeFermentacion("fechaFermentacion", e.target.value)
                    }
                  />
                  {isFermentacionAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de fermentación ya han sido registrados."
                        title="Datos de fermentación completos."
                        variant="faded"
                      />
                    </div>
                  )}
                  {onErrorStatus && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="danger"
                        title={onErrorMessage}
                        variant="faded"
                      />
                    </div>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={handleCloseModal}>
                Cerrar
              </Button>
              {!isFermentacionAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addFermentacionData}
                  >
                    {loading ? "Registrando..." : "Registrar fermentación"}
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

export default FermentacionModal;