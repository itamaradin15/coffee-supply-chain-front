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

const EmpaqueModal = ({
  isOpenEmpaque,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estados para manejar los datos del formulario
  const [empaqueData, setEmpaqueData] = useState({
    tipoEmpaque: "",
    pesoLote: "",
    fechaEmpaque: "",
  });
  const [isEmpaqueAdded, setIsEmpaqueAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenEmpaque && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false);
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            tipoEmpaque: lotData.empaque.tipoEmpaque || "",
            pesoLote: lotData.empaque.pesoLote || "",
            fechaEmpaque: lotData.empaque.fechaEmpaque || "",
          };
          setEmpaqueData(formattedLotData);
          if (
            formattedLotData.tipoEmpaque &&
            formattedLotData.pesoLote &&
            formattedLotData.fechaEmpaque
          ) {
            setIsEmpaqueAdded(true);
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
  }, [isOpenEmpaque, contract, lotId]);

  // Manejar cambios en los inputs
  const handleInputChangeEmpaque = (field, value) => {
    if (!isEmpaqueAdded) {
      setEmpaqueData({
        ...empaqueData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de empaque
  const addEmpaqueData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);
        if (
          !empaqueData.tipoEmpaque ||
          !empaqueData.pesoLote ||
          !empaqueData.fechaEmpaque
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }
        await contract.addEmpaqueData(
          lotId,
          empaqueData.tipoEmpaque,
          empaqueData.pesoLote,
          empaqueData.fechaEmpaque
        );
        setIsEmpaqueAdded(true);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de empaque:", error);
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
    setEmpaqueData({
      tipoEmpaque: "",
      pesoLote: "",
      fechaEmpaque: "",
    });
    setIsEmpaqueAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenEmpaque} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Agregar Datos de Empaque
            </ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Tipo de empaque:"
                    value={empaqueData.tipoEmpaque}
                    variant="bordered"
                    isDisabled={isEmpaqueAdded}
                    onChange={(e) =>
                      handleInputChangeEmpaque("tipoEmpaque", e.target.value)
                    }
                  />
                  <Input
                    label="Peso del lote:"
                    value={empaqueData.pesoLote}
                    variant="bordered"
                    isDisabled={isEmpaqueAdded}
                    onChange={(e) =>
                      handleInputChangeEmpaque("pesoLote", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    label="Fecha de empaque:"
                    value={empaqueData.fechaEmpaque}
                    variant="bordered"
                    isDisabled={isEmpaqueAdded}
                    onChange={(e) =>
                      handleInputChangeEmpaque("fechaEmpaque", e.target.value)
                    }
                  />
                  {isEmpaqueAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de empaque ya han sido registrados."
                        title="Datos de empaque completos."
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
              {!isEmpaqueAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addEmpaqueData}
                  >
                    {loading ? "Registrando..." : "Registrar empaque"}
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

export default EmpaqueModal;