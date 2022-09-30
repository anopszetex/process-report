# process-report

Using `child processes` with `streams` to report a massive amount of data and **check registers replicated**

## :mortar_board: Project Setup
- [Node.js v16.17.0+](https://nodejs.org/en/download/)
- [NPM 8.15.0+](https://docs.npmjs.com/cli/v8/commands/npm-install)

### Clone the repository
```bash
git clone git@github.com:anopszetex/process-report.git
```
### Build Setup
```bash
npm install
```
### Compile
```bash
npm start
```

You should see results similar to:
```sh
$ node src/index.js
starting with 30 processes
Charmeleon is replicated
process 21871 exited
process 21891 exited
process 21864 exited
process 21845 exited
process 21852 exited
process 21846 exited
process 21963 exited
process 22036 exited
process 21857 exited
Calyrex Shadow Rider is replicated
process 21928 exited
process 21883 exited
process 22086 exited
process 21995 exited
process 21990 exited
process 22033 exited
process 21877 exited
process 22016 exited
process 21969 exited
process 21979 exited
process 22127 exited
process 21911 exited
process 21992 exited
process 21898 exited
process 21991 exited
process 21870 exited
process 21946 exited
process 22013 exited
process 22109 exited
process 22069 exited
process 22125 exited
Done in 9.06s.
```
