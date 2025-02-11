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

const ImpactoModal = ({
  isOpenImpacto,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estados para manejar los datos del formulario
  const [impactoData, setImpactoData] = useState({
    ayudaFamilias: "",
    pagoSobrePromedio: "",
    reduccionPesticidas: "",
    usoComposta: "",
    fechaImpacto: "", // Nuevo campo para la fecha
  });
  // Estados para manejar el estado de la modal
  const [isImpactoAdded, setIsImpactoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Para verificar si los datos fueron cargados

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenImpacto && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false); // Reiniciar estado de carga
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            ayudaFamilias: lotData.impacto.ayudaFamilias || "",
            pagoSobrePromedio: lotData.impacto.pagoSobrePromedio || "",
            reduccionPesticidas: lotData.impacto.reduccionPesticidas || "",
            usoComposta: lotData.impacto.usoComposta || "",
            fechaImpacto: lotData.impacto.fechaImpacto || "",
          };

          // Actualizar el estado con los datos del lote
          setImpactoData(formattedLotData);

          // Verificar si ya hay datos de impacto
          if (
            formattedLotData.ayudaFamilias &&
            formattedLotData.pagoSobrePromedio &&
            formattedLotData.reduccionPesticidas &&
            formattedLotData.usoComposta &&
            formattedLotData.fechaImpacto
          ) {
            setIsImpactoAdded(true); // Desactivar edición si ya hay datos
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
  }, [isOpenImpacto, contract, lotId]);

  // Función para manejar cambios en los inputs
  const handleInputChangeImpacto = (field, value) => {
    if (!isImpactoAdded) {
      setImpactoData({
        ...impactoData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de impacto a un lote existente
  const addImpactoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        // Validar campos
        if (
          !impactoData.ayudaFamilias ||
          !impactoData.pagoSobrePromedio ||
          !impactoData.reduccionPesticidas ||
          !impactoData.usoComposta ||
          !impactoData.fechaImpacto
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }

        // Llamar a la función del contrato para agregar datos de impacto
        await contract.addImpactoData(
          lotId, // Usar el ID del lote recibido como prop
          impactoData.ayudaFamilias,
          impactoData.pagoSobrePromedio,
          impactoData.reduccionPesticidas,
          impactoData.usoComposta,
          impactoData.fechaImpacto
        );

        // Actualizar el estado
        setIsImpactoAdded(true);
        setOnErrorStatus(false);
        // Recargar los lotes
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

  // Función para cerrar la modal y reiniciar los estados
  const handleCloseModal = () => {
    // Reiniciar los estados
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
    // Cerrar la modal
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpenImpacto}
      placement="top-center"
      onOpenChange={onOpenChange} // Usar onOpenChange para manejar el cierre
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Datos de Impacto Social y Ambiental
            </ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Ayuda a familias de caficultores:"
                    value={impactoData.ayudaFamilias}
                    variant="bordered"
                    isDisabled={isImpactoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeImpacto("ayudaFamilias", e.target.value)
                    }
                  />
                  <Input
                    label="Pago sobre el promedio:"
                    value={impactoData.pagoSobrePromedio}
                    variant="bordered"
                    isDisabled={isImpactoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeImpacto("pagoSobrePromedio", e.target.value)
                    }
                  />
                  <Input
                    label="Reducción de pesticidas:"
                    value={impactoData.reduccionPesticidas}
                    variant="bordered"
                    isDisabled={isImpactoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeImpacto("reduccionPesticidas", e.target.value)
                    }
                  />
                  <Input
                    label="Uso de composta:"
                    value={impactoData.usoComposta}
                    variant="bordered"
                    isDisabled={isImpactoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeImpacto("usoComposta", e.target.value)
                    }
                  />
                  <Input
                    type="date" // Campo de tipo fecha
                    label="Fecha del impacto:"
                    value={impactoData.fechaImpacto}
                    variant="bordered"
                    isDisabled={isImpactoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeImpacto("fechaImpacto", e.target.value)
                    }
                  />
                  {isImpactoAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de impacto ya han sido registrados."
                        title="Datos de impacto completos."
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