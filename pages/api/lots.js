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
        nameProduct: lotData.lot.producto,
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
      cosecha: {
        nombreCaficultor: lotData.cosecha.nombreCaficultor,
        ubicacion: lotData.cosecha.ubicacion,
        tamanoFinca: lotData.cosecha.tamanoFinca,
        variedadesCultivadas: lotData.cosecha.variedadesCultivadas,
        altitudCultivo: lotData.cosecha.altitudCultivo,
        fechaCosecha: lotData.cosecha.fechaCosecha,
        metodoCosecha: lotData.cosecha.metodoCosecha,
        cantidadCosechada: lotData.cosecha.cantidadCosechada,
      },
      fermentacion: {
        duracionFermentacion: lotData.fermentacion.duracionFermentacion,
        temperaturaPromedio: lotData.fermentacion.temperaturaPromedio,
        metodoFermentacion: lotData.fermentacion.metodoFermentacion,
        fechaFermentacion: lotData.fermentacion.fechaFermentacion,
      },
      lavado: {
        volumenAguaUtilizada: lotData.lavado.volumenAguaUtilizada,
        metodoReciclajeAgua: lotData.lavado.metodoReciclajeAgua,
        cantidadAguaReutilizada: lotData.lavado.cantidadAguaReutilizada,
        fechaLavado: lotData.lavado.fechaLavado,
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
        fechaSecado: lotData.secado.fechaSecado,
      },
      clasificacionGrano: {
        metodoClasificacion: lotData.clasificacionGrano.metodoClasificacion,
        criteriosSeleccion: lotData.clasificacionGrano.criteriosSeleccion,
        porcentajeImpurezas: lotData.clasificacionGrano.porcentajeImpurezas,
        fechaClasificacion: lotData.clasificacionGrano.fechaClasificacion,
      },
      trillado: {
        fechaTrillado: lotData.trillado.fechaTrillado,
        cantidadTrillada: lotData.trillado.cantidadTrillada,
      },
      empaque: {
        tipoEmpaque: lotData.empaque.tipoEmpaque,
        pesoLote: lotData.empaque.pesoLote,
        fechaEmpaque: lotData.empaque.fechaEmpaque,
      },
      impacto: {
        ayudaFamilias: lotData.impacto.ayudaFamilias,
        pagoSobrePromedio: lotData.impacto.pagoSobrePromedio,
        reduccionPesticidas: lotData.impacto.reduccionPesticidas,
        usoComposta: lotData.impacto.usoComposta,
        fechaImpacto: lotData.impacto.fechaImpacto,
      },
    };

    // Devolver la respuesta en formato JSON
    res.status(200).json({ lotData: formattedLotData });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
}