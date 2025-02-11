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

const LavadoModal = ({
  isOpenLavado,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estados para manejar los datos del formulario
  const [lavadoData, setLavadoData] = useState({
    volumenAguaUtilizada: "",
    metodoReciclajeAgua: "",
    cantidadAguaReutilizada: "",
    fechaLavado: "",
  });
  const [isLavadoAdded, setIsLavadoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenLavado && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false);
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            volumenAguaUtilizada: lotData.lavado.volumenAguaUtilizada || "",
            metodoReciclajeAgua: lotData.lavado.metodoReciclajeAgua || "",
            cantidadAguaReutilizada: lotData.lavado.cantidadAguaReutilizada || "",
            fechaLavado: lotData.lavado.fechaLavado || "",
          };
          setLavadoData(formattedLotData);
          if (
            formattedLotData.volumenAguaUtilizada &&
            formattedLotData.metodoReciclajeAgua &&
            formattedLotData.cantidadAguaReutilizada &&
            formattedLotData.fechaLavado
          ) {
            setIsLavadoAdded(true);
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
  }, [isOpenLavado, contract, lotId]);

  // Manejar cambios en los inputs
  const handleInputChangeLavado = (field, value) => {
    if (!isLavadoAdded) {
      setLavadoData({
        ...lavadoData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de lavado
  const addLavadoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);
        if (
          !lavadoData.volumenAguaUtilizada ||
          !lavadoData.metodoReciclajeAgua ||
          !lavadoData.cantidadAguaReutilizada ||
          !lavadoData.fechaLavado
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }
        await contract.addLavadoData(
          lotId,
          lavadoData.volumenAguaUtilizada,
          lavadoData.metodoReciclajeAgua,
          lavadoData.cantidadAguaReutilizada,
          lavadoData.fechaLavado
        );
        setIsLavadoAdded(true);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de lavado:", error);
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
    setLavadoData({
      volumenAguaUtilizada: "",
      metodoReciclajeAgua: "",
      cantidadAguaReutilizada: "",
      fechaLavado: "",
    });
    setIsLavadoAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenLavado} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Agregar Datos de Lavado</ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Volumen de agua utilizada:"
                    value={lavadoData.volumenAguaUtilizada}
                    variant="bordered"
                    isDisabled={isLavadoAdded}
                    onChange={(e) =>
                      handleInputChangeLavado("volumenAguaUtilizada", e.target.value)
                    }
                  />
                  <Input
                    label="Método de reciclaje de agua:"
                    value={lavadoData.metodoReciclajeAgua}
                    variant="bordered"
                    isDisabled={isLavadoAdded}
                    onChange={(e) =>
                      handleInputChangeLavado("metodoReciclajeAgua", e.target.value)
                    }
                  />
                  <Input
                    label="Cantidad de agua reutilizada:"
                    value={lavadoData.cantidadAguaReutilizada}
                    variant="bordered"
                    isDisabled={isLavadoAdded}
                    onChange={(e) =>
                      handleInputChangeLavado("cantidadAguaReutilizada", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    label="Fecha del lavado:"
                    value={lavadoData.fechaLavado}
                    variant="bordered"
                    isDisabled={isLavadoAdded}
                    onChange={(e) =>
                      handleInputChangeLavado("fechaLavado", e.target.value)
                    }
                  />
                  {isLavadoAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de lavado ya han sido registrados."
                        title="Datos de lavado completos."
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
              {!isLavadoAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addLavadoData}
                  >
                    {loading ? "Registrando..." : "Registrar lavado"}
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

export default LavadoModal;