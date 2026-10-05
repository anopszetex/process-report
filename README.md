# process-report

<details>
<summary><strong>🇧🇷 Ver documentação em Português (Brasil)</strong></summary>

# process-report

Experimento de processamento de registros CSV com múltiplos processos filhos do Node.js.

## Como funciona

O processo principal lê o CSV de Pokémon como stream e distribui os registros entre 30 processos filhos usando round-robin.

Para cada registro recebido, um processo filho abre o CSV, percorre o arquivo como stream e informa se o nome do Pokémon aparece mais de uma vez. O processo principal consolida as mensagens e exibe cada nome duplicado uma única vez.

O projeto explora o uso de:

- `node:child_process` e `fork`;
- IPC entre o processo principal e os filhos;
- streams e pipelines do Node.js;
- distribuição de trabalho com round-robin;
- processamento de CSV sem carregar o arquivo inteiro na memória.

Esta é uma implementação experimental. Usar vários processos não garante maior desempenho, e esta versão favorece uma demonstração direta de child processes em vez de um algoritmo otimizado para detecção de duplicatas.

## Execução

```sh
npm ci
npm start
```

A saída esperada contém a quantidade de processos, os nomes duplicados e as mensagens de encerramento dos workers.

## Validar sintaxe

```sh
npm run check
```

## Licença

[MIT](LICENSE)

</details>

---

An experiment with processing CSV records through multiple Node.js child processes.

## How it works

The main process reads the Pokémon CSV as a stream and distributes records among 30 child processes using round-robin scheduling.

For every record it receives, a child process opens the CSV, scans it as a stream, and reports whether the Pokémon name occurs more than once. The parent process consolidates the messages and prints each duplicated name once.

The project explores the use of:

- `node:child_process` and `fork`;
- IPC between parent and child processes;
- Node.js streams and pipelines;
- round-robin work distribution;
- CSV processing without loading the complete file into memory.

This is an experimental implementation. Multiple processes do not guarantee better performance, and this version intentionally favors a direct demonstration of child processes over an optimized duplicate-detection algorithm.

## Run

```sh
npm ci
npm start
```

Expected output includes the process count, duplicated names, and worker termination messages.

## Validate syntax

```sh
npm run check
```

## License

[MIT](LICENSE)
