#!/usr/bin/env python3
"""Build offline, conservative, platform-aware install guides.
Concrete commands are opt-in and recorded with official upstream references.
Generic instructions never invent package names or installers.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
apps=json.loads((root/'catalog.json').read_text())

# id: list of official install documentation / store URLs (only confirmed where indicated)
OFFICIAL={
 'tor-browser':'https://www.torproject.org/download/',
 'firefox':'https://www.mozilla.org/pt-BR/firefox/new/',
 'firefox-focus':'https://www.mozilla.org/pt-BR/firefox/browsers/mobile/focus/',
 'f-droid':'https://f-droid.org/pt_BR/docs/Get_F-Droid/',
 'canta':'https://f-droid.org/packages/io.github.samolego.canta/',
 'shizuku':'https://shizuku.rikka.app/guide/setup/',
 'rethinkdns':'https://rethinkdns.com/download',
 'scrcpy':'https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md',
 'peazip':'https://peazip.github.io/peazip-linux.html',
 'tailscale':'https://tailscale.com/download',
 'keepassxc':'https://keepassxc.org/download/',
 'bitwarden':'https://bitwarden.com/download/',
 'veracrypt':'https://veracrypt.io/en/Downloads.html',
 'freefilesync':'https://freefilesync.org/download.php',
 'libretranslate':'https://docs.libretranslate.com/guides/installation/',
 'ffmpeg':'https://ffmpeg.org/download.html',
 'clamav':'https://docs.clamav.net/manual/Installing/Packages.html',
 'exiftool':'https://exiftool.org/',
 'thc-hydra':'https://www.kali.org/tools/hydra/',
 'atak-civ':'https://www.civtak.org/download-atak/',
 'obtainium':'https://github.com/ImranR98/Obtainium/releases',
 'osmand':'https://osmand.net/docs/user/installation/',
 'aegis-authenticator':'https://getaegis.app/',
 'freetakserver':'https://freetakteam.github.io/FreeTAKServer-User-Docs/',
 'openmeshtak':'https://openmeshtak.github.io/openmeshtak-docs/',
 'searxng':'https://docs.searxng.org/admin/installation.html',
 'shelter':'https://f-droid.org/packages/net.typeblog.shelter/',
 'insular-island':'https://f-droid.org/packages/com.oasisfeng.island.fdroid/',
 'libretorrent':'https://github.com/proninyaroslav/libretorrent/releases',
 'sd-maid-2-se':'https://github.com/d4rken-org/sdmaid-se/releases',
 'dangerzone':'https://dangerzone.rocks/',
 'cryptomator':'https://cryptomator.org/downloads/',
 'signal':'https://signal.org/download/',
 'ente-photos':'https://ente.io/download/',
 'ente-auth':'https://ente.io/auth/',
 'orbot':'https://orbot.app/en/download/',
 'accrescent':'https://accrescent.app/',
 'comaps':'https://www.comaps.app/',
 'picocrypt-ng':'https://github.com/Picocrypt-NG/Picocrypt-NG/releases',
 'ytdlnis':'https://github.com/deniscerri/ytdlnis/releases',
 'tellyscope':'https://github.com/man15h/tellyscope/releases',
 'zipxtract':'https://github.com/WirelessAlien/ZipXtract/releases',
 'de1984-firewall':'https://github.com/dorumrr/de1984/releases',
 'privacy-flip':'https://github.com/dorumrr/privacyFlip/releases',
 'fauxx':'https://github.com/digital-grease/fauxx/releases',
 'bitchat':'https://github.com/permissionlesstech/bitchat/releases',
 'github-osint-arsenal':'https://github.com/rawfilejson/awesome-osint-arsenal',
}

# Catalog overview texts: use warnings in catalog, no guarantees.
AFTER={
 'canta':'Inicie Shizuku primeiro; revise cada pacote cuidadosamente antes de desinstalar. Faça backup do aparelho.',
 'shizuku':'No Android 11+, ative Opções do desenvolvedor → Depuração sem fio; faça o pareamento pelo Shizuku. É necessário reiniciar o serviço após reiniciar o telefone.',
 'rethinkdns':'O firewall utiliza a interface VPN local do Android. Normalmente não é possível usá-lo ao mesmo tempo que outro app VPN, como Tailscale.',
 'de1984-firewall':'Confirme se o modo de proteção usa VPN local, pois pode entrar em conflito com outras VPNs.',
 'scrcpy':'Ative Opções do desenvolvedor e Depuração USB no Android; confirme a autorização ADB ao conectar o cabo.',
 'atak-civ':'Na primeira execução, conceda somente as permissões necessárias e prepare os mapas offline. Para comunicação em grupo, configure um servidor TAK confiável.',
 'freetakserver':'O APK Android Edition antigo não equivale a esta instalação Linux. Proteja a rede, crie certificados e usuários individualizados antes de permitir acesso remoto.',
 'openmeshtak':'Verifique arquitetura do servidor, Docker e portas TLS antes de conectar dispositivos remotos. Não exponha serviços sem autenticação.',
 'tailscale':'Entre na sua tailnet e revise permissões de dispositivos. O Android geralmente admite uma VPN ativa por vez.',
 'libretranslate':'Ao hospedar serviço local, limite o acesso à rede desejada, atualize modelos e proteja o endpoint se acessível externamente.',
 'searxng':'Proteja sua instância pública contra abuso; configure secret_key, limites de requisições e rede de saída conforme a documentação.',
 'freefilesync':'Faça primeiro uma sincronização de teste com duas pastas sem dados importantes; confira sentido e política de deleções.',
 'bleachbit':'Não execute limpeza agressiva sem backup. Em SSD, sobrescrita de arquivos não garante apagamento irrecuperável.',
 'dban':'Ferramenta bootável voltada a discos magnéticos. Não use para SSD e confirme rigorosamente a unidade de destino.',
 'ishredder':'Em memória flash, exclusão por sobrescrita não garante eliminação absoluta. Para descarte, use criptografia do dispositivo e redefinição segura.',
 'veracrypt':'Faça cópia de segurança e guarde o cabeçalho/chaves de recuperação antes de criptografar volumes com arquivos importantes.',
 'cryptomator':'Crie e teste a recuperação do cofre antes de mover seus arquivos. Guarde uma cópia das chaves e senhas.',
 'monero':'Proteja a seed de recuperação e confirme a assinatura da carteira baixada; nunca compartilhe a seed.',
 'hashcat':'Use somente em hashes próprios ou sob autorização expressa. Avalie os recursos de GPU e as dependências.',
 'john-the-ripper':'Use somente para auditorias autorizadas de credenciais.',
 'thc-hydra':'Use apenas em ambientes e sistemas para os quais você tenha autorização formal; a instalação não concede autorização para ataques.',
 'shodan':'A plataforma funciona no navegador e/ou por API; consultas a dados públicos não autorizam acesso aos dispositivos encontrados.',
 'virustotal':'Não envie documentos privados ou chaves: amostras podem ser disponibilizadas a parceiros de análise.',
 'any-run':'Não envie amostras ou dados confidenciais sem revisar a política de compartilhamento da sandbox.',
 'hybrid-analysis':'Não envie conteúdo pessoal/segredo a sandboxes públicas.',
 'tor-browser':'Não misture sessões anônimas com logins pessoais; instale apenas de fonte oficial.',
 'f-droid':'Depois da instalação inicial, mantenha os repositórios atualizados e revise permissões antes de instalar apps.',
 'obtainium':'Cadastre somente repositórios verdadeiros dos desenvolvedores e confira assinatura/publisher dos APKs.',
}

# Verified commands and relevant official source links, not universal package claims.
COMMANDS={
 'keepassxc': {'Linux': {'Debian / Ubuntu / MX Linux': ('sudo apt update\nsudo apt install keepassxc','https://keepassxc.org/download/'), 'Flatpak (distros compatíveis)':('flatpak install flathub org.keepassxc.KeePassXC','https://keepassxc.org/download/')}},
 'peazip': {'Linux':{'Flatpak (distros compatíveis)':('flatpak install flathub io.github.peazip.PeaZip','https://flathub.org/apps/io.github.peazip.PeaZip')}},
 'ffmpeg': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install ffmpeg\nffmpeg -version','https://wiki.debian.org/ffmpeg')}},
 'exiftool': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install libimage-exiftool-perl\nexiftool -ver','https://packages.debian.org/stable/libimage-exiftool-perl')}},
 'clamav': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install clamav clamav-daemon','https://docs.clamav.net/manual/Installing/Packages.html')}},
 'clamtk': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install clamtk','https://help.ubuntu.com/community/ClamAV')}},
 'thc-hydra': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install hydra','https://www.kali.org/tools/hydra/')}},
 'scrcpy': {'Windows':{'Windows 10 / 11 (winget)':('winget install --exact Genymobile.scrcpy','https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md')}, 'Linux':{'Arch / Manjaro':('sudo pacman -S scrcpy','https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md')}},
 'tailscale': {'Linux':{'Debian / Ubuntu / MX Linux':('curl -fsSL https://tailscale.com/install.sh -o tailscale-install.sh\n# Revise o conteúdo antes de executar:\nless tailscale-install.sh\nsudo sh tailscale-install.sh\nsudo tailscale up','https://tailscale.com/docs/install/linux')}},
 'libretranslate': {'Linux':{'Contêiner Docker':('docker run --rm -p 127.0.0.1:5000:5000 libretranslate/libretranslate','https://docs.libretranslate.com/guides/installation/')}} ,
 'bleachbit': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install bleachbit','https://www.bleachbit.org/download')}},
 'mat2': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install mat2','https://0xacab.org/jvoisin/mat2')}},
 'dc3dd': {'Linux':{'Debian / Ubuntu / MX Linux':('sudo apt update\nsudo apt install dc3dd','https://www.kali.org/tools/dc3dd/')}},
 'volatility': {'Linux':{'Python em ambiente isolado':('python3 -m venv .venv-volatility\n. .venv-volatility/bin/activate\npython -m pip install volatility3','https://github.com/volatilityfoundation/volatility3')}},
}

# Android verified manual distribution specifics. Unknown Android apps get carefully scoped manual instructions.
ANDROID_INSTALL={
 'f-droid':('APK oficial','Acesse o site F-Droid, baixe o APK oficial e instale. Autorize temporariamente a instalação por essa fonte e revogue depois.','https://f-droid.org/pt_BR/docs/Get_F-Droid/'),
 'canta':('F-Droid / Play Store','Instale o Canta pela listagem oficial. Instale e inicie o Shizuku antes de abrir o Canta.','https://f-droid.org/packages/io.github.samolego.canta/'),
 'shizuku':('App + pareamento','Instale o Shizuku; no Android 11 ou superior, ative Depuração sem fio e pareie o código dentro do app.','https://shizuku.rikka.app/guide/setup/'),
 'rethinkdns':('Google Play / F-Droid','Escolha a edição oficial em Downloads. Autorize a VPN local ao ativar; avalie o conflito com outras VPNs.','https://rethinkdns.com/download'),
 'atak-civ':('Google Play','Busque ATAK-CIV na Google Play ou use o portal CivTAK. Verifique o fornecedor antes de conceder permissões de localização.','https://www.civtak.org/download-atak/'),
 'tailscale':('Google Play','Instale o Tailscale pelo Google Play; abra o app, faça login e aceite a criação da VPN.','https://tailscale.com/docs/install/android'),
 'osmand':('F-Droid / Play Store','Instale OsmAnd pela loja oficial ou OsmAnd~ no F-Droid e baixe os mapas desejados antes do uso offline.','https://f-droid.org/packages/net.osmand.plus/'),
 'obtainium':('GitHub Releases / F-Droid','Instale pelo APK da página Releases do projeto ou pela listagem verificada do F-Droid.','https://github.com/ImranR98/Obtainium/releases'),
 'shelter':('F-Droid','Instale pela página oficial no F-Droid e crie um perfil de trabalho. Alguns fabricantes bloqueiam recursos de perfil.','https://f-droid.org/packages/net.typeblog.shelter/'),
 'insular-island':('F-Droid','Instale pela listagem do F-Droid. Configure o perfil de trabalho e verifique compatibilidade com seu Android.','https://f-droid.org/packages/com.oasisfeng.island.fdroid/'),
 'bitwarden':('Google Play / site oficial','Instale o gerenciador Bitwarden pelo Google Play ou pela página de downloads do fornecedor.','https://bitwarden.com/download/'),
 'signal':('Google Play / APK oficial','Instale Signal pela loja oficial ou pela página APK oficial. Verifique o número e o dispositivo registrados.','https://signal.org/android/apk/'),
 'ente-photos':('Google Play / site oficial','Instale Ente Photos pela loja indicada no site oficial e configure o backup com cuidado.','https://ente.io/download/'),
 'aegis-authenticator':('F-Droid / Google Play','Instale Aegis Authenticator pela página oficial e configure o backup criptografado dos códigos TOTP.','https://getaegis.app/'),
}

WEB_HOSTED={'startpage','openstreetmap','have-i-been-pwned','behind-the-email','justdeleteme','who-is','registro-br-whois','shodan','pimeyes','epieos','osint-arsenal','google-hacking-database','hybrid-analysis','any-run','virustotal','metadefender','linux-leo','simsup','nadanada','crypton','silent-link','stealths','hero-sms','onesimcard','telera'}
SERVER={'searxng','libretranslate','freetakserver','openmeshtak'}

# Step description is intentionally installation-method-first and avoids claiming that arbitrary software is packaged for apt/winget.
def build_for(app,p):
 name=app['name']; slug=app['id']; official=OFFICIAL.get(slug,app['url']); note=AFTER.get(slug,'Consulte requisitos, permissões, integridade da assinatura e atualizações no site do desenvolvedor.')
 if slug=='yubikey' and p!='Web':
  steps=['A YubiKey é um dispositivo físico. Verifique se o aparelho tem porta USB compatível ou NFC.', 'Na conta que deseja proteger, abra Segurança → Passkeys / Chaves de segurança e escolha Adicionar chave.', 'Conecte ou aproxime a YubiKey, confirme o registro e configure um método de recuperação. Para TOTP, consulte o Yubico Authenticator.']
  return {'method':'Chave física — registro, não instalação de programa','status':'orientação','steps':steps,'warning':'Guarde uma segunda chave ou método de recuperação. Disponibilidade de NFC/FIDO2 depende do dispositivo e do serviço.','url':'https://www.yubico.com/setup/','versions':[{'name':p+' — USB / NFC conforme o modelo','steps':steps}]}
 if p=='Web':
  if slug in SERVER:
   steps=[f'Acesse a documentação do {name} e selecione a modalidade web: instância pública ou URL do seu servidor.', 'Se for auto-hospedado, configure o servidor na plataforma Servidor; o navegador só acessa o serviço.', 'Abra a URL HTTPS da instância e confira autenticação e política de registros.']
  else: steps=[f'Abra o endereço oficial do {name} em um navegador atualizado.', 'Quando aplicável, autentique-se ou use o serviço diretamente; não precisa instalar um executável.', 'Opcional: use “Adicionar à tela inicial” / “Instalar site” para criar um atalho, se o navegador permitir.']
  return {'method':'Serviço web — sem instalação local','status':'web','steps':steps,'warning':note,'url':official,'versions':[{'name':'Navegador (Android, Linux, Windows, macOS)','steps':steps}]}
 if p=='Android':
  hit=ANDROID_INSTALL.get(slug)
  if hit: steps=[hit[1],'Abra o aplicativo e conclua a configuração inicial e as permissões necessárias.']; official=hit[2]; method=hit[0]; verified=True
  else:
   if 'github.com/' in official or 'github.com/' in app['url']:
    steps=[f'Abra o repositório oficial de {name}; procure Releases e selecione uma versão estável compatível com seu Android.', 'Caso exista um APK oficial, baixe-o e confira desenvolvedor/assinatura. Abra o APK e confirme a instalação.', 'Desative a permissão de instalar apps desconhecidos após concluir. Não instale APKs fornecidos por terceiros.']
   else:
    steps=[f'Abra a página oficial de {name} e escolha a versão Android / Google Play / F-Droid, conforme oferecida.', 'Instale pela loja indicada; se só houver APK oficial, verifique assinatura e origem.', 'Abra o aplicativo e configure apenas as permissões exigidas.']
   method='Loja ou APK do desenvolvedor (verificar disponibilidade)';verified=False
  return {'method':method,'status':'verificado' if verified else 'orientação','steps':steps,'warning':note,'url':official,'versions':[{'name':'Android 13 / 14 / 15+','steps':steps},{'name':'Android 11 / 12','steps':steps+['Confira a versão mínima suportada na página oficial; nem todos os apps oferecem versões antigas.']},{'name':'Android 10 ou anterior — verificar suporte','steps':( ['Instale o app Shizuku de fonte oficial se a versão do Android for compatível.','O pareamento por depuração sem fio não existe nessa versão: siga o tutorial oficial para iniciar com ADB a partir de um computador.','Consulte a documentação para conferir os requisitos antes de continuar.'] if slug=='shizuku' else steps+['Antes de instalar, confirme o Android mínimo exigido. Este aplicativo pode não oferecer suporte ao Android 10 ou anterior.'])}]}
 if p=='Linux':
  methods=COMMANDS.get(slug,{}).get('Linux',{}); versions=[]
  for variant in ['Debian / Ubuntu / MX Linux','Fedora / RHEL','Arch / Manjaro','Flatpak (distros compatíveis)','Contêiner Docker','Python em ambiente isolado']:
   if variant in methods:
    cmd,docs=methods[variant]; versions.append({'name':variant,'steps':[f'Abra um terminal em {variant.split(" /")[0]} e verifique os comandos abaixo.','Execute os comandos (revise primeiro quaisquer scripts externos).','Abra o aplicativo e confira a versão instalada.'],'command':cmd,'source':docs,'status':'verificado'})
   elif variant in ['Debian / Ubuntu / MX Linux','Fedora / RHEL','Arch / Manjaro']:
    versions.append({'name':variant,'steps':[f'Abra a página de downloads oficial do {name} e selecione a edição Linux para sua arquitetura e distribuição.', 'Se houver pacote compatível (.deb/.rpm), instale com o gerenciador de pacotes do sistema; se houver AppImage, siga a documentação do projeto.', 'Não use um comando genérico `apt install`/`dnf install` sem verificar que o pacote existe e se é a versão correta.'],'status':'orientação'})
  steps=[f'Escolha sua distribuição Linux e consulte as opções fornecidas pelo {name}.','Priorize repositório oficial ou pacote assinado. Não presuma que o mesmo comando funciona em todas as distros.','Após instalar, verifique a versão e as permissões do aplicativo.']
  return {'method':'Instalação Linux — por distribuição','status':'verificado' if methods else 'orientação','steps':steps,'warning':note,'url':official,'versions':versions}
 if p=='Windows':
  versions=[]; cmds=COMMANDS.get(slug,{}).get('Windows',{})
  if cmds:
   for variant,(cmd,docs) in cmds.items():versions.append({'name':variant,'command':cmd,'source':docs,'steps':['Abra Terminal/PowerShell normal e confira o nome do pacote no repositório do winget.','Execute o comando indicado; confirme as solicitações e abra o aplicativo.'],'status':'verificado'})
  versions.append({'name':'Windows 10 / 11 — instalador oficial','status':'orientação','steps':[f'Abra a seção de downloads do {name} e selecione a versão Windows compatível com sua arquitetura.', 'Baixe o instalador oficial (.exe/.msi) ou pacote portátil, se disponível.', 'Verifique a assinatura/editor e conclua a instalação conforme o assistente.']})
  return {'method':'Windows — instalador / winget','status':'verificado' if cmds else 'orientação','steps':[f'Obtenha a versão Windows no site oficial de {name}.','Use o assistente de instalação do fornecedor; confirme assinatura e fabricante.'],'warning':note,'url':official,'versions':versions}
 if p=='macOS':
  steps=[f'Acesse a página de downloads oficial de {name} e selecione a versão macOS.', 'Escolha a arquitetura apropriada: Intel (x86_64) ou Apple Silicon (arm64), se a distinção existir.', 'Abra o .dmg/.pkg ou siga o procedimento descrito pelo fornecedor; conclua as permissões solicitadas.']
  return {'method':'macOS — pacote oficial','status':'orientação','steps':steps,'warning':note,'url':official,'versions':[{'name':'Apple Silicon (M1/M2/M3/M4…)','steps':steps},{'name':'Mac Intel','steps':steps}]}
 if p=='Live USB':
  steps=[f'Baixe a imagem de inicialização do {name} e consulte as verificações de assinatura/hash indicadas no site.', 'Grave a imagem em um pendrive com a ferramenta documentada pelo projeto.', 'Reinicie o computador, selecione a inicialização pelo USB e confira a unidade antes de qualquer operação que altere discos.']
  return {'method':'Imagem bootável — USB','status':'orientação','steps':steps,'warning':note,'url':official,'versions':[{'name':'Computador compatível / USB','steps':steps}]}
 if p=='Servidor':
  steps=[f'Leia os requisitos e o guia de implantação do {name} antes de baixar imagens ou executar comandos.', 'Escolha um servidor Linux compatível, revise portas, certificados, persistência de dados e a política de backup.', 'Implante pelos comandos/Compose documentados pelo fornecedor; valide a saúde do serviço e mantenha atualizações.']
  if slug=='libretranslate':
   variant={'name':'Docker — uso local','status':'verificado','steps':['Instale Docker Engine previamente.','Execute o contêiner com publicação limitada ao loopback, para não expor o serviço na internet.','Acesse http://127.0.0.1:5000 no próprio servidor; baixe modelos quando solicitado.'],'command':'docker run --rm -p 127.0.0.1:5000:5000 libretranslate/libretranslate','source':OFFICIAL['libretranslate']};versions=[variant]
  else: versions=[{'name':'Linux + Docker / Compose (consultar manual)','steps':steps,'status':'orientação'}]
  return {'method':'Servidor auto-hospedado','status':'verificado' if slug=='libretranslate' else 'orientação','steps':steps,'warning':note,'url':official,'versions':versions}
 if p=='Hardware':
  steps=[f'Adquira o equipamento {name} por canal oficial ou distribuidor autorizado.', 'Consulte os requisitos USB/NFC e a compatibilidade com o serviço ao qual pretende vinculá-lo.', 'Configure mais de uma chave de recuperação ou alternativa antes de depender do hardware como único fator de acesso.']
  return {'method':'Dispositivo físico — configuração','status':'orientação','steps':steps,'warning':note,'url':official,'versions':[{'name':'USB / NFC (conforme modelo)','steps':steps}]}
 return {'method':'Consulte a documentação oficial','status':'orientação','steps':[f'Abra o site oficial do {name} e escolha a distribuição disponível.'],'warning':note,'url':official,'versions':[]}

out={}
for a in apps:
 out[a['id']]={'name':a['name'],'category':a['cat'],'platforms':{p:build_for(a,p) for p in a['platforms']}}
assert len(out)==len(apps)
(root/'install-guides.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Created install-guides.json:',len(out),'apps,',sum(len(x['platforms']) for x in out.values()),'platform guides,',sum(bool(v.get('command')) for a in out.values() for p in a['platforms'].values() for v in p['versions']),'commands.')
