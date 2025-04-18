import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório onde os backups estão armazenados
const backupDir = path.join(__dirname, 'backups');

// Nome do backup específico que queremos restaurar
const targetBackup = 'backup-v1-2025-04-18T16-28-21.zip';
const backupPath = path.join(backupDir, targetBackup);

// Verifica se o diretório de backups existe
if (!fs.existsSync(backupDir)) {
  console.error('Diretório de backups não encontrado!');
  process.exit(1);
}

// Verifica se o arquivo de backup específico existe
if (!fs.existsSync(backupPath)) {
  console.error(`Backup específico não encontrado: ${targetBackup}`);
  process.exit(1);
}

console.log(`Restaurando backup específico: ${targetBackup}`);

try {
  const zip = new AdmZip(backupPath);
  
  // Lista de arquivos/diretórios a serem excluídos antes da restauração
  const itemsToDelete = [
    'src',
    'public',
    'scripts',
    'index.html',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    '.env',
    '.env.example'
  ];

  // Remove os arquivos/diretórios existentes
  itemsToDelete.forEach(item => {
    const itemPath = path.join(__dirname, item);
    if (fs.existsSync(itemPath)) {
      if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(itemPath);
      }
    }
  });

  // Extrai o backup
  zip.extractAllTo(__dirname, true);
  console.log('Backup restaurado com sucesso!');
  console.log('Execute "npm install" para reinstalar as dependências.');
} catch (error) {
  console.error('Erro ao restaurar backup:', error);
  process.exit(1);
} 