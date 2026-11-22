# PrivacyPack Wiki V5 — grafo de ferramentas + central de instalação

PWA estática e independente, inspirada **na interação de árvore** da [DistroLinux Wiki](https://distrolinux.com.br/en/wiki/). O projeto não reutiliza códigos ou estilos de terceiros. Interface em português do Brasil com grafo espacial (Canvas 2D com projeção 3D), ramificações por sistema e categoria, fichas detalhadas, comparação, pesquisa, favoritos e notas.

## Novidades V5

- **Central de instalação** acessível em cada ficha com o botão **↓ Instruções de instalação**.
- Uma **grade de sistemas compatíveis** para o aplicativo escolhido, sempre com ícone do sistema: Android, Linux, Windows, macOS, Web, Servidor, Live USB ou Hardware, conforme o catálogo. Sistemas incompatíveis não são oferecidos na ficha.
- Depois de escolher o sistema, escolha **versão, distro ou método** (Android 13+, 11/12, legado quando aplicável; Linux Debian/Ubuntu/MX, Fedora, Arch, Flatpak ou Docker quando existir; Windows 10/11, macOS Intel/Apple Silicon, etc.).
- **218 guias por plataforma** distribuídos entre **104 ferramentas**. Quando há instruções específicas documentadas, exibe **17 blocos de comandos** verificáveis e copiáveis. Para as demais combinações, informa o caminho pelo site oficial, o tipo de pacote e as verificações necessárias **sem inventar comandos de instalação**.
- Avisos específicos de compatibilidade, rede, chaves e dados; links para downloads/documentação oficiais; disponibilidade das instruções offline.
- **Ajustes visuais:** grafo reorganizado em árvore hierárquica na seleção de sistema, afastamento entre círculos no espaço projetado, controle de colisões entre rótulos e círculos, limite de texto, filtros horizontais com barra de rolagem, ficha e instalador responsivos, métodos que se reorganizam em telas pequenas.
- Pesquisa agora prefere correspondências exatas com o nome do aplicativo, em vez de escolher outra ferramenta que apenas menciona o nome na descrição.

## Como usar

1. Na tela inicial, selecione **Android**, **Linux**, **Windows**, **Multiplataforma** ou outro agrupamento.
2. Selecione uma categoria e depois uma ferramenta para abrir sua ficha lateral (em smartphones, ela aparece como um painel inferior).
3. Pressione **↓ Instruções de instalação**.
4. Selecione **a plataforma compatível** na grade e depois a **versão/distribuição/método**.
5. Leia os passos e avisos. Onde existir um bloco de comandos documentados, use **Copiar comandos**. Revise a procedência e a compatibilidade antes da execução.
6. Use o link oficial para obter instaladores e documentação atualizada. Os guias e o catálogo permanecem disponíveis offline após o primeiro carregamento do PWA, mas os sites externos não.

**Observação:** o catálogo contém plataformas de utilização, e algumas ferramentas são serviços web ou dispositivos físicos, não aplicativos nativos. Para esses casos, o guia explica como acessar ou configurar o serviço em vez de fornecer um comando inexistente. Como distribuições e versões mudam, cada guia indica se é um método específico documentado ou uma orientação geral que exige conferência no site.

## Instalação e execução do próprio PrivacyPack

No **MX Linux** (ou outro sistema com Python 3), extraia o ZIP e abra um terminal na pasta que contém `index.html`:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080` em um navegador moderno. Não abra `index.html` diretamente pelo gerenciador de arquivos (`file://`) porque a aplicação carrega seus dados via `fetch`.

### Publicar no GitHub Pages e instalar no Android

Se está **atualizando seu repositório PrivacyPack**, faça backup, copie os arquivos desta V5 para a raiz do repositório, incluindo **`.github/`**, e faça um commit normal. Não utilize `git push --force`.

1. Confirme na raiz: `index.html`, `app.js`, `style.css`, `catalog.json`, `categories.json`, `install-guides.json`, `sw.js`, `manifest.webmanifest`, `assets/`, `.github/workflows/pages.yml`.
2. No GitHub, abra **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Aguarde o workflow de publicação **Build & publish PrivacyPack Wiki** terminar.
4. Abra `https://SEU_USUARIO.github.io/PrivacyPack/` no Chrome Android.
5. Toque em ⋮ → **Instalar aplicativo** (ou Adicionar à tela inicial, conforme a versão do navegador).
6. Abra a ficha de um aplicativo e verifique **Instruções de instalação**, inclusive após desconectar a internet. Se ainda aparecer a interface antiga, feche as abas do site, atualize a página e limpe o cache específico desse domínio se necessário.

Para todos os detalhes, veja [INSTALL_ANDROID.md](INSTALL_ANDROID.md).

## Controle visual e navegação

- Clique no círculo do sistema → categoria → aplicativo.
- Arraste para mover o grafo; `Shift` + arraste ou botão direito + arraste para orbitar; roda/pinça para aproximar.
- `Center`, `Expand all`, `Collapse` no rodapé do mapa.
- Os nós se afastam em caso de colisão de círculos. Rótulos podem ser deslocados ou ocultados quando não há espaço — o tooltip e a ficha continuam acessíveis.
- Os filtros têm rolagem horizontal. Em smartphones, deslize a fileira de sistemas para ver opções à direita.

## Recursos e privacidade

- Catálogo estático com 104 entradas, 30 categorias, 218 guias por plataforma, pesquisa e filtros.
- PWA instalável com `service worker` V5. `install-guides.json` participa do cache essencial.
- Favoritos e notas ficam no `localStorage`; continuam compatíveis com a chave usada na V4. Exportação/importação em JSON nas Configurações. **Nunca salve senhas, seeds ou chaves privadas nas notas.**
- Logos: preservados os ícones originais locais da V4 onde estavam disponíveis. A coleta de logos na publicação tenta utilizar fontes públicas/oficiais. Favicons podem diferir do ícone real do aplicativo e dependem da disponibilidade da origem. O identificador substituto não se apresenta como logo oficial.
- Sem backend, anúncios, login obrigatório ou execução remota de comandos pelo PWA. Os comandos são **texto para copiar**, não são executados pelo navegador.

## Estrutura dos dados e manutenção

- `catalog.json`: nome, descrição, riscos, link e plataformas das 104 ferramentas.
- `install-guides.json`: guia por ferramenta e sistema, com método, passos, variantes, avisos e links.
- `tools/build_install_guides.py`: gera novamente o `install-guides.json`, preservando comandos e fontes documentados, usando o catálogo.
- `categories.json`: 30 categorias.
- `tools/make_manifest.py`: atualiza o inventário de imagens offline.
- `sw.js`: aumente a versão do cache ao publicar novas alterações para reduzir problemas com atualizações antigas.

**Para acrescentar um app:** edite `catalog.json`, acrescente seu guia específico em `tools/build_install_guides.py`, execute `python3 tools/build_install_guides.py` e `python3 tools/make_manifest.py`, revise os dados e o resultado.

## Auditoria visual e testes

Áreas analisadas: fileiras de chips no topo, colisão entre nós, colisão entre etiquetas e ícones, tooltip, sobreposição com controles inferiores, painel lateral em desktop, ficha inferior Android, grade de versões no diálogo e tabelas de comparação. Corrigidas com rolagem, reflow e separação espacial. Em `Expand all`, o mapa contém muitos nós e permite pan/zoom; não há garantia matemática de legibilidade simultânea de todos os rótulos na mesma viewport.

Testado via **Chromium headless** usando fixtures locais (ambiente de teste bloqueia acesso ao localhost): carregamento de 104 apps, seleção Linux, abertura do guia, escolha da versão, comandos KeePassXC, Shizuku Android, expandir/recolher grafo, interface de **390×844** e ausência de overflow horizontal do documento. Testes antigos V4 do catálogo/comparador seguem no pacote. `tools/test_v5.py` contém o roteiro executável. **Não foi possível validar o service worker offline em um site HTTPS real nem a instalação PWA no Android físico** neste ambiente; os arquivos e configuração de cache foram inspecionados, mas precisam de teste pós-publicação.

## Fontes para métodos específicos

Alguns exemplos das fontes utilizadas: [KeePassXC](https://keepassxc.org/download/), [FFmpeg / Debian](https://wiki.debian.org/ffmpeg), [Shizuku](https://shizuku.rikka.app/guide/setup/), [Tailscale](https://tailscale.com/docs/install/linux), [F-Droid](https://f-droid.org/pt_BR/docs/Get_F-Droid/), [Rethink](https://rethinkdns.com/download), [Canta](https://f-droid.org/packages/io.github.samolego.canta/), [scrcpy](https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md), [LibreTranslate](https://docs.libretranslate.com/guides/installation/). Cada método com comando traz sua fonte na interface.

A ferramenta, os nomes e as marcas mantêm os direitos de seus autores; os links e descrições são informativos, não recomendações absolutas de anonimato ou segurança. Não utilize software de auditoria em sistemas sem autorização.
