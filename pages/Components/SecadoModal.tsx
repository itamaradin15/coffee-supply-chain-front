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

const SecadoModal = ({
  isOpenSecado,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estado local para manejar los datos del formulario
  const [formData, setFormData] = useState({
    metodoSecado: "",
    humedadFinal: "",
    fechaSecado: "",
  });
  // Estados adicionales
  const [isSecadoAdded, setIsSecadoAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Para verificar si los datos fueron cargados

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenSecado && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false); // Reiniciar estado de carga
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            metodoSecado: lotData.secado.metodoSecado || "",
            humedadFinal: lotData.secado.humedadFinal || "",
            fechaSecado: lotData.secado.fechaSecado || "",
          };

          // Actualizar el estado con los datos del lote
          setFormData(formattedLotData);

          // Verificar si ya hay datos de secado
          if (formattedLotData.metodoSecado && formattedLotData.humedadFinal && formattedLotData.fechaSecado) {
            setIsSecadoAdded(true); // Desactivar edición si ya hay datos
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
  }, [isOpenSecado, contract, lotId]);

  // Manejar cambios en los inputs
  const handleInputChangeSecado = (field, value) => {
    if (!isSecadoAdded) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  // Agregar datos de secado
  const addSecadoData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        // Validar que todos los campos estén completos
        if (!formData.metodoSecado || !formData.humedadFinal || !formData.fechaSecado) {
          throw new Error("Por favor, complete todos los campos.");
        }

        // Llamar al contrato con los nuevos datos
        await contract.addSecadoData(
          lotId,
          formData.metodoSecado,
          formData.humedadFinal,
          formData.fechaSecado
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

  // Cerrar modal y reiniciar estados
  const handleCloseModal = () => {
    setFormData({
      metodoSecado: "",
      humedadFinal: "",
      fechaSecado: "",
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
              Datos de Secado
            </ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Método de secado:"
                    value={formData.metodoSecado}
                    variant="bordered"
                    isDisabled={isSecadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeSecado("metodoSecado", e.target.value)
                    }
                  />
                  <Input
                    label="Humedad final del grano:"
                    value={formData.humedadFinal}
                    variant="bordered"
                    isDisabled={isSecadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeSecado("humedadFinal", e.target.value)
                    }
                  />
                  <Input
                    label="Fecha del secado:"
                    type="date"
                    value={formData.fechaSecado}
                    variant="bordered"
                    isDisabled={isSecadoAdded} // Deshabilitar si ya hay datos
                    onChange={(e) =>
                      handleInputChangeSecado("fechaSecado", e.target.value)
                    }
                  />
                  {isSecadoAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de secado ya han sido registrados."
                        title="Datos de secado completos."
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