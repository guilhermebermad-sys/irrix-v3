import soja from "@/assets/crops/soja.png";
import milho from "@/assets/crops/milho.png";
import feijao from "@/assets/crops/feijao.png";
import cafe from "@/assets/crops/cafe.png";
import cana from "@/assets/crops/cana.png";
import tomate from "@/assets/crops/tomate.png";
import alface from "@/assets/crops/alface.png";
import morango from "@/assets/crops/morango.png";
import citros from "@/assets/crops/citros.png";
import banana from "@/assets/crops/banana.png";
import uva from "@/assets/crops/uva.png";
import manga from "@/assets/crops/manga.png";
import melao from "@/assets/crops/melao.png";
import melancia from "@/assets/crops/melancia.png";
import batata from "@/assets/crops/batata.png";
import cebola from "@/assets/crops/cebola.png";
import alho from "@/assets/crops/alho.png";
import generico from "@/assets/crops/generico.png";

const MAP: Record<string, string> = {
  "soja": soja,
  "milho": milho,
  "feijao": feijao, "feijão": feijao,
  "cafe": cafe, "café": cafe,
  "cana": cana, "cana-de-acucar": cana, "cana-de-açúcar": cana,
  "tomate": tomate,
  "tomate (mesa)": tomate,
  "tomate (industria)": tomate, "tomate (indústria)": tomate,
  "alface": alface,
  "folhosas (alface/rucula/agriao)": alface, "folhosas (alface/rúcula/agrião)": alface,
  "morango": morango,
  "citros": citros, "citrus": citros, "laranja": citros,
  "laranja (citros)": citros,
  "banana": banana,
  "uva": uva, "uva (mesa)": uva, "uva (vinho)": uva,
  "manga": manga,
  "melao": melao, "melão": melao,
  "melancia": melancia,
  "batata": batata,
  "cebola": cebola,
  "alho": alho,
};

function norm(s?: string | null): string {
  return (s ?? "").toString().trim().toLowerCase();
}

export function getCropImage(cultura?: string | null): string {
  return MAP[norm(cultura)] ?? generico;
}

export const CROP_FALLBACK = generico;
