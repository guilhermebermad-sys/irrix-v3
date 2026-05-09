import soja from "@/assets/crops/soja.png";
import milho from "@/assets/crops/milho.png";
import feijao from "@/assets/crops/feijao.png";
import cafe from "@/assets/crops/cafe.png";
import cana from "@/assets/crops/cana.png";
import tomate from "@/assets/crops/tomate.png";
import alface from "@/assets/crops/alface.png";
import morango from "@/assets/crops/morango.png";
import citros from "@/assets/crops/citros.png";
import generico from "@/assets/crops/generico.png";

const MAP: Record<string, string> = {
  "soja": soja,
  "milho": milho,
  "feijao": feijao, "feijão": feijao,
  "cafe": cafe, "café": cafe,
  "cana": cana, "cana-de-acucar": cana, "cana-de-açúcar": cana,
  "tomate": tomate,
  "alface": alface,
  "morango": morango,
  "citros": citros, "citrus": citros, "laranja": citros,
};

function norm(s?: string | null): string {
  return (s ?? "").toString().trim().toLowerCase();
}

export function getCropImage(cultura?: string | null): string {
  return MAP[norm(cultura)] ?? generico;
}

export const CROP_FALLBACK = generico;
