# Instalar PrivacyPack Wiki no Android pelo GitHub

O PWA não precisa de APK, root ou Termux para ser instalado. **O primeiro deploy precisa estar no GitHub Pages com HTTPS**.

## Se você já tem um repositório PrivacyPack

Recomendado: atualize os arquivos usando Git no computador. Faça backup antes de substituir a versão anterior. Preserve `.github/workflows/pages.yml`. Depois, em GitHub → **Settings → Pages → Source**, marque **GitHub Actions** (não "Deploy from a branch"). Isso permite que o deploy também pesquise ícones dos projetos e inclua cópias offline, quando disponíveis.

## Instalação

1. Acesse seu repositório GitHub no navegador e abra **Actions**. A execução **Build & publish PrivacyPack Wiki** deve aparecer em verde. Se não existir, confirme que a pasta `.github/workflows/` foi enviada ao repositório.
2. Abra **Settings → Pages**. Confira a URL `https://SEU_USUARIO.github.io/PrivacyPack/` e abra-a no Chrome do Android.
3. No Chrome, toque em **⋮** e selecione **Instalar app** (ou **Adicionar à tela inicial** e depois **Instalar**, dependendo do navegador).
4. Confirme e abra o ícone PrivacyPack na tela inicial.
5. Abra ⚙ e toque em **Baixar ícones** enquanto estiver conectado à internet para aumentar a chance de mantê-los no cache offline.
6. Ative o modo avião e confirme que o mapa, as fichas, a pesquisa e suas notas continuam disponíveis. Links externos e ícones não armazenados exigem internet.

## Atualizar a versão antiga

Se o Android continuar exibindo uma versão anterior, abra o site online no Chrome, use ⚙ → **Verificar atualização** e recarregue o site. Alguns navegadores podem precisar fechar e abrir o PWA novamente. Seus favoritos e notas podem ser exportados pelo menu ⚙ antes da atualização.

## Se não aparecer "Instalar app"

Confira que o site foi publicado em **HTTPS** e que o `manifest.webmanifest`, `sw.js`, `assets/icon-192.png` e `assets/icon-512.png` estão acessíveis. Chrome pode mostrar **Adicionar à tela inicial** em vez de **Instalar**. Não é necessário converter o site em APK.

## Privacidade

O conteúdo do catálogo e o código da interface publicados no GitHub são **públicos**. Suas notas e favoritos ficam **locais** no navegador e não fazem parte do repositório. Não anote senhas ou chaves privadas.
