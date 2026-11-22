# PrivacyPack Wiki v4 — grafo interativo estilo Distrolinux

Aplicação **PWA estática**, sem backend obrigatório, inspirada na **estrutura de navegação** de [DistroLinux Wiki](https://distrolinux.com.br/en/wiki/): grafo espacial em tela cheia, nós esféricos, ramificações, barra superior de pesquisa, controles de zoom e painel lateral fixo. O projeto é independente e não reutiliza o código da referência.

## O que já está implementado

- **104 entradas catalogadas**, **30 categorias**, filtros por Android, Linux, Windows, "Só Windows", multiplataforma, Web, Servidor e Live USB.
- Árvore com raiz PrivacyPack → plataforma → categoria → ferramenta, projetada a partir de coordenadas **3D**, com parallax/perspectiva, rotação por Shift + arraste, pan, zoom, movimento de partículas nas conexões, seleção de nós e destaque ativo.
- **Fichas laterais**: finalidade, recursos, riscos/limitações, compatibilidade, links oficiais, favoritos e notas pessoais.
- **Comparador na mesma categoria**: recursos, plataformas, modelo, finalidades, limitações e links.
- **Catálogo completo** pesquisável com filtros, favoritos e seleção direta do app.
- **PWA instalável**, manifesto, service worker, cache offline de arquivos internos e armazenamento local de notas e favoritos. Backup/exportação/importação JSON.
- Desktop (painel lateral) e Android (painel móvel estilo bottom sheet).
- **Ícones**: 27 logotipos vetoriais autênticos de Simple Icons incluídos offline; ícones dos sistemas (Android, Linux, Windows e demais) também estão incluídos. Para os demais projetos, há coleta automática de imagens de apps/repositórios oficiais e favicons de seus sites durante a publicação via GitHub Actions. Se não houver imagem, exibe um pictograma identificador honesto em vez de inventar um logotipo.

### Observações importantes sobre os ícones

O catálogo possui `brandIcon` para as 27 marcas cuja geometria pública foi disponibilizada no pacote. As outras 77 dependem de um arquivo de imagem no `assets/site/` gerado no **build conectado à internet**: o workflow pesquisa preferencialmente ícones reais em F-Droid, Google Play, repositório oficial e site do projeto; se necessário, usa favicon ou avatar do editor. Assim, não há promessa de que todos os 104 desenhos baixados sejam *exatamente* o ícone instalado no Android ou desktop. Você pode auditar o relatório `logo-sources.json` gerado no deploy, e substituir qualquer arquivo por um PNG/SVG oficial local. Um favicon de site pode não coincidir com o ícone de um aplicativo.

Serviços externos de logos podem receber a solicitação do domínio quando a opção "Ícones reais de serviços online" estiver ligada. Desligue-a em Configurações para não realizar essas requisições ao visualizar o catálogo. Marcas e logotipos pertencem aos seus titulares.

## Como executar localmente (MX Linux)

Na pasta com `index.html`:

```bash
python3 -m http.server 8080
```

Abra **http://localhost:8080/**. Não abra `index.html` com `file://`, pois o catálogo é carregado com `fetch`.

## Como publicar no GitHub Pages com ícones locais

**Recomendado:** um repositório GitHub público novo, por exemplo `PrivacyPack`.

1. Extraia o ZIP da V4 em uma pasta. Confirme que `index.html`, `app.js`, `style.css`, `catalog.json`, `.github/workflows/pages.yml` estão na raiz da pasta extraída.
2. Crie um repositório público no GitHub. Para o primeiro envio, usando um terminal Linux instalado com Git:

   ```bash
   cd ~/Downloads/PrivacyPack_Wiki_v4
   git init
   git add .
   git commit -m "PrivacyPack Wiki v4"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/PrivacyPack.git
   git push -u origin main
   ```

   **Atenção:** estes comandos são para um repositório **vazio**. Se você já tem um repositório PrivacyPack, faça backup, use `git clone`, copie os arquivos novos por cima, revise `git status` e depois `git add/commit/push`. Não faça `push --force`.

3. Abra seu repositório → **Settings → Pages → Build and deployment → Source: GitHub Actions**. Não deixe a configuração antiga "Deploy from a branch" se quiser usar a etapa automática de coleta de ícones.
4. Abra **Actions → Build & publish PrivacyPack Wiki** e acompanhe a execução. O workflow tenta baixar os ícones de origem, gera o manifesto offline e publica a aplicação. **Se um site não permitir download de sua marca, o catálogo continua operacional.**
5. A URL será aproximadamente `https://SEU_USUARIO.github.io/PrivacyPack/`.
6. No Android, abra essa URL no Chrome e use o menu **⋮ → Instalar app** ou **Adicionar à tela inicial**.

**Modo simples sem GitHub Actions:** publique todos os arquivos pelo Pages "Deploy from a branch → main → /(root)". O site e seus 27 vetores locais funcionarão; outros logos usarão favicons online quando permitidos. O workflow automático é preferível para ter mais ícones no cache offline.

## Controles

| Ação | Desktop | Android |
|---|---|---|
| Abrir ramo | Clique no círculo da plataforma/categoria | Toque no círculo |
| Abrir ficha | Clique no ícone do app | Toque no ícone do app |
| Mover árvore | Arraste | Arraste com um dedo |
| Girar com profundidade | Shift + arrastar; botão direito + arrastar | — |
| Zoom | Roda do mouse ou botões − / + | Pinça ou botões − / + |
| Centralizar | Center | Center |
| Abrir todos | Expand all | Expand all |
| Recolher | Collapse | Collapse |
| Buscar | Campo superior | Campo superior |
| Comparar | Botão na ficha | Botão na ficha |
| Notas / favoritos | Ficha, armazenamento local | Ficha, armazenamento local |
| Restaurar backup | ⚙ → Importar backup | ⚙ → Importar backup |

## Dados e privacidade

As notas e os favoritos são salvos em `localStorage` no dispositivo atual. Sem contas e sem banco de dados remoto. O arquivo de backup JSON **não é criptografado** e deve ser guardado em um local protegido. Não use notas para senhas ou seeds.

O site funciona offline após a primeira visita e a instalação do service worker. Links externos, novos favicons ainda não armazenados e verificações de atualização precisam de internet.

O mapa é um renderizador Canvas 2D **com projeção matemática tridimensional** (coordenadas X/Y/Z, perspectiva, rotação e profundidade), não um motor WebGL. É propositalmente leve para celulares Android, sem dependências JavaScript externas.

## Personalizar o catálogo

Edite `catalog.json` para acrescentar novas ferramentas. Cada entrada contém `id`, `name`, `cat`, `url`, `platforms`, `kind`, `summary`, `features`, `cautions`, `emoji` e ícones opcionais. As categorias estão em `categories.json`. Depois execute:

```bash
python3 tools/make_manifest.py
```

Ícones locais oficiais ou autorizados podem ser colocados em `assets/site/id-da-ferramenta.png` e associados com `localSiteIcon` no JSON. Para executar a coleta no próprio PC com internet:

```bash
python3 tools/fetch_site_icons.py
python3 tools/resolve_icons.py
python3 tools/make_manifest.py
```

Se você modificar `app.js`, `style.css` ou o catálogo, atualize o identificador `CACHE` de `sw.js` para garantir que clientes recebam a nova versão.

## Compatibilidade / testes realizados

Testes automatizados da interface foram feitos no Chromium headless para resoluções de **1440×900** (desktop) e **390×844** (Android), incluindo carregamento de 104 registros, seleção de plataforma, catálogo completo, abertura de ficha, comparação e painel móvel. Não houve erros de JavaScript nesses fluxos.

**Não testado em dispositivo real:** processo de instalação PWA no Android 13, download de todos os ícones externos, conectividade do GitHub Pages e capacidades do navegador em dispositivos específicos. A coleta das marcas reais depende das políticas de rede de seus sites de origem; algumas poderão continuar sem imagem.

## Licenças e créditos

Estrutura e código desta aplicação: exemplo independente de implementação web. As descrições do catálogo são informativas e não garantem anonimato. O espaço de navegação é inspirado funcionalmente na visualização de árvore do Distrolinux Wiki, sem copiar scripts, layout CSS ou arquivos do projeto. Formas de ícones de marca: Simple Icons; marcas registradas pertencem aos respectivos titulares. Outros favicons e logos são fornecidos pelos projetos de origem, para identificação editorial.
