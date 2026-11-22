# Instalação do PrivacyPack Wiki V5 no Android via GitHub Pages

## 1. Atualize seu repositório

1. Baixe e extraia `PrivacyPack_Wiki_v5.zip`.
2. Abra seu repositório existente do PrivacyPack no GitHub.
3. Faça backup do conteúdo atual, depois envie os arquivos novos, mantendo as pastas `assets/`, `tools/` e `.github/`.
4. Confirme que **`install-guides.json` fica na raiz**, junto de `index.html` e `sw.js`. Se faltar, o catálogo abre mas as instruções não serão exibidas.
5. Faça commit. Não substitua o histórico usando `push --force`.

## 2. Publique o site

Em `Settings → Pages`, selecione **GitHub Actions** como fonte de publicação. Na aba `Actions`, acompanhe `Build & publish PrivacyPack Wiki` até aparecer como concluído com sucesso.

Caso prefira **Deploy from a branch**, selecione `main` e `/(root)`; nesse modo o PWA funciona, mas a coleta automática de logos não acontece.

## 3. Instale no celular

1. Abra a URL do GitHub Pages usando o Chrome Android, por exemplo `https://SEU_USUARIO.github.io/PrivacyPack/`.
2. Menu ⋮ → `Instalar aplicativo` ou `Adicionar à tela inicial`.
3. Abra o ícone PrivacyPack na tela inicial e selecione Android na barra de sistemas.
4. Escolha um aplicativo e toque em `↓ Instruções de instalação`.
5. Selecione o Android na grade, depois a versão desejada, e siga as instruções específicas da ficha.

## 4. Testes e solução de problemas

- Se continuar na V4, recarregue a página conectado e verifique se o workflow publicou a V5. Fechar/reabrir o PWA pode ajudar a ativar o novo service worker.
- Se o guia não aparecer, confira em `https://SEU_USUARIO.github.io/PrivacyPack/install-guides.json` se o arquivo existe e é um JSON válido.
- Se os ícones não forem obtidos, verifique a configuração de logos no menu do aplicativo. Em modo offline, o app só pode mostrar os logos já incorporados/cached.
- Para conferir offline, abra o PWA conectado uma vez, depois ative modo avião e recarregue. A ficha e os passos devem continuar disponíveis.
- O aplicativo **não executa comandos no Android ou no Linux**. Copie os comandos e use-os no dispositivo e terminal corretos somente após revisão.

Mais detalhes: [README.md](README.md).
