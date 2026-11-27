import { snacksPrueba } from "../data/snacks-prueba.js";

// Cambia esta URL por tu consulta real de Open Food Facts (sin claves secretas)
const API_URL =
  "https://world.openfoodfacts.org/cgi/search.pl?search_terms=snacks&search_simple=1&action=process&json=1&page_size=24";

/**
 * @typedef {Object} SnackNormalizado
 * @property {string} id
 * @property {string} nombre
 * @property {string} marca
 * @property {string} imagen
 * @property {string[]} ingredientes
 * @property {{ energia: string, grasas: string, azucares: string, sal: string, proteinas: string }} nutrientes
 * @property {string[]} alergenos
 * @property {string} porcion
 * @property {boolean} esEstimado
 */

function limpiarAlergenos(rawAlergenos) {
  if (!rawAlergenos) return [];
  const lista = Array.isArray(rawAlergenos)
    ? rawAlergenos
    : String(rawAlergenos).split(",");

  return lista
    .map((item) => String(item).replace(/^[a-z]{2}:/i, "").replace(/-/g, " ").trim())
    .filter(Boolean);
}

function limpiarIngredientes(rawTexto) {
  if (!rawTexto || typeof rawTexto !== "string") return [];
  return rawTexto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Traduce un producto crudo de la API al modelo interno de EtiquetaClara.
 * @param {Record<string, any>} item
 * @returns {SnackNormalizado}
 */
export function adaptarSnack(item, indice = 0) {
  const nutriments = item?.nutriments ?? {};
  const id = String(item?.code ?? item?.id ?? `snack-${indice + 1}`);
  const nombre = String(item?.product_name_es ?? item?.product_name ?? "").trim() || "Producto sin nombre declarado";
  const marca = String(item?.brands ?? "").split(",")[0].trim() || "Marca no declarada";
  const imagen = String(item?.image_front_url ?? item?.image_url ?? "").trim();

  const energiaValor = nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"];
  const grasasValor = nutriments["fat_100g"] ?? nutriments["fat"];
  const azucaresValor = nutriments["sugars_100g"] ?? nutriments["sugars"];
  const salValor = nutriments["salt_100g"] ?? nutriments["salt"];
  const proteinasValor = nutriments["proteins_100g"] ?? nutriments["proteins"];

  return {
    id,
    nombre,
    marca,
    imagen,
    ingredientes: limpiarIngredientes(item?.ingredients_text_es ?? item?.ingredients_text),
    nutrientes: {
      energia: energiaValor !== undefined && energiaValor !== null ? `${energiaValor} kcal (100 g aprox.)` : "Sin información declarada",
      grasas: grasasValor !== undefined && grasasValor !== null ? `${grasasValor} g (100 g aprox.)` : "Sin información declarada",
      azucares: azucaresValor !== undefined && azucaresValor !== null ? `${azucaresValor} g (100 g aprox.)` : "Sin información declarada",
      sal: salValor !== undefined && salValor !== null ? `${salValor} g (100 g aprox.)` : "Sin información declarada",
      proteinas: proteinasValor !== undefined && proteinasValor !== null ? `${proteinasValor} g (100 g aprox.)` : "Sin información declarada",
    },
    alergenos: limpiarAlergenos(item?.allergens_tags ?? item?.allergens),
    porcion: String(item?.serving_size ?? item?.quantity ?? "").trim() || "Sin información declarada",
    esEstimado: true,
  };
}

/**
 * Obtiene snacks desde la API; si falla o tarda más de 8s, devuelve datos de prueba.
 * @returns {Promise<{ items: SnackNormalizado[], desdeRespaldo: boolean }>}
 */
export async function obtenerSnacks() {
  try {
    const respuesta = await fetch(API_URL, {
      signal: AbortSignal.timeout(8000),
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    const productos = Array.isArray(datos?.products) ? datos.products : null;

    if (!productos || productos.length === 0) {
      throw new Error("Respuesta sin productos válidos");
    }

    const normalizados = productos
      .map((prod, idx) => adaptarSnack(prod, idx))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    return { items: normalizados, desdeRespaldo: false };
  } catch (error) {
    console.warn("[EtiquetaClara] Usando datos de prueba por fallo en API:", error?.message ?? error);
    return { items: snacksPrueba, desdeRespaldo: true };
  }
}