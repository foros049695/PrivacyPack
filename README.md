# PRIVACYPACK / ATLAS 3D — PWA v3.0

Catálogo pessoal de privacidade, segurança e investigação digital para **Android**, **Linux**, **Windows**, **macOS** e ferramentas web. Esta edição tem **104 entradas em 30 categorias**: 73 originais, 29 novas indicadas e FreeTAKServer/OpenMeshTak.

## Funcionalidades

- Mapa com nós em coordenadas 3D, câmera com perspectiva e rotação por gesto, zoom por pinça, roda ou botões. Profundidade, anéis, ramificações e partículas em movimento. Implementado em Canvas com projeção matemática 3D, **sem WebGL**, para rodar de forma independente e offline em aparelhos modestos. Não é um motor 3D fotorrealista.
- Clique em uma categoria no mapa para revelar as ferramentas daquela ramificação; clique em um aplicativo para abrir sua ficha. A navegação por catálogo é alternativa acessível ao mapa.
- Ficha de cada item: explicação prática, recursos, riscos/limitações, tipo de software, plataformas com ícones, link da fonte, favorito e notas privadas locais.
- Comparador entre **duas ferramentas da mesma categoria**, exibindo objetivos, recursos, plataformas, limitações e fontes lado a lado. Categorias com uma ferramenta não têm par para comparação.
- Filtros separados **Android**, **Linux**, **Windows**, **Só Windows**, **macOS**, **Web**, **Servidor** e **Live USB**, além de categorias e pesquisa por texto.
- Ícone em **todos os 104 cartões**, no mapa, nas fichas e nas tabelas de comparação. Os ícones offline são **identificadores próprios em SVG**, não cópias dos logos oficiais; os favicons de sites podem ser ativados nas configurações com aviso de privacidade. Existem também ícones SVG locais para os sistemas operacionais.
- Favoritos, notas, exportação e importação JSON sem conta. Dados ficam no `localStorage` do navegador. Nunca salve credenciais, segredos ou seeds neste catálogo.
- PWA com manifesto de instalação e Service Worker que armazena todo o catálogo, a interface e os ícones locais para uso offline. Links externos exigem internet.
- Botão **Atualizar catálogo** para buscar conteúdo recém-publicado; também existe atualização padrão do service worker. Para atualizar o inventário, modifique os dados e publique novamente no GitHub Pages.

## Instalar pelo GitHub Pages (Android, sem computador)

1. Extraia o ZIP para uma pasta no celular. **Envie o conteúdo interno**, não o arquivo ZIP nem uma pasta externa, para a raiz do repositório GitHub.
2. Crie um repositório **público**, por exemplo `PrivacyPack`. Entre em `Add file → Upload files` e envie os arquivos da pasta, **preservando a estrutura dos diretórios** (`assets/icons/apps`, `assets/icons/platforms`, etc.). Enviar centenas de arquivos pela interface móvel pode ser trabalhoso; nesse caso é mais fácil usar um computador com `git` ou o app de gerenciamento de repositórios de sua preferência.
3. Abra `Settings → Pages` no repositório. Em `Build and deployment`, selecione `Deploy from a branch`, branch `main`, diretório `/(root)` e salve.
4. Acesse `https://SEU_USUARIO.github.io/PrivacyPack/` (substitua pelo seu usuário e nome do repositório). A publicação pode levar algum tempo.
5. No **Chrome Android**, abra a URL HTTPS, entre no menu `⋮` e toque em `Instalar aplicativo` (ou `Adicionar à tela inicial`). O instalador PWA exige HTTPS, exceto `localhost`.
6. Abra a PWA uma vez com conexão para o Service Worker armazenar as centenas de arquivos. Em seguida ative **Modo avião**, reabra e confira os cartões, ícones, comparador, notas e mapa. Os links externos não abrem offline.

**Nota**: O upload web do GitHub muitas vezes não permite enviar uma árvore inteira com dezenas de subpastas facilmente no celular. Uma maneira confiável é enviar o projeto com Git no PC:

```bash
unzip PrivacyPack_Atlas_v3.zip
cd PrivacyPack_Atlas_v3
git init
git add .
git commit -m "Publicar PrivacyPack Atlas v3"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/PrivacyPack.git
git push -u origin main
```

Não sobrescreva um repositório existente por engano. Se já possuir PrivacyPack, copie os arquivos para ele e crie commit normalmente.

## Executar localmente no Linux

```bash
cd PrivacyPack_Atlas_v3
python3 -m http.server 8080
```
Abra `http://localhost:8080/` no Firefox/Chrome. `file://` não disponibiliza service worker nem permite `fetch` do JSON normalmente.

## Arquivos principais

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura sem frameworks externos |
| `style.css` | Interface responsiva |
| `app.js` | Catálogo, comparação, navegação, Canvas 3D, notas e favoritos |
| `catalog.json` | Descrições individuais e referências de cada aplicativo |
| `categories.json` | Categorias, cores e quantidades |
| `assets/icons/apps/*.svg` | Identificadores locais únicos para todas as ferramentas |
| `assets/icons/platforms/*.svg` | Identificação de plataformas |
| `assets/icon-192.png`, `icon-512.png` | Ícones de instalação Android/Desktop |
| `sw.js` | Cache offline de arquivos estáticos e catálogo |
| `tools/build_catalog.py` | Fonte editável dos dados e geração dos SVGs |

## Compatibilidade e segurança

- A lista de plataformas é informativa e pode diferir por versão do aplicativo, arquitetura, plano e disponibilidade do projeto. Serviços web são marcados como **Web** e não devem ser confundidos com apps nativos. `scrcpy` roda no computador e controla um Android. FTK Imager está marcado Windows somente. Tails e DBAN são ferramentas **Live USB**.
- A edição antiga do FreeTAKServer Android não é assumida compatível com Android 13; para uso estável, o servidor moderno é classificado como Linux/Servidor.
- Algumas ferramentas Android implementam VPN local; Android normalmente permite uma VPN por perfil, portanto podem competir com Tailscale. Shizuku/Canta podem requerer depuração e permissões especiais. Não remova pacotes essenciais sem plano de recuperação.
- O projeto não transmite notas ou favoritos a terceiros. **Ativar ícones oficiais online** consulta o serviço de favicons do Google e pode revelar consultas; a opção fica **desativada por padrão**.
- O catálogo não executa nenhum programa listado, não instala apps por conta própria, não faz varreduras nem acessa seus arquivos.
- ATENÇÃO: PWA **não é cofre criptografado**. O backup JSON contém notas em texto puro. Não armazene senhas, chaves privadas ou informações sensíveis.
- As URLs devem ser revisitadas periodicamente para evitar alterações de propriedade ou fornecedores. Os resumos não substituem auditorias técnicas independentes.

## Testes recomendados

- [ ] O mapa aparece, roda com arraste, dá zoom e abre ramificações.
- [ ] A ficha de PeaZip mostra Linux/Windows/macOS; scrcpy também aparece em Linux/Windows/macOS, mas não Android como instalação nativa.
- [ ] O filtro **Só Windows** exibe apenas ferramentas exclusivas, como FTK Imager.
- [ ] Os ícones de cada app e sistema aparecem offline.
- [ ] A comparação dentro de **Firewall e rede** mostra RethinkDNS, De1984 Firewall e Tailscale com alertas de compatibilidade.
- [ ] As notas persistem ao recarregar e são exportadas no JSON.
- [ ] O catálogo funciona offline depois do primeiro carregamento completo.
- [ ] O manifesto PWA instala no Android via endereço HTTPS.

## Como alterar o catálogo

Atualize `tools/build_catalog.py` e execute `python3 tools/build_catalog.py`. Isso regenera JSONs e SVGs. Para acrescentar um novo app, inclua os dados no campo `NEW`, atualize a contagem de validação na própria ferramenta e gere novamente. Recrie `assets-manifest.json` com os caminhos de ícones e altere a versão `CACHE` em `sw.js` para que todos os usuários recebam os novos arquivos.
