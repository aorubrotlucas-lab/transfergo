
# 🚗 TransferGo - Motor de Reservas & Plugin Web

O **TransferGo** é um motor de reservas completo para serviços de transfer, desenhado para ser integrado em qualquer website via Iframe ou usado como aplicação autónoma.

[![Repo](https://img.shields.io/badge/Repository-aorubrotlucas--a11y%2Ftransfergo-black?style=flat-square&logo=github)](https://github.com/aorubrotlucas-a11y/transfergo)

## 🔌 Integração como Plugin

Este projeto foi otimizado para funcionar como um plugin de terceiros. Ao ser embutido num Iframe, o acesso administrativo é automaticamente ocultado para o utilizador final.

### 1. Obter o Código de Embed
Aceda ao seu painel de administração em:
`https://seu-dominio.com/?admin=true` -> Separador **Plugin Iframe**.

### 2. Exemplo de Implementação
Cole este código no `<body>` do seu site principal (Wordpress, Wix, React, HTML puro):

```html
<iframe 
  src="https://transfergo-booking.vercel.app" 
  width="100%" 
  height="800px" 
  frameborder="0" 
  style="border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
</iframe>
```

## 🛠️ Modos de Visualização

O sistema alterna o comportamento com base em parâmetros da URL:

- **Modo Cliente (Default)**: `https://dominio.com/`
  - Apenas o motor de reservas é visível.
  - Botão de Admin oculto.
  - UI limpa para conversão.

- **Modo Admin**: `https://dominio.com/?admin=true`
  - Ativa o botão flutuante para aceder ao Dashboard.
  - Permite gestão de frota, preços e reservas.
  - Configuração de chaves de API Stripe.

## 🚀 Tecnologias Utilizadas
- **React 19** & **Tailwind CSS** (UI moderna e rápida)
- **Leaflet** (Mapas interativos sem custos de Google Maps)
- **OSRM API** (Cálculo de rotas em tempo real)
- **Photon API** (Autocomplete de moradas inteligente)

## 📄 Licença
Desenvolvido por [Lucas](https://github.com/aorubrotlucas-a11y). Licença MIT.
