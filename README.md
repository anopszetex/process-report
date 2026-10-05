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
