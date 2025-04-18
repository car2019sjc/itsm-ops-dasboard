import { createBackup } from './backup.js';

console.log('Iniciando script de backup...');

createBackup()
  .then(result => {
    console.log('Backup criado com sucesso!');
    console.log(`Arquivo: ${result.file}`);
    console.log(`Tamanho: ${result.size} MB`);
    console.log(`Versão: ${result.version}`);
  })
  .catch(error => {
    console.error('Erro ao criar backup:', error);
    process.exit(1);
  }); 