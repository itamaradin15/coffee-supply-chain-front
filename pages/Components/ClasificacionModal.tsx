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

const ClasificacionGranoModal = ({
  isOpenClasificacion,
  onOpenChange,
  contract,
  fetchAllLots,
  lotId,
}) => {
  // Estados para manejar los datos del formulario
  const [clasificacionData, setClasificacionData] = useState({
    metodoClasificacion: "",
    criteriosSeleccion: "",
    porcentajeImpurezas: "",
    fechaClasificacion: "",
  });
  const [isClasificacionAdded, setIsClasificacionAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Consultar datos del lote cuando se abre la modal
  useEffect(() => {
    if (isOpenClasificacion && contract && lotId) {
      const fetchLotData = async () => {
        try {
          setIsDataLoaded(false);
          const lotData = await contract.getLotWithAllData(lotId);
          const formattedLotData = {
            metodoClasificacion: lotData.clasificacionGrano.metodoClasificacion || "",
            criteriosSeleccion: lotData.clasificacionGrano.criteriosSeleccion || "",
            porcentajeImpurezas: lotData.clasificacionGrano.porcentajeImpurezas || "",
            fechaClasificacion: lotData.clasificacionGrano.fechaClasificacion || "",
          };
          setClasificacionData(formattedLotData);
          if (
            formattedLotData.metodoClasificacion &&
            formattedLotData.criteriosSeleccion &&
            formattedLotData.porcentajeImpurezas &&
            formattedLotData.fechaClasificacion
          ) {
            setIsClasificacionAdded(true);
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
  }, [isOpenClasificacion, contract, lotId]);

  // Manejar cambios en los inputs
  const handleInputChangeClasificacion = (field, value) => {
    if (!isClasificacionAdded) {
      setClasificacionData({
        ...clasificacionData,
        [field]: value,
      });
    }
  };

  // Función para agregar datos de clasificación del grano
  const addClasificacionData = async () => {
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);
        if (
          !clasificacionData.metodoClasificacion ||
          !clasificacionData.criteriosSeleccion ||
          !clasificacionData.porcentajeImpurezas ||
          !clasificacionData.fechaClasificacion
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }
        await contract.addClasificacionGranoData(
          lotId,
          clasificacionData.metodoClasificacion,
          clasificacionData.criteriosSeleccion,
          clasificacionData.porcentajeImpurezas,
          clasificacionData.fechaClasificacion
        );
        setIsClasificacionAdded(true);
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de clasificación del grano:", error);
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
    setClasificacionData({
      metodoClasificacion: "",
      criteriosSeleccion: "",
      porcentajeImpurezas: "",
      fechaClasificacion: "",
    });
    setIsClasificacionAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpenClasificacion} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Agregar Datos de Clasificación del Grano
            </ModalHeader>
            <ModalBody>
              {!isDataLoaded ? (
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Input
                    label="Método de clasificación:"
                    value={clasificacionData.metodoClasificacion}
                    variant="bordered"
                    isDisabled={isClasificacionAdded}
                    onChange={(e) =>
                      handleInputChangeClasificacion("metodoClasificacion", e.target.value)
                    }
                  />
                  <Input
                    label="Criterios de selección:"
                    value={clasificacionData.criteriosSeleccion}
                    variant="bordered"
                    isDisabled={isClasificacionAdded}
                    onChange={(e) =>
                      handleInputChangeClasificacion("criteriosSeleccion", e.target.value)
                    }
                  />
                  <Input
                    label="Porcentaje de impurezas:"
                    value={clasificacionData.porcentajeImpurezas}
                    variant="bordered"
                    isDisabled={isClasificacionAdded}
                    onChange={(e) =>
                      handleInputChangeClasificacion("porcentajeImpurezas", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    label="Fecha de clasificación:"
                    value={clasificacionData.fechaClasificacion}
                    variant="bordered"
                    isDisabled={isClasificacionAdded}
                    onChange={(e) =>
                      handleInputChangeClasificacion("fechaClasificacion", e.target.value)
                    }
                  />
                  {isClasificacionAdded && (
                    <div className="flex items-center justify-center w-full mt-4">
                      <Alert
                        hideIcon
                        color="success"
                        description="Los datos de clasificación del grano ya han sido registrados."
                        title="Datos de clasificación completos."
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
              {!isClasificacionAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addClasificacionData}
                  >
                    {loading ? "Registrando..." : "Registrar clasificación"}
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

export default ClasificacionGranoModal;