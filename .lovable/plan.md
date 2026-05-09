Plano para corrigir definitivamente o erro de tela apagada:

1. Remover a dependência do shim atual
- O erro persiste porque o bundle publicado ainda pode executar código antigo via Service Worker/cache antes do shim novo ser aplicado.
- A correção não deve depender de ordem de importação no `main.tsx`.

2. Blindar o cliente de backend na origem do problema
- Ajustar a criação do client para resolver a URL e a chave pública com fallback direto para os valores públicos do projeto quando as variáveis de ambiente não vierem injetadas no bundle.
- Assim, qualquer importação de `supabase` passa a funcionar mesmo no preview compartilhado/publicado.

3. Corrigir cache do PWA/Service Worker
- Alterar o registro do Service Worker para atualizar imediatamente e recarregar a página uma vez quando houver versão nova.
- Adicionar limpeza de Service Workers/caches antigos problemáticos, para evitar que o navegador continue servindo o bundle quebrado.

4. Validar o resultado
- Conferir que a tela não quebra mais quando as variáveis `VITE_SUPABASE_*` faltam.
- Depois da implementação, você deve republicar e testar em aba anônima; se ainda aparecer cache antigo, o novo código fará a atualização automática na próxima abertura.