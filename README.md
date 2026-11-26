# FloraAura

Progressive Web App em HTML, CSS e JavaScript. A autenticação e os dados são sincronizados com Firebase.

## Versão online

[Abrir FloraAura no GitHub Pages](https://teresinhacmorais.github.io/FloraAura/)

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
- `assets/js/db.js` gere as contas, plantas, registos de cuidados, carrinhos e favoritos no Cloud Firestore; as contas são consultadas pelo UID do Firebase Authentication.
- `assets/js/auth.js` gere o registo, início e fim de sessão com Firebase Authentication.
- `manifest.json` define os metadados e ícones usados na instalação.
- `sw.js` guarda o essencial da aplicação em cache e disponibiliza uma página offline.
- `pages/` contém páginas HTML secundárias.

## Executar localmente

O service worker só funciona em HTTPS ou em `localhost`; abrir o HTML diretamente como ficheiro (`file://`) não é suficiente. No VS Code, inicia um servidor local, por exemplo com a extensão **Live Server**, e abre a aplicação pelo endereço local apresentado.

Depois de abrir a aplicação uma vez com ligação, o essencial fica disponível em cache para consultas offline.

## Loja, encomendas e identificação por fotografia

O catálogo apresenta plantas com fotografias, preços indicativos e informações de cuidados. O carrinho recolhe dados de envio e permite escolher Apple Pay, MB WAY ou cartão de débito. Ao escolher cartão, são pedidos dados fictícios para a demonstração; nunca introduzas dados de um cartão real. Não há pagamentos ou envios reais, e os dados de checkout não são guardados nem enviados.

No ecrã «Identificar», a aplicação pode enviar a fotografia ao serviço de visão computacional do iNaturalist depois de o utilizador dar consentimento. São apresentadas várias sugestões, inclusive espécies fora do catálogo; as fichas de cuidados detalhadas só existem para as plantas do catálogo. Esta funcionalidade requer ligação à internet e as sugestões podem estar incorretas.

A interface adapta-se a telemóveis, tablets e computadores, tanto na orientação vertical como horizontal.

## Conta e perfil

É possível criar conta com nome, data de nascimento, email e password, ou iniciar sessão com nome, email e password. O Firebase Authentication gere as credenciais e o perfil é guardado no Cloud Firestore, associado ao UID da conta. No perfil, podes escolher ou remover uma fotografia; é criada uma versão quadrada reduzida e guardada no Firebase. As contas, plantas, favoritos e carrinho são sincronizados entre dispositivos.

## Configuração do Firebase

1. No Firebase Console, ativa **Authentication > Sign-in method > Email/Password**.
2. Cria uma base de dados **Cloud Firestore**.
3. Publica as regras de [`firestore.rules`](./firestore.rules) com `firebase deploy --only firestore:rules`.
4. O projeto já contém a configuração web da aplicação em `assets/js/firebase.js`.

Os módulos do Firebase são carregados por CDN. A aplicação deve ser aberta por HTTPS ou por `localhost` para funcionar corretamente.

## Favoritos e lembretes

Os favoritos ficam guardados por conta neste dispositivo. Ao adicionar uma planta ao jardim, é possível escolher um intervalo de rega entre 1 e 60 dias e ativar ou não o lembrete. A aplicação calcula a próxima rega a partir da data de adição ou da última rega e apresenta os lembretes quando está aberta. Não são enviadas notificações quando a aplicação está fechada; isso exigiria um serviço próprio de notificações.
