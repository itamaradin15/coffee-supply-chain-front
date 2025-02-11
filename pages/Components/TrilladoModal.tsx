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

const TrilladoModal = ({
  isOpenTrillado,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estados para manejar los datos del formulario
  const [trilladoData, setTrilladoData] = useState({
    fechaTrillado: "",
    cantidadTrillada: "",
  });
  // Estados para manejar el estado de la modal
  const [isTrilladoAdded, setIsTrilladoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Para verificar si los datos fueron cargados

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenTrillado && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false); // Reiniciar estado de carga
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            fechaTrillado: lotData.trillado.fechaTrillado || "",
            cantidadTrillada: lotData.trillado.cantidadTrillada || "",
          };

          // Actualizar el estado con los datos del lote
          setTrilladoData(formattedLotData);

          // Verificar si ya hay datos de trillado
          if (formattedLotData.fechaTrillado && formattedLotData.cantidadTrillada) {
            setIsTrilladoAdded(true); // Desactivar edición si ya hay datos
          }
        } catch (error) {
          console.error("Error al consultar datos del lote:", error);
          setOnErrorStatus(true);
          setOnErrorMessage("Ocurrió un error al cargar los datos del lote.");
        } finally {
          setIsDataLoaded(true); // Marcar como cargado
        }
      };

      fetchLotData();
    }
  }, [isOpenTrillado, contract, lotId]);

  // Función para manejar cambios en los inputs
  const handleInputChangeTrillado = (field, value) => {
    if (!isTrilladoAdded) {
      setTrilladoData({
        ...trilladoData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de trillado a un lote existente
  const addTrilladoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        // Validar campos
        if (!trilladoData.fechaTrillado || !trilladoData.cantidadTrillada) {
          throw new Error("Por favor, complete todos los campos.");
        }

        // Llamar a la función del contrato para agregar datos de trillado
        await contract.addTrilladoData(
          lotId, // Usar el ID del lote recibido como prop
          trilladoData.fechaTrillado,
          trilladoData.cantidadTrillada
        );

        // Actualizar el estado
        setIsTrilladoAdded(true);
        setOnErrorStatus(false);
        // Recargar los lotes
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

  // Función para cerrar la modal y reiniciar los estados
  const handleCloseModal = () => {
    // Reiniciar los estados
    setTrilladoData({
      fechaTrillado: "",
      cantidadTrillada: "",
    });
    setIsTrilladoAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    // Cerrar la modal
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpenTrillado}
      placement="top-center"
      onOpenChange={onOpenChange} // Usar onOpenChange para manejar el cierre
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Datos de Trillado
            </ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Fecha de trillado:"
                    type="date"
                    value={trilladoData.fechaTrillado}
                    variant="bordered"
                    isDisabled={isTrilladoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeTrillado("fechaTrillado", e.target.value)
                    }
                  />
                  <Input
                    label="Cantidad de café trillado:"
                    value={trilladoData.cantidadTrillada}
                    variant="bordered"
                    isDisabled={isTrilladoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeTrillado("cantidadTrillada", e.target.value)
                    }
                  />
                  {isTrilladoAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de trillado ya han sido registrados."
                        title="Datos de trillado completos."
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