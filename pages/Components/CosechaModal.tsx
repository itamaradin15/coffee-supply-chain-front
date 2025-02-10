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

const CosechaModal = ({
  isOpenCosecha,
  onOpenChange, // Para manejar el cierre de la modal
  contract,
  fetchAllLots,
  lotId, // Recibir el ID del lote como prop
}) => {
  // Estados para manejar los datos del formulario
  const [cosechaData, setCosechaData] = useState({
    nombreCaficultor: "",
    ubicacion: "",
    tamanoFinca: "",
    variedadesCultivadas: "",
    altitudCultivo: "",
    fechaCosecha: "",
    metodoCosecha: "",
    cantidadCosechada: "",
  });

  // Estados para manejar el estado de la modal
  const [isCosechaAdded, setIsCosechaAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState("");

  // Función para manejar cambios en los inputs
  const handleInputChangeCosecha = (field, value) => {
    setCosechaData({
      ...cosechaData,
      [field]: value,
    });
  };

  // Función para agregar datos de cosecha a un lote existente
  const addCosechaData = async () => {
console.log(lotId)
    if (contract && lotId) {
      try {
        setLoading(true);
        setOnErrorStatus(false);

        // Validar campos
        if (
          !cosechaData.nombreCaficultor ||
          !cosechaData.ubicacion ||
          !cosechaData.tamanoFinca ||
          !cosechaData.variedadesCultivadas ||
          !cosechaData.altitudCultivo ||
          !cosechaData.fechaCosecha ||
          !cosechaData.metodoCosecha ||
          !cosechaData.cantidadCosechada
        ) {
          throw new Error("Por favor, complete todos los campos.");
        }

        // Llamar a la función del contrato para agregar datos de cosecha
        await contract.addCosechaData(
          lotId, // Usar el ID del lote recibido como prop
          cosechaData.nombreCaficultor,
          cosechaData.ubicacion,
          cosechaData.tamanoFinca,
          cosechaData.variedadesCultivadas,
          cosechaData.altitudCultivo,
          cosechaData.fechaCosecha,
          cosechaData.metodoCosecha,
          cosechaData.cantidadCosechada
        );

        // Actualizar el estado
        setIsCosechaAdded(true);
        setOnErrorStatus(false);

        // Recargar los lotes
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al agregar datos de cosecha:", error);
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
    setCosechaData({
      nombreCaficultor: "",
      ubicacion: "",
      tamanoFinca: "",
      variedadesCultivadas: "",
      altitudCultivo: "",
      fechaCosecha: "",
      metodoCosecha: "",
      cantidadCosechada: "",
    });
    setIsCosechaAdded(false);
    setLoading(false);
    setOnErrorStatus(false);
    setOnErrorMessage("");

    // Cerrar la modal
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpenCosecha}
      placement="top-center"
      onOpenChange={onOpenChange} // Usar onOpenChange para manejar el cierre
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Agregar Datos de Cosecha
            </ModalHeader>
            <ModalBody>
              {!isCosechaAdded && (
                <>
                  <Input
                    label="Nombre del caficultor:"
                    value={cosechaData.nombreCaficultor}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("nombreCaficultor", e.target.value)
                    }
                  />
                  <Input
                    label="Ubicación:"
                    value={cosechaData.ubicacion}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("ubicacion", e.target.value)
                    }
                  />
                  <Input
                    label="Tamaño de la finca:"
                    value={cosechaData.tamanoFinca}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("tamanoFinca", e.target.value)
                    }
                  />
                  <Input
                    label="Variedades cultivadas:"
                    value={cosechaData.variedadesCultivadas}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("variedadesCultivadas", e.target.value)
                    }
                  />
                  <Input
                    label="Altitud de cultivo:"
                    value={cosechaData.altitudCultivo}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("altitudCultivo", e.target.value)
                    }
                  />
                  <Input
                    label="Fecha de cosecha:"
                    type="date"
                    value={cosechaData.fechaCosecha}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("fechaCosecha", e.target.value)
                    }
                  />
                  <Input
                    label="Método de cosecha:"
                    value={cosechaData.metodoCosecha}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("metodoCosecha", e.target.value)
                    }
                  />
                  <Input
                    label="Cantidad cosechada:"
                    value={cosechaData.cantidadCosechada}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChangeCosecha("cantidadCosechada", e.target.value)
                    }
                  />
                </>
              )}
              {isCosechaAdded && (
                <div className="flex items-center justify-center w-full">
                  <Alert
                    hideIcon
                    color="success"
                    description="Los datos de cosecha han sido agregados exitosamente."
                    title="Datos de cosecha registrados."
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
              {!isCosechaAdded && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    color="success"
                    disabled={loading}
                    variant="flat"
                    onPress={addCosechaData}
                  >
                    {loading ? "Registrando..." : "Registrar cosecha"}
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

export default CosechaModal;