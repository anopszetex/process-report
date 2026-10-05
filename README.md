# process-report

Single-pass duplicate detection for CSV datasets using Node.js streams and child processes.

## Design

The main process streams the CSV and hashes each record key to a stable worker partition. Records with the same key always reach the same worker. Each worker maintains its own `Set` and reports a duplicate only once.

This design provides:

- **O(n)** file processing instead of rescanning the dataset per record;
- bounded streaming input with IPC backpressure;
- deterministic partitioning;
- parallel ownership of the in-memory index;
- at most eight workers to avoid excessive process overhead.

## Run

```sh
npm ci
npm start
```

## Test and validate

```sh
npm run check
npm test
```

The included dataset intentionally contains duplicate Pokémon names and is used as a reproducible example.

## License

[MIT](LICENSE)

---

<details>
<summary><strong>🇧🇷 Ver documentação em Português (Brasil)</strong></summary>

# process-report

Detecção de registros duplicados em uma única passagem por datasets CSV, usando streams e processos filhos do Node.js.

## Arquitetura

O processo principal lê o CSV como stream e aplica um hash à chave de cada registro. Registros com a mesma chave sempre são enviados para o mesmo worker. Cada worker mantém seu próprio `Set` e informa uma duplicata apenas uma vez.

O desenho oferece:

- processamento **O(n)**, sem reler o arquivo para cada registro;
- entrada via stream e backpressure no IPC;
- particionamento determinístico;
- índice em memória distribuído entre processos;
- limite de oito workers para evitar overhead excessivo.

## Execução

```sh
npm ci
npm start
```

## Testes e validação

```sh
npm run check
npm test
```

O dataset incluído contém nomes de Pokémon duplicados intencionalmente para tornar o exemplo reproduzível.

## Licença

[MIT](LICENSE)

</details>
