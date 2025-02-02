export const coffeeLots = Array.from({ length: 300 }, (_, index) => ({
    lote: `Lote #00${index + 1}`,
    producto: "Café Gourmet Lumora",
    origen: "San Roque, San Martin, Perú",
    caficultor: "Pedro Perez",
    variedad: "Typica, Bourbon, Caturra",
    altitud: "1,200 - 1,500 msnm",
    fechaProcesamiento: "Febrero 2025",
    fermentacionSecado: "24 horas de fermentación, 15 días de secado",
    fechaCosecha: "16 Enero 2025",
    cantidad: `${500 + index * 50} kg`,
  }));
  
  export const columns = [
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
  
  export const INITIAL_VISIBLE_COLUMNS = [
    "lote",
    "producto",
    "origen",
    "caficultor",
    "variedad",
    "altitud",
    "actions",
  ];