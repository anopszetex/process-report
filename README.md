# process-report

Parallel CSV range processing with Node.js streams and child processes.

## Design

The parent process reads only the header and file metadata. It divides the data region into byte ranges, moves every boundary to the next newline, and assigns one exclusive range to each child process.

Each child opens the CSV itself, streams and parses only its assigned range, and returns partial name counts. The parent merges those counts to detect duplicates that may occur in different ranges.

This design provides:

- each data byte is read once by exactly one child process;
- parsing distributed across independent Node.js processes;
- ranges that never split a physical CSV record;
- partial results sent in bounded IPC batches;
- cross-range duplicate detection during the final merge;
- at most eight workers by default.

This example assumes one CSV record per physical line. CSV files containing quoted multiline fields require a format-aware partitioning strategy.

## Run and compare

```sh
npm ci
npm start
```

Set the process count explicitly with `WORKERS`:

```sh
WORKERS=4 npm start
npm run start:single
```

The command reports elapsed time so both modes can be compared in the same environment. Parallel processing is not automatically faster: for small files, process startup and IPC usually cost more than they save. The approach becomes useful when parsing or transforming sufficiently large ranges is the bottleneck.

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

Processamento paralelo de intervalos de um CSV usando streams e processos filhos do Node.js.

## Arquitetura

O processo principal lê apenas o cabeçalho e os metadados do arquivo. Ele divide a região de dados em intervalos de bytes, move cada limite até a próxima quebra de linha e atribui um intervalo exclusivo para cada processo filho.

Cada filho abre o CSV diretamente, lê e interpreta somente seu intervalo e retorna contagens parciais dos nomes. O processo principal combina essas contagens para encontrar duplicatas que podem estar em intervalos diferentes.

O desenho oferece:

- cada byte da região de dados é lido uma única vez por apenas um processo;
- parsing distribuído entre processos Node.js independentes;
- intervalos que não cortam registros físicos;
- resultados parciais enviados em lotes limitados via IPC;
- detecção de duplicatas entre intervalos na consolidação final;
- no máximo oito processos por padrão.

O exemplo pressupõe um registro CSV por linha física. Arquivos com campos entre aspas contendo múltiplas linhas exigem uma estratégia de particionamento que compreenda esse formato.

## Execução e comparação

```sh
npm ci
npm start
```

Defina explicitamente a quantidade de processos com `WORKERS`:

```sh
WORKERS=4 npm start
npm run start:single
```

O comando informa o tempo decorrido para comparar os modos no mesmo ambiente. Paralelismo não é automaticamente mais rápido: em arquivos pequenos, a criação dos processos e o IPC normalmente custam mais do que economizam. A abordagem se torna útil quando o parsing ou a transformação de intervalos grandes é o gargalo.

## Testes e validação

```sh
npm run check
npm test
```

O dataset incluído contém nomes de Pokémon duplicados intencionalmente para tornar o exemplo reproduzível.

## Licença

[MIT](LICENSE)

</details>
