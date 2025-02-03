import React, { useState, useEffect } from "react";
import { ethers } from "ethers"; // Importa ethers
import {Spinner} from "@heroui/spinner";
import {Alert} from "@heroui/alert";
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

import CoffeeSupplyChain from "./CoffeeSupplyChain.json"; 
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

import DefaultLayout from "@/layouts/default";

const columns = [
  { name: "LOTE", uid: "lote", sortable: true },
  { name: "PRODUCTO", uid: "producto", sortable: true },
  { name: "ORIGEN", uid: "origen", sortable: true },
  { name: "CAFICULTOR", uid: "caficultor", sortable: true },
  { name: "VARIEDAD", uid: "variedad" },
  { name: "ALTITUD", uid: "altitud" },
  { name: "ACCIONES", uid: "actions" },
  { name: "FECHA PROC.", uid: "fechaProcesamiento" },
  { name: "FERM. Y SECADO", uid: "fermentacionSecado" },
  { name: "FECHA COSECHA", uid: "fechaCosecha" },
  { name: "CANTIDAD", uid: "cantidad", sortable: true },
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
};


export default function CoffeeLotTable() {
  const [loading, setLoading] = useState(false);
  const [islotCreated, setIslotCreated] = useState(false);
  const [onErrorStatus, setOnErrorStatus] = useState(false);
  const [onErrorMessage, setOnErrorMessage] = useState(null);
  const [account, setAccount] = useState(null); // Estado para la cuenta conectada
  const [isWalletConnected, setIsWalletConnected] = useState(false); // Estado para verificar si la wallet está conectada
  const [allLots, setAllLots] = useState([]); // Estado para almacenar todos los lotes
  const [contract, setContract] = useState(null);
  const [selectedLot, setSelectedLot] = useState({
    lote: '',
    producto: '',
    origen: '',
    caficultor: '',
    variedad: '',
    altitud: '',
    cantidad: ''
  });
  
  const handleInputChange = (field: keyof Lot, value: string) => {
    setSelectedLot(prev => ({
      ...prev,
      [field]: value
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

        console.log("Cuenta conectada:", accounts);
        if (accounts.length > 0) {
          console.log("Cuenta conectada:", accounts);
          // Asegúrate de que `account` sea un string (la dirección de la cartera)
          setAccount(accounts[0].address); // Extrae la dirección del objeto
          setIsWalletConnected(true);
          initializeContract(provider);
        }
      } catch (error) {
        console.error("Error al conectar la wallet:", error);
        alert(
          "Error al conectar la wallet. Verifica la consola para más detalles.",
        );
      }
    } else {
      alert(
        "MetaMask no está instalado. Por favor, instálalo para usar esta aplicación.",
      );
    }
  };

  // Desconecta la wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsWalletConnected(false);
    setContract(null);
  };

  // Función para obtener todos los lotes
  const sampleProcessingData = {
    harvestMethod: "Manual Selectivo",
    harvestedQuantity: "1500 kg",
    processing: {
      pulpingMethod: "Despulpado mecánico",
      fermentationMethod: "Fermentación natural",
      dryingMethod: "Secado al sol en camas africanas",
      millingMethod: "Trilla mecánica"
    },
    quality: {
      sortingMethod: "Selección manual y electrónica",
      selectionCriteria: "Menos de 5 defectos por 300g",
      defectsRemoved: "Granos negros, inmaduros y dañados",
      finalMoisture: "10.5%",
      packagingType: "Sacos de yute"
    }
  };
  
  const sampleSustainabilityData = {
    familiesBenefited: "25 familias",
    biodiversityConservation: "Preservación de especies nativas",
    cultivationTechniques: "Cultivo bajo sombra, orgánico",
    waterManagement: "Sistema de tratamiento de aguas mieles"
  };
  
  const generateLotId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LOT${year}${month}${random}`;
  };
  
  const handleCreateLot = async () => {
    if (contract) {
      try {
    
        setLoading(true); // Mostrar el spinner
        const lotId = generateLotId();
        const mainData = {
          farmerName: selectedLot.caficultor,
          farmLocation: selectedLot.origen,
          lotWeight: selectedLot.cantidad
        };
        console.log("Datos del lote:", mainData); 
        // Estima el gas necesario
        const gasEstimate = await contract.createLot.estimateGas(
          lotId,
          mainData.farmerName,
          mainData.farmLocation,
          mainData.lotWeight,
          sampleProcessingData,
          sampleSustainabilityData
        );
  
        console.log("Gas estimado:", gasEstimate.toString());
  
        // Envía la transacción con un límite de gas mayor
        const tx = await contract.createLot(
          lotId,
          mainData.farmerName,
          mainData.farmLocation,
          mainData.lotWeight,
          sampleProcessingData,
          sampleSustainabilityData,
          { gasLimit: gasEstimate * 2n }
        );
  
        // Espera a que la transacción sea minada
        await tx.wait();
        
        setIslotCreated(true); // Mostrar el spinner
        
        fetchAllLots(contract);
      } catch (error) {
        console.error("Error al crear el lote:", error);
        setOnErrorStatus(true);
        setOnErrorMessage(error.message);
      } finally {
        setLoading(false); // Ocultar el spinner al finalizar
      }
    }
  };

  const fetchAllLots = async (contract) => {
    try {
      const lots = await contract.getAllLotsInfo();
      console.log("Lotes:", lots);
      const mappedlots = lots.map((lot) => {
        //convert to array
        if (Object.values(lot).length > 0) {
          console.log('values,',Object.values(lot))
          return {
            lote: lot[0],
            producto: lot[1],
            origen: lot[2],
            caficultor: lot[3],
            variedad: lot[4],
            altitud: "1,200 - 1,500 msnm",
            fechaProcesamiento: "Febrero 2025",
            fermentacionSecado: "24 horas de fermentación, 15 días de secado",
            fechaCosecha: "16 Enero 2025",
            cantidad: `44 kg`,
          }
        }
      });

      setAllLots(mappedlots);
    } catch (error) {
      console.error("Error al obtener los lotes:", error);

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
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "lote",
    direction: "ascending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filtered = [...allLots];

    if (hasSearchFilter) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value.toString().toLowerCase().includes(filterValue.toLowerCase()),
        ),
      );
    }

    return filtered;
  }, [filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

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
            <Button onPress={onOpen} color="success" variant="flat">Crear Lote</Button>
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
                onSelectionChange={setVisibleColumns}
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

  // const {isOpen, onOpen, onOpenChange} = useDisclosure();

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
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid} allowsSorting={column.sortable}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No se encontraron lotes"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.lote}>
              {(columnKey) => <TableCell>{item[columnKey]}</TableCell>}
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
                    label="Lote"
                    value={selectedLot.lote}
                    onChange={(e) => handleInputChange('lote', e.target.value)}
                    variant="bordered"
                  />
                  <Input
                    label="Producto"
                    value={selectedLot.producto}
                    onChange={(e) => handleInputChange('producto', e.target.value)}
                    variant="bordered"
                  />
                  <Input
                    label="Origen"
                    value={selectedLot.origen}
                    onChange={(e) => handleInputChange('origen', e.target.value)}
                    variant="bordered"
                  />
                  <Input
                    label="Caficultor"
                    value={selectedLot.caficultor}
                    onChange={(e) => handleInputChange('caficultor', e.target.value)}
                    variant="bordered"
                  />
                  <Input
                    label="Variedad"
                    value={selectedLot.variedad}
                    onChange={(e) => handleInputChange('variedad', e.target.value)}
                    variant="bordered"
                  />
                  <Input
                    label="Altitud"
                    value={selectedLot.altitud}
                    onChange={(e) => handleInputChange('altitud', e.target.value)}
                    variant="bordered"
                  />
                  <Input
                    label="Cantidad"
                    value={selectedLot.cantidad}
                    onChange={(e) => handleInputChange('cantidad', e.target.value)}
                    variant="bordered"
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
                  <Button color="success" variant="flat" onPress={handleCreateLot} disabled={loading}>
                    {loading ? "Creando..." : "Crear nuevo lote"}
                  </Button>
                  {loading && <Spinner />}
                </div>
              )}
              
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}

const styles = {
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
