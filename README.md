# FloraAura

Progressive Web App em HTML, CSS e JavaScript sem dependências externas.

## Estrutura

```text
MeuProjetoPWA/
├── index.html
├── manifest.json
├── sw.js
├── pages/
│   ├── offline.html
│   └── sobre.html
└── assets/
    ├── css/
    │   └── styles.css
    ├── images/
    │   ├── flora-aura-logo.png
    │   ├── plants/
    │   │   └── photos.json
    │   ├── icons/
    │   │   ├── icon-192x192.png
    │   │   ├── icon-512x512.png
    │   │   └── icon.svg
    │   └── logo.svg
    └── js/
        ├── app.js
        ├── auth.js
        ├── catalog.js
        ├── db.js
        └── modules/
            ├── api.js
            └── UI.js
```

- `index.html` é o ponto de entrada e liga o manifesto, estilos e módulo JavaScript.
- `assets/css/` contém os estilos da aplicação.
- `assets/js/app.js` inicializa a interface e regista o service worker.
- `assets/js/catalog.js` contém o catálogo de plantas, preços de demonstração e guias de cuidados.
- `assets/images/plants/` contém as fotografias reais do catálogo. As imagens indicam a respetiva fonte.
- `assets/images/flora-aura-logo.png` contém o logótipo fornecido para a marca; os ícones da PWA usam o símbolo correspondente.
- `assets/js/modules/` separa funcionalidades reutilizáveis, como UI e pedidos HTTP.
- `assets/js/db.js` prepara o IndexedDB local para contas, plantas, registos de cuidados, carrinhos e favoritos.
- `assets/js/auth.js` gere o registo, início e fim de sessão; as passwords são derivadas com PBKDF2 e não são guardadas em texto simples.
- `manifest.json` define os metadados e ícones usados na instalação.
- `sw.js` guarda o essencial da aplicação em cache e disponibiliza uma página offline.
- `pages/` contém páginas HTML secundárias.

## Executar localmente

O service worker só funciona em HTTPS ou em `localhost`; abrir o HTML diretamente como ficheiro (`file://`) não é suficiente. No VS Code, inicia um servidor local, por exemplo com a extensão **Live Server**, e abre a aplicação pelo endereço local apresentado.

Depois de abrir a aplicação uma vez com ligação, o essencial fica disponível em cache para consultas offline.

## Loja e identificação por fotografia

O catálogo apresenta plantas com fotografias, preços indicativos e informações de cuidados. O carrinho e a confirmação de encomenda são uma demonstração local, sem pagamentos nem envios reais.

O ecrã «Identificar» permite tirar/escolher uma fotografia e consultar os cuidados de uma planta selecionada. A aplicação não reconhece automaticamente a espécie na imagem; para essa função seria necessário integrar um serviço/modelo de identificação de plantas.

A interface adapta-se a telemóveis, tablets e computadores, tanto na orientação vertical como horizontal.

## Conta e perfil

É possível criar conta com nome, data de nascimento, email e password, ou iniciar sessão com nome, email e password. No perfil, podes escolher ou remover uma fotografia; é criada uma versão quadrada reduzida e guardada apenas no navegador/dispositivo atual. As contas e os dados não são sincronizados entre dispositivos. A password é guardada como hash com sal, mas esta implementação local é apenas demonstrativa e não substitui autenticação num servidor para proteger dados reais.

## Favoritos e lembretes

Os favoritos ficam guardados por conta neste dispositivo. Ao adicionar uma planta ao jardim, é possível escolher um intervalo de rega entre 1 e 60 dias e ativar ou não o lembrete. A aplicação calcula a próxima rega a partir da data de adição ou da última rega e apresenta os lembretes quando está aberta. Não são enviadas notificações quando a aplicação está fechada; isso exigiria um serviço próprio de notificações.
