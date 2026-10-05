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

Processamento paralelo de grandes volumes de dados usando **Node.js child processes** e **streams**.

O projeto lê um CSV com registros, distribui o trabalho entre vários processos filhos e identifica registros replicados no dataset.

## Problema

Quando precisamos processar um arquivo grande e verificar a existência de duplicatas, fazer tudo em um único processo pode:

- saturar o event loop;
- consumir muita memória ao carregar o arquivo inteiro;
- tornar o processamento lento.

## Solução

O arquivo é consumido como uma **stream** no processo principal. Cada linha é enviada para um dos processos filhos usando um algoritmo **round-robin**. Cada filho:

- lê o mesmo dataset via stream;
- verifica se o registro recebido aparece mais de uma vez;
- reporta de volta ao processo principal quando encontra uma replicação.

Isso permite usar todos os cores disponíveis sem carregar o arquivo inteiro na memória.

## Tecnologias

- `node:child_process` — criação e comunicação entre processos.
- `node:stream` e `stream/promises` — processamento eficiente de grandes arquivos.
- `csvtojson` — transformação de CSV em objetos JSON via stream.

## Como rodar

### Instalar dependências

```sh
npm install
```

### Executar

```sh
npm start
```

Você verá uma saída semelhante a:

```sh
starting with 30 processes
Charmeleon is replicated
process 21871 exited
process 21891 exited
...
Done in 9.06s
```

## O que demonstra

- Uso de **fork** para paralelizar trabalho CPU-bound.
- Comunicação entre processos via **IPC** (`process.send` / `process.on('message')`).
- Processamento de arquivos grandes com **backpressure** natural das streams.
- Distribuição de carga com round-robin.

## Licença

[MIT](LICENSE)

</details>
