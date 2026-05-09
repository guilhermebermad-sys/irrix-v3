import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NeuCard, NeuButton, NeuInput, NeuLabel, NeuSelect, NeuTextarea } from "@/components/ui/neu";
import { useSelecao } from "@/contexts/SelecaoContext";
import { SOIL_TYPES, SOIL_DATA, FONTES_AGUA, ESTADOS_BR, CULTURAS, ESTADIOS, SISTEMAS_IRRIGACAO, getKc, getF, getAFD } from "@/lib/agro/reference";
import { Settings, Upload, KeyRound, Sprout, Plus, Droplets, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { WeatherProviderSettings } from "@/components/settings/WeatherProviderSettings";

export default function Configuracoes() {
  const { user } = useAuth();
  const { fazendas, refresh } = useSelecao();
  const { theme, setTheme } = useTheme();
  const [perfil, setPerfil] = useState<any>({});
  const [novaSenha, setNovaSenha] = useState("");
  const [novaFazenda, setNovaFazenda] = useState<any>({});
  const [salvandoFz, setSalvandoFz] = useState(false);
  const [novoTalhao, setNovoTalhao] = useState<any>({});
  const [salvandoTl, setSalvandoTl] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("usuarios_perfil").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setPerfil(data || { user_id: user.id, email: user.email }));
  }, [user]);

  const cadastrarFazenda = async () => {
    if (!user) return;
    if (!novaFazenda.nome?.trim()) { toast.error("Informe o nome da fazenda"); return; }
    setSalvandoFz(true);
    const { error } = await supabase.from("fazendas").insert({ ...novaFazenda, user_id: user.id });
    setSalvandoFz(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Fazenda cadastrada!");
    setNovaFazenda({});
    refresh();
  };

  const cadastrarTalhao = async () => {
    if (!user) return;
    if (!novoTalhao.fazenda_id) { toast.error("Selecione uma fazenda"); return; }
    if (!novoTalhao.nome?.trim()) { toast.error("Informe o nome do talhão"); return; }
    setSalvandoTl(true);
    const { error } = await supabase.from("talhoes").insert({ ...novoTalhao, user_id: user.id });
    setSalvandoTl(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Talhão cadastrado!");
    setNovoTalhao({});
    refresh();
  };

  const salvar = async () => {
    if (!user) return;
    const payload = { ...perfil, user_id: user.id, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("usuarios_perfil").upsert(payload, { onConflict: "user_id" });
    if (error) toast.error(error.message); else toast.success("Perfil atualizado!");
  };

  const alterarSenha = async () => {
    if (novaSenha.length < 6) { toast.error("Mínimo 6 caracteres"); return; }
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) toast.error(error.message); else { toast.success("Senha alterada!"); setNovaSenha(""); }
  };

  const upLogo = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/logo_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    setPerfil({ ...perfil, logo_url: data.publicUrl });
    toast.success("Logo enviado!");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Settings className="text-primary" /> Configurações</h1>

      <NeuCard>
        <h2 className="font-semibold mb-1 flex items-center gap-2"><Moon className="w-4 h-4 text-primary" /> Aparência</h2>
        <p className="text-xs text-muted-foreground mb-4">Escolha como o IrriX será exibido. O modo Sistema segue a preferência do seu dispositivo.</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { v: "light", label: "Claro", Icon: Sun },
            { v: "dark", label: "Escuro", Icon: Moon },
            { v: "system", label: "Sistema", Icon: Monitor },
          ] as const).map(({ v, label, Icon }) => (
            <button
              key={v}
              onClick={() => setTheme(v)}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold transition-all ${
                theme === v ? "neu-pressed text-primary" : "neu-button text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </NeuCard>

      <NeuCard>
        <h2 className="font-semibold mb-4">Dados pessoais</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><NeuLabel>Nome</NeuLabel><NeuInput value={perfil.nome ?? ""} onChange={e => setPerfil({ ...perfil, nome: e.target.value })} /></div>
          <div><NeuLabel>Email</NeuLabel><NeuInput value={perfil.email ?? user?.email ?? ""} disabled /></div>
          <div><NeuLabel>Telefone</NeuLabel><NeuInput value={perfil.telefone ?? ""} onChange={e => setPerfil({ ...perfil, telefone: e.target.value })} /></div>
          <div><NeuLabel>CREA / CFT</NeuLabel><NeuInput value={perfil.crea ?? ""} onChange={e => setPerfil({ ...perfil, crea: e.target.value })} /></div>
          <div className="sm:col-span-2"><NeuLabel>Empresa</NeuLabel><NeuInput value={perfil.empresa ?? ""} onChange={e => setPerfil({ ...perfil, empresa: e.target.value })} /></div>
        </div>
      </NeuCard>

      <NeuCard>
        <h2 className="font-semibold mb-4">Logotipo da empresa</h2>
        <div className="flex items-center gap-4">
          {perfil.logo_url && <img src={perfil.logo_url} alt="Logo" className="w-20 h-20 object-contain neu-inset p-2 rounded-xl" />}
          <label className="neu-button px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Enviar logo
            <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upLogo(e.target.files[0])} />
          </label>
        </div>
      </NeuCard>

      <NeuCard>
        <h2 className="font-semibold mb-4">Preferências de unidades</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><NeuLabel>Lâmina</NeuLabel><NeuInput value={perfil.unidade_lamina ?? "mm"} onChange={e => setPerfil({ ...perfil, unidade_lamina: e.target.value })} /></div>
          <div><NeuLabel>Volume</NeuLabel><NeuInput value={perfil.unidade_volume ?? "m³"} onChange={e => setPerfil({ ...perfil, unidade_volume: e.target.value })} /></div>
          <div><NeuLabel>Área</NeuLabel><NeuInput value={perfil.unidade_area ?? "ha"} onChange={e => setPerfil({ ...perfil, unidade_area: e.target.value })} /></div>
        </div>
      </NeuCard>

      <div className="flex justify-end">
        <NeuButton variant="primary" onClick={salvar}>Salvar perfil</NeuButton>
      </div>

      <NeuCard>
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Sprout className="w-4 h-4 text-primary" /> Cadastrar nova fazenda</h2>
        <p className="text-xs text-muted-foreground mb-4">Cadastro rápido — gerencie talhões e detalhes em "Minhas Fazendas".</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><NeuLabel>Nome</NeuLabel>
            <NeuInput value={novaFazenda.nome ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, nome: e.target.value })} placeholder="Ex.: Fazenda Santa Maria" />
          </div>
          <div><NeuLabel>Município</NeuLabel>
            <NeuInput value={novaFazenda.municipio ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, municipio: e.target.value })} />
          </div>
          <div><NeuLabel>Estado</NeuLabel>
            <NeuSelect value={novaFazenda.estado ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, estado: e.target.value })}>
              <option value="">—</option>{ESTADOS_BR.map(e => <option key={e}>{e}</option>)}
            </NeuSelect>
          </div>
          <div><NeuLabel>Área Total (ha)</NeuLabel>
            <NeuInput type="number" step="0.01" value={novaFazenda.area_total ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, area_total: parseFloat(e.target.value) || null })} />
          </div>
          <div><NeuLabel>Tipo de Solo</NeuLabel>
            <NeuSelect value={novaFazenda.tipo_solo ?? ""} onChange={e => {
              const v = e.target.value;
              const cad = v && SOIL_DATA[v as keyof typeof SOIL_DATA] ? SOIL_DATA[v as keyof typeof SOIL_DATA].cad : novaFazenda.cad;
              setNovaFazenda({ ...novaFazenda, tipo_solo: v, cad });
            }}>
              <option value="">—</option>{SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
            </NeuSelect>
          </div>
          <div><NeuLabel>CAD (mm)</NeuLabel>
            <NeuInput type="number" step="0.1" value={novaFazenda.cad ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, cad: parseFloat(e.target.value) || null })} />
          </div>
          <div><NeuLabel>Fonte de Água</NeuLabel>
            <NeuSelect value={novaFazenda.fonte_agua ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, fonte_agua: e.target.value })}>
              <option value="">—</option>{FONTES_AGUA.map(s => <option key={s}>{s}</option>)}
            </NeuSelect>
          </div>
          <div className="sm:col-span-2"><NeuLabel>Observações</NeuLabel>
            <NeuTextarea rows={2} value={novaFazenda.observacoes ?? ""} onChange={e => setNovaFazenda({ ...novaFazenda, observacoes: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <NeuButton variant="primary" onClick={cadastrarFazenda} disabled={salvandoFz}>
            <Plus className="w-4 h-4" /> {salvandoFz ? "Cadastrando..." : "Cadastrar fazenda"}
          </NeuButton>
        </div>
      </NeuCard>

      <NeuCard>
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Droplets className="w-4 h-4 text-secondary" /> Cadastrar novo talhão</h2>
        {fazendas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cadastre uma fazenda primeiro para adicionar talhões.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><NeuLabel>Fazenda</NeuLabel>
                <NeuSelect value={novoTalhao.fazenda_id ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, fazenda_id: e.target.value })}>
                  <option value="">— Selecione —</option>
                  {fazendas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </NeuSelect>
              </div>
              <div className="sm:col-span-2"><NeuLabel>Nome / Identificação</NeuLabel>
                <NeuInput value={novoTalhao.nome ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, nome: e.target.value })} placeholder="Ex.: Talhão 1 - Norte" />
              </div>
              <div><NeuLabel>Área (ha)</NeuLabel>
                <NeuInput type="number" step="0.01" value={novoTalhao.area ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, area: parseFloat(e.target.value) || null })} />
              </div>
              <div><NeuLabel>Cultura</NeuLabel>
                <NeuSelect value={novoTalhao.cultura ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, cultura: e.target.value, estadio_fenologico: null, kc_atual: null })}>
                  <option value="">—</option>{CULTURAS.map(c => <option key={c}>{c}</option>)}
                </NeuSelect>
              </div>
              <div><NeuLabel>Estádio fenológico</NeuLabel>
                <NeuSelect value={novoTalhao.estadio_fenologico ?? ""} onChange={e => {
                  const v = e.target.value;
                  setNovoTalhao({ ...novoTalhao, estadio_fenologico: v, kc_atual: novoTalhao.cultura && v ? getKc(novoTalhao.cultura, v) : null });
                }}>
                  <option value="">—</option>
                  {(novoTalhao.cultura ? ESTADIOS[novoTalhao.cultura] || [] : []).map(s => <option key={s}>{s}</option>)}
                </NeuSelect>
              </div>
              <div><NeuLabel>Kc atual</NeuLabel>
                <NeuInput type="number" step="0.01" value={novoTalhao.kc_atual ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, kc_atual: parseFloat(e.target.value) || null })} />
              </div>
              <div><NeuLabel>Data de plantio</NeuLabel>
                <NeuInput type="date" value={novoTalhao.data_plantio ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, data_plantio: e.target.value })} />
              </div>
              <div><NeuLabel>Data prevista de colheita</NeuLabel>
                <NeuInput type="date" value={novoTalhao.data_colheita ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, data_colheita: e.target.value })} />
              </div>
              <div className="sm:col-span-2"><NeuLabel>Sistema de irrigação</NeuLabel>
                <NeuSelect value={novoTalhao.tipo_sistema ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, tipo_sistema: e.target.value })}>
                  <option value="">—</option>{SISTEMAS_IRRIGACAO.map(s => <option key={s}>{s}</option>)}
                </NeuSelect>
              </div>
              <div><NeuLabel>Espaç. emissores (m)</NeuLabel>
                <NeuInput type="number" step="0.01" value={novoTalhao.espac_emissores ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, espac_emissores: parseFloat(e.target.value) || null })} />
              </div>
              <div><NeuLabel>Espaç. linhas (m)</NeuLabel>
                <NeuInput type="number" step="0.01" value={novoTalhao.espac_linhas ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, espac_linhas: parseFloat(e.target.value) || null })} />
              </div>
              <div><NeuLabel>Vazão emissor (L/h)</NeuLabel>
                <NeuInput type="number" step="0.01" value={novoTalhao.vazao ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, vazao: parseFloat(e.target.value) || null })} />
              </div>
              <div><NeuLabel>Pressão (mca)</NeuLabel>
                <NeuInput type="number" step="0.1" value={novoTalhao.pressao ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, pressao: parseFloat(e.target.value) || null })} />
              </div>
              <div><NeuLabel>Eficiência (%)</NeuLabel>
                <NeuInput type="number" step="0.1" value={novoTalhao.eficiencia ?? ""} onChange={e => setNovoTalhao({ ...novoTalhao, eficiencia: parseFloat(e.target.value) || null })} />
              </div>
              {(() => {
                const fzSel = fazendas.find(f => f.id === novoTalhao.fazenda_id);
                const f = getF(novoTalhao.cultura);
                const afd = getAFD(fzSel?.cad, novoTalhao.cultura);
                return (
                  <>
                    <div><NeuLabel>Fração de depleção (f)</NeuLabel>
                      <NeuInput value={f.toFixed(2)} disabled />
                      <p className="text-[11px] text-muted-foreground mt-1">Definido automaticamente pela cultura.</p>
                    </div>
                    <div><NeuLabel>AFD — Água facilmente disponível (mm)</NeuLabel>
                      <NeuInput value={afd || ""} disabled />
                      <p className="text-[11px] text-muted-foreground mt-1">AFD = CAD × f {fzSel?.cad ? `= ${fzSel.cad} × ${f.toFixed(2)}` : "(selecione fazenda)"}</p>
                    </div>
                    <div><NeuLabel>Arm. inicial (mm) — máx. {afd || "—"}</NeuLabel>
                      <NeuInput type="number" step="0.1" max={afd || undefined} value={novoTalhao.arm_inicial ?? ""} onChange={e => {
                        let v: number | null = parseFloat(e.target.value);
                        if (isNaN(v)) v = null;
                        if (v !== null && afd > 0 && v > afd) { toast.warning(`Arm. inicial limitado ao AFD (${afd} mm)`); v = afd; }
                        setNovoTalhao({ ...novoTalhao, arm_inicial: v });
                      }} />
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex justify-end mt-4">
              <NeuButton variant="primary" onClick={cadastrarTalhao} disabled={salvandoTl}>
                <Plus className="w-4 h-4" /> {salvandoTl ? "Cadastrando..." : "Cadastrar talhão"}
              </NeuButton>
            </div>
          </>
        )}
      </NeuCard>

      <WeatherProviderSettings />

      <NeuCard>
        <h2 className="font-semibold mb-4 flex items-center gap-2"><KeyRound className="w-4 h-4" /> Alterar senha</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1"><NeuLabel>Nova senha</NeuLabel><NeuInput type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} /></div>
          <NeuButton onClick={alterarSenha}>Alterar</NeuButton>
        </div>
      </NeuCard>
    </div>
  );
}
