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

const DespulpadoModal = ({
  isOpenDespulpado,
  onOpenChange, // Cambiar a onOpenChange para manejar el cierre
  contract,
  fetchAllLots,
  lotId, // Recibir el ID del lote como prop
}) => {
  // Estados para manejar los datos del formulario
  const [despulpadoData, setDespulpadoData] = useState({
    metodoDespulpado: "",
    fechaProceso: "",
    cantidadPulpaRetirada: "",
    destinoPulpa: "",
  });
  // Estados para manejar el estado de la modal
  const [isDespulpadoAdded, setIsDespulpadoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Para verificar si los datos fueron cargados

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenDespulpado && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false); // Reiniciar estado de carga
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            metodoDespulpado: lotData.despulpado.metodoDespulpado || "",
            fechaProceso: lotData.despulpado.fechaProceso || "",
            cantidadPulpaRetirada: lotData.despulpado.cantidadPulpaRetirada || "",
            destinoPulpa: lotData.despulpado.destinoPulpa || "",
          };

          // Actualizar el estado con los datos del lote
          setDespulpadoData(formattedLotData);

          // Verificar si ya hay datos de despulpado
          if (
            formattedLotData.metodoDespulpado &&
            formattedLotData.fechaProceso &&
            formattedLotData.cantidadPulpaRetirada &&
            formattedLotData.destinoPulpa
          ) {
            setIsDespulpadoAdded(true); // Desactivar edición si ya hay datos
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
  }, [isOpenDespulpado, contract, lotId]);

  // Función para manejar cambios en los inputs
  const handleInputChangeDespulpado = (field, value) => {
    if (!isDespulpadoAdded) {
      setDespulpadoData({
        ...despulpadoData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de despulpado a un lote existente
  const addDespulpadoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        // Validar campos
        if (
          !despulpadoData.metodoDespulpado ||
          !despulpadoData.fechaProceso ||
          !despulpadoData.cantidadPulpaRetirada ||
          !despulpadoData.destinoPulpa
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }

        // Llamar a la función del contrato para agregar datos de despulpado
        await contract.addDespulpadoData(
          lotId, // Usar el ID del lote recibido como prop
          despulpadoData.metodoDespulpado,
          despulpadoData.fechaProceso,
          despulpadoData.cantidadPulpaRetirada,
          despulpadoData.destinoPulpa
        );

        // Actualizar el estado
        setIsDespulpadoAdded(true);
        setOnErrorStatus(false);
        // Recargar los lotes
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de despulpado:", error);
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
    setDespulpadoData({
      metodoDespulpado: "",
      fechaProceso: "",
      cantidadPulpaRetirada: "",
      destinoPulpa: "",
    });
    setIsDespulpadoAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    // Cerrar la modal
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpenDespulpado}
      placement="top-center"
      onOpenChange={onOpenChange} // Usar onOpenChange para manejar el cierre
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Datos de Despulpado
            </ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Método de despulpado:"
                    value={despulpadoData.metodoDespulpado}
                    variant="bordered"
                    isDisabled={isDespulpadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeDespulpado("metodoDespulpado", e.target.value)
                    }
                  />
                  <Input
                    label="Fecha del proceso de despulpado:"
                    type="date"
                    value={despulpadoData.fechaProceso}
                    variant="bordered"
                    isDisabled={isDespulpadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeDespulpado("fechaProceso", e.target.value)
                    }
                  />
                  <Input
                    label="Cantidad de pulpa retirada:"
                    value={despulpadoData.cantidadPulpaRetirada}
                    variant="bordered"
                    isDisabled={isDespulpadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeDespulpado("cantidadPulpaRetirada", e.target.value)
                    }
                  />
                  <Input
                    label="Destino de la pulpa:"
                    value={despulpadoData.destinoPulpa}
                    variant="bordered"
                    isDisabled={isDespulpadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeDespulpado("destinoPulpa", e.target.value)
                    }
                  />
                  {isDespulpadoAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de despulpado ya han sido registrados."
                        title="Datos de despulpado completos."
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
              {!isDespulpadoAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addDespulpadoData}
                  >
                    {loading ? "Registrando..." : "Registrar despulpado"}
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

export default DespulpadoModal;