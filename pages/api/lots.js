import { ethers } from "ethers";
import CoffeeSupplyChain from "../../contracts/CoffeeSupplyChain.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

export default async function handler(req, res) {
  // Configurar los encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permite acceso desde cualquier origen
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Encabezados permitidos

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Validar la URL del proveedor RPC
    if (!rpcUrl) {
      return res.status(500).json({ message: "La URL del proveedor RPC no está configurada" });
    }
    if (!/^https?:\/\//.test(rpcUrl)) {
      return res.status(500).json({ message: "La URL del proveedor RPC no tiene un protocolo válido" });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const { lot } = req.query;
    if (!lot) {
      return res.status(400).json({ message: "Debe proporcionar un lote" });
    }

    // Conectar con el contrato
    const contract = new ethers.Contract(
      contractAddress,
      CoffeeSupplyChain.abi,
      provider,
    );

    // Llamar a la función del contrato
    const lotData = await contract.getLotWithAllData(lot);

    // Formatear la respuesta para que sea serializable en JSON
    const formattedLotData = {
      lot: {
        lotNumber: lotData.lot.lotNumber,
        farmerName: lotData.lot.farmerName,
        farmLocation: lotData.lot.farmLocation,
        farmSize: lotData.lot.farmSize,
        quantity: lotData.lot.quantity,
        variety: lotData.lot.variety,
        altitud: lotData.lot.altitud,
        harvestingMethod: lotData.lot.harvestingMethod,
        harvestTimestamp: lotData.lot.harvestTimestamp,
        isActive: lotData.lot.isActive,
      },
      despulpado: {
        metodoDespulpado: lotData.despulpado.metodoDespulpado,
        fechaProceso: lotData.despulpado.fechaProceso,
        cantidadPulpaRetirada: lotData.despulpado.cantidadPulpaRetirada,
        destinoPulpa: lotData.despulpado.destinoPulpa,
      },
      secado: {
        metodoSecado: lotData.secado.metodoSecado,
        humedadFinal: lotData.secado.humedadFinal,
      },
      trillado: {
        fechaTrillado: lotData.trillado.fechaTrillado,
        cantidadTrillada: lotData.trillado.cantidadTrillada,
      },
      impacto: {
        ayudaFamilias: lotData.impacto.ayudaFamilias,
        pagoSobrePromedio: lotData.impacto.pagoSobrePromedio,
        reduccionPesticidas: lotData.impacto.reduccionPesticidas,
        usoComposta: lotData.impacto.usoComposta,
      },
    };

    // Devolver la respuesta en formato JSON
    res.status(200).json({ lotData: formattedLotData });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
}