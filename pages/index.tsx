import React, { useState, useEffect } from "react";
import { ethers } from "ethers"; // Importa ethers
import { Spinner } from "@heroui/spinner";
import { Alert } from "@heroui/alert";
import { CSSProperties } from "react";
import { DatePicker } from "@heroui/date-picker";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import CoffeeSupplyChain from "../contracts/CoffeeSupplyChain.json";

import DefaultLayout from "@/layouts/default";
import DespulpadoModal from "./Components/DespulpadoModal ";
import CosechaModal from "./Components/CosechaModal";
import SecadoModal from "./Components/SecadoModal";
import TrilladoModal from "./Components/TrilladoModal";
import ImpactoModal from "./Components/ImpactoModal";
import FermentacionModal from "./Components/FermentacionModal";
import LavadoModal from "./Components/LavadoModal"
import EmpaqueModal from "./Components/EmpaqueModal"
import ClasificacionModal from "./Components/ClasificacionModal"

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const columns = [
  { name: "LOTE", uid: "lote", sortable: true },
  { name: "NOMBRE PRODUCTO", uid: "producto", sortable: true },
  { name: "CAFICULTOR", uid: "caficultor", sortable: true },
  { name: "ORIGEN", uid: "origen", sortable: true },
  { name: "TAM. GRANJA", uid: "farmSize", sortable: true },
  { name: "CANTIDAD", uid: "cantidad", sortable: true },
  { name: "VARIEDAD", uid: "variedad" },
  { name: "ALTITUD", uid: "altitud" },
  { name: "METODO DE COCECHADO", uid: "harvestingMethod", sortable: true },
  { name: "ACCIONES", uid: "actions" },
  { name: "FECHA COSECHA", uid: "fechaCosecha" },
];

// Show only first 6 columns by default
const INITIAL_VISIBLE_COLUMNS = [
  "lote",
  "producto",
  "origen",
  "caficultor",
  "variedad",
  "altitud",
  "actions",
];

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

type Lot = {
  lote: string;
  producto: string;
  origen: string;
  caficultor: string;
  variedad: string;
  altitud: string;
  cantidad: string;
  farmSize: string;
  method: string;
  fechaCosecha: string;
};

type Despulpado = {
  clasification: string;
  cristerios: string;
  porcentaje: string;
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  );
};

export default function CoffeeLotTable() {
  const [isOpenDespulpado, setIsOpenDespulpado] = useState(false);
  const [isOpenCosecha, setIsOpenCosecha] = useState(false)
  const [isOpenSecado, setIsOpenSecado] = useState(false);
  const [isOpenTrillado, setIsOpenTrillado] = useState(false);
  const [isOpenImpacto, setIsOpenImpacto] = useState(false);
  const [isOpenFermentacion, setIsOpenFermentacion] = useState(false);
  const [isOpenLavado, setIsOpenLavado] = useState(false);
  const [isOpenClasificacion, setIsOpenClasificacion] = useState(false);
  const [isOpenEmpaque, setIsOpenEmpaque] = useState(false);
  const [loading, setLoading] = useState(false);
  const [islotCreated, setIslotCreated] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState<string | null>(null);
  // const [account, setAccount] = useState(null); // Estado para la cuenta conectada
  const [isWalletConnected, setIsWalletConnected] = useState(false); // Estado para verificar si la wallet está conectada
  const [allLots, setAllLots] = useState([]); // Estado para almacenar todos los lotes
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [lotId, setLotId] = useState<string | null>(null)
  const [selectedLot, setSelectedLot] = useState({
    lote: "",
    producto: "",
    origen: "",
    caficultor: "",
    variedad: "",
    altitud: "",
    cantidad: "",
    fechaCosecha: "",
    farmSize: "",
    method: "",
  });

  const [despulpadoLot, setDespulpadoLot] = useState({
    clasification: "",
    cristerios: "",
    porcentaje: "",
  });

  const handleOpenCosechaModal = (lotId) => {
    setLotId(lotId),
    setIsOpenCosecha(true)
  }

    // Función para abrir la modal de secado
    const handleOpenSecadoModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenSecado(true);
    };
  
    // Función para abrir la modal de trillado
    const handleOpenTrilladoModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenTrillado(true);
    };
  
    // Función para abrir la modal de impacto
    const handleOpenImpactoModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenImpacto(true);
    };

    const handleOpenFermentacionModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenFermentacion(true);
    };

    const handleOpenLavadoModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenLavado(true);
    };

    const handleOpenClasificacionModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenClasificacion(true);
    };

    const handleOpenEmpaqueModal = (lotId) => {
      setSelectedLotId(lotId);
      setIsOpenEmpaque(true);
    };



  const handleInputChange = (field: keyof Lot, value: string) => {
    setSelectedLot((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          // Asegúrate de que `account` sea un string (la dirección de la cartera)
          // setAccount(accounts[0]); // Extrae la dirección del objeto
          setIsWalletConnected(true);
          initializeContract(provider);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const initializeContract = async (provider) => {
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      CoffeeSupplyChain.abi,
      signer,
    );

    setContract(contract);
    fetchAllLots(contract);
  };

  // Conecta la wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);

        if (accounts.length > 0) {
          // Asegúrate de que `account` sea un string (la dirección de la cartera)
          //setAccount(accounts[0].address); // Extrae la dirección del objeto
          setIsWalletConnected(true);
          initializeContract(provider);
        }
      } catch (error) {
        alert(
          "Error al conectar la wallet. Verifica la consola para más detalles. " +
            error,
        );
      }
    } else {
      alert(
        "MetaMask no está instalado. Por favor, instálalo para usar esta aplicación.",
      );
    }
  };

  const generateLotId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `LOT${year}${month}${random}`;
  };

  // Función para formatear la fech

  const handleCreateLot = async () => {
    if (contract) {
      try {
        setLoading(true); // Mostrar el spinner
        const lotId = generateLotId();       
        // Estima el gas necesario
        const gasEstimate = await contract.createLot.estimateGas(
          lotId,
          selectedLot.producto,
          selectedLot.caficultor,
          selectedLot.origen,
          selectedLot.farmSize,
          selectedLot.cantidad,
          selectedLot.variedad,
          selectedLot.altitud,
          selectedLot.method,
          selectedLot.fechaCosecha,
        );

        // Envía la transacción con un límite de gas mayor
        const tx = await contract.createLot(
          lotId,
          selectedLot.producto,
          selectedLot.caficultor,
          selectedLot.origen,
          selectedLot.farmSize,
          selectedLot.cantidad,
          selectedLot.variedad,
          selectedLot.altitud,
          selectedLot.method,
          selectedLot.fechaCosecha,
          { gasLimit: gasEstimate * BigInt(1) },
        );
        // Espera a que la transacción sea minada
        await tx.wait();

        setIslotCreated(true); // Mostrar el spinner

        fetchAllLots(contract);
      } catch (error) {
        setOnErrorStatus(true);
        if (error instanceof Error) {
          setOnErrorMessage(error.message);
        } else {
          setOnErrorMessage("An unknown error occurred");
        }
      } finally {
        setLoading(false); // Ocultar el spinner al finalizar
      }
    }
  };

  const fetchAllLots = async (contract) => {
    try {
     // const lots = await contract.getAllLots();
      const [
        allLots, 
        allDespulpadoData, 
        allCosechaData, 
        allSecadoData,
        allTrilladoData,
        allImpactoData
      ] = await contract.getAllLots();
 
      const mappedLots = allLots.map((lot) => {
        return {
          lote: lot.lotNumber,
          producto: lot.producto,
          caficultor: lot.farmerName,
          origen: lot.farmLocation,
          variedad: lot.variety,
          altitud: lot.altitud,
          fechaCosecha: lot.harvestTimestamp,
          harvestingMethod: lot.harvestingMethod,
          farmSize: lot.farmSize,
          cantidad: lot.quantity,
        };
      });
  
      setAllLots(mappedLots); // Actualiza el estado con los lotes mapeados
    } catch (error) {
      setOnErrorStatus(true);
      if (error instanceof Error) {
        setOnErrorMessage(
          "Error al obtener los lotes. Verifica la consola para más detalles. " +
            error.message,
        );
      } else {
        setOnErrorMessage(
          "Error al obtener los lotes. Verifica la consola para más detalles.",
        );
      }
      return null;
    }
  };

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(30);
  const [page, setPage] = React.useState(1);
  //@ts-ignore
  const [sortDescriptor] = React.useState({
    column: "lote",
    direction: "ascending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns instanceof Set && visibleColumns.size === columns.length)
      return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filtered = [...allLots];

    if (hasSearchFilter) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filtered;
  }, [filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  // const items = React.useMemo(() => {
  //   const start = (page - 1) * rowsPerPage;
  //   const end = start + rowsPerPage;

  //   return filteredItems.slice(start, end);
  // }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...allLots].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, allLots]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);


  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const handleSelectLot = (lotId: string) => {
    setSelectedLotId(lotId); // Almacenar el ID del lote seleccionado
    setIsOpenDespulpado(true); // Abrir la modal de despulpado
  };

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <VerticalDotsIcon
                    className="text-default-400"
                    height={30}
                    width={30}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
            
                <DropdownItem key="view" onPress={() => handleSelectLot(user.lote)}>
                  Despulpado
                </DropdownItem>
                <DropdownItem key="modalFermentacion" onPress={() => handleOpenFermentacionModal(user.lote)}>
                  Fermentaciòn
                </DropdownItem>
                <DropdownItem key="modalLavado" onPress={() => handleOpenLavadoModal(user.lote)}>
                  Lavado
                </DropdownItem>
                <DropdownItem key="modalSecado" onPress={() => handleOpenSecadoModal(user.lote)}>
                  Secado
                </DropdownItem>
                <DropdownItem key="modalTrillado" onPress={() => handleOpenTrilladoModal(user.lote)}>
                  Trillado
                </DropdownItem>
                <DropdownItem key="modalClasificacion" onPress={() => handleOpenClasificacionModal(user.lote)}>
                  Clasificaciòn del grano
                </DropdownItem>
                <DropdownItem key="modalEmpaque" onPress={() => handleOpenEmpaqueModal(user.lote)}>
                  Empaque
                </DropdownItem>
                <DropdownItem key="modalImpacto" onPress={() => handleOpenImpactoModal(user.lote)}>
                  Impacto
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button color="success" variant="flat" onPress={onOpen}>
              Registrar Lote
            </Button>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button variant="flat">Columnas</Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Columnas de la tabla"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) =>
                  setVisibleColumns(new Set(keys as unknown as string[]))
                }
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {column.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {allLots.length} lotes
          </span>
          <label className="flex items-center text-default-400 text-small">
            Filas por página:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="150">150</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, onSearchChange]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Anterior
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  }, [page, pages, onPreviousPage, onNextPage]);

  if (!isWalletConnected) {
    return (
      <div style={styles.banner}>
        <h2>Conecta tu wallet para acceder al backoffice</h2>
        <button style={styles.connectButton} onClick={connectWallet}>
          Conectar Wallet
        </button>
      </div>
    );
  }

  return (
    <DefaultLayout>
      <Table
        isHeaderSticky
        aria-label="Tabla de lotes de café"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[482px]",
        }}
        //sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        //onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No se encontraron lotes"} items={sortedItems}>
          {(item: Lot) => (
            <TableRow key={item.lote}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Crear Lote de Café
              </ModalHeader>
              <ModalBody>
                {!islotCreated && (
                  <>
                  <Input
                      label="Nombre del Producto"
                      value={selectedLot.producto}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("producto", e.target.value)
                      }
                    />
                    <Input
                      label="Nombre del caficultor o cooperativa"
                      value={selectedLot.caficultor}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("caficultor", e.target.value)
                      }
                    />
                    <Input
                      label="Ubicación de la finca:"
                      value={selectedLot.origen}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("origen", e.target.value)
                      }
                    />
                    <Input
                      label="Altitud de cultivos"
                      value={selectedLot.altitud}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("altitud", e.target.value)
                      }
                    />
                    <Input
                      label="Variedad cultivada"
                      value={selectedLot.variedad}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("variedad", e.target.value)
                      }
                    />
                  
                    <Input
                    label="Fecha de Cosecha:"
                    type="date"
                    value={selectedLot.fechaCosecha}
                    variant="bordered"
                    onChange={(e) =>
                      handleInputChange("fechaCosecha", e.target.value)
                    }
                  />
                    <Input
                      label="Cantidad cosechada"
                      value={selectedLot.cantidad}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("cantidad", e.target.value)
                      }
                    />
                    <Input
                      label="Tamaño de la finca"
                      value={selectedLot.farmSize}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("farmSize", e.target.value)
                      }
                    />
                    <Input
                      label="Método de cosecha"
                      value={selectedLot.method}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("method", e.target.value)
                      }
                    />
                  </>
                )}

                {islotCreated && (
                  <div className="flex items-center justify-center w-full">
                    <Alert
                      hideIcon
                      color="success"
                      description="El lote ha sido creado exitosamente"
                      title="Lote creado con éxito."
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
                <Button variant="flat" onPress={onClose}>
                  Cerrar
                </Button>

                {!islotCreated && (
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      color="success"
                      disabled={loading}
                      variant="flat"
                      onPress={handleCreateLot}
                    >
                      {loading ? "Creando..." : "Registrar nuevo lote"}
                    </Button>
                    {loading && <Spinner />}
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <CosechaModal
        isOpenCosecha={isOpenCosecha}
        onOpenChange={setIsOpenCosecha}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={lotId}
      />
      <DespulpadoModal
        isOpenDespulpado={isOpenDespulpado}
        onOpenChange={setIsOpenDespulpado}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId} // Pasar el ID del lote seleccionado
      />
      <SecadoModal
        isOpenSecado={isOpenSecado}
        onOpenChange={setIsOpenSecado}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
      <TrilladoModal
        isOpenTrillado={isOpenTrillado}
        onOpenChange={setIsOpenTrillado}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
      <ImpactoModal
        isOpenImpacto={isOpenImpacto}
        onOpenChange={setIsOpenImpacto}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
      <FermentacionModal
        isOpenFermentacion={isOpenFermentacion}
        onOpenChange={setIsOpenFermentacion}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
      <LavadoModal
        isOpenLavado={isOpenLavado}
        onOpenChange={setIsOpenLavado}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
      <ClasificacionModal
        isOpenClasificacion={isOpenClasificacion}
        onOpenChange={setIsOpenClasificacion}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
      <EmpaqueModal
        isOpenEmpaque={isOpenEmpaque}
        onOpenChange={setIsOpenEmpaque}
        contract={contract}
        fetchAllLots={fetchAllLots}
        lotId={selectedLotId}
      />
    </DefaultLayout>
  );
}

const styles: { [key: string]: CSSProperties } = {
  banner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
    color: "#333",
    textAlign: "center",
  },
  connectButton: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
  },
};
