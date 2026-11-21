# PrivacyPack PWA

Catálogo de ferramentas de privacidade, segurança e forense com grafo espacial animado, pesquisa, categorias, favoritos, notas locais, backup JSON e cache offline.

## Executar

Na pasta dos arquivos:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Para instalar como PWA em outro aparelho, publique em uma origem HTTPS (GitHub Pages, Cloudflare Pages etc.). `file://` não ativa service worker.

No Android, abra o endereço HTTPS no Chrome e use **Instalar aplicativo** ou **Adicionar à tela inicial**. Em navegadores compatíveis, a opção de instalação aparece no cabeçalho.

## Recursos

- Grafo com projeção 3D, arrastar para girar, roda/pinça para zoom, partículas e seleção de categoria.
- Catálogo e interface disponíveis offline após a primeira visita online. Links externos exigem rede.
- Favoritos e notas persistidos em `localStorage` do navegador, sem sincronização em nuvem.
- Exportação e importação manual de backup JSON.
- Ícones carregados por favicon de terceiros quando houver rede; emoji funciona offline.

## Limitações

O grafo usa projeção 3D em Canvas 2D, não WebGL; o zoom por pinça depende do navegador. O catálogo contém descrições genéricas e os serviços não foram auditados individualmente. URLs e disponibilidade podem mudar. O app não oferece atualização remota automática do inventário; para atualizar, edite `catalog.json`, altere a versão do cache em `sw.js` e publique novamente.
