import { ethers } from "ethers";

import CoffeeSupplyChain from "../../contracts/CoffeeSupplyChain.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
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
    const lotData = await contract.getMainLotData(lot)

    res.status(200).json({ lotData });
  } catch (error) {
    res
      .status(200)
      .json({ message: "Error en el servidor", error: error });
  }
}
