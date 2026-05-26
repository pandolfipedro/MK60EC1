# Calculadora MK60EC1 Long Code

Aplicação web estática (PT-BR) para **gerar**, **decodificar** e **migrar** long coding do módulo ABS/ESP **MK60EC1** (VAG: Golf, Jetta, Octavia, Yeti, etc.).

Tudo roda no navegador — VIN e long code **não são enviados** a nenhum servidor.

## Funcionalidades

- **Gerar**: VIN + part number SW + opções por byte (17–20 bytes)
- **Decodificar**: hex → tabela byte a byte com espelhos e avisos
- **Migrar**: troca de módulo (ex.: BC→AD, AT→BM, 18→19→20 B) com diff e regras etz2k/lprot

## Referências

- [BrianOConner333 — MK60EC1 (Drive2)](https://www.drive2.ru/l/549781928362902816/)
- [lprot — coding consciente](https://www.drive2.ru/l/623620456359922967/)
- [etz2k — label Ross-Tech](https://forums.ross-tech.com/index.php?threads/31859/)

## Desenvolvimento

```bash
npm install
npm run dev
npm test
npm run build
```

## Deploy (GitHub Pages)

1. Ative **Pages** no repositório: Settings → Pages → Source: **GitHub Actions**
2. Push na branch `main` — o workflow `.github/workflows/deploy.yml` publica em `https://<user>.github.io/<repo>/`

Para build local com base path customizado:

```bash
BASE_PATH=/MK60EC1/ npm run build
```

## Aviso

Ferramenta educativa. Sempre valide no veículo com VCDS/ODIS; use o VIN do **módulo 17 (painel)**. Codificação incorreta pode impedir o ABS de aceitar valores ou causar falhas.
