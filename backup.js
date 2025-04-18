import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import AdmZip from 'adm-zip';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get the next version number
function getNextVersion(backupDir) {
  const files = fs.readdirSync(backupDir);
  let maxVersion = 0;

  files.forEach(file => {
    const match = file.match(/v(\d+)/);
    if (match) {
      const version = parseInt(match[1], 10);
      maxVersion = Math.max(maxVersion, version);
    }
  });

  return maxVersion + 1;
}

// Function to create backup
export async function createBackup() {
  console.log('Iniciando processo de backup...');
  const backupDir = path.join(__dirname, 'backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    console.log('Criando diretório de backups...');
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get next version number
  const version = getNextVersion(backupDir);
  console.log(`Versão do backup: ${version}`);
  
  // Get current timestamp for the backup file name
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, ''); // Remove milliseconds

  const backupFile = path.join(backupDir, `backup-v${version}-${timestamp}.zip`);
  console.log(`Arquivo de backup será criado em: ${backupFile}`);

  return new Promise((resolve, reject) => {
    // Create a write stream for the backup file
    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Listen for archive events
    output.on('close', () => {
      console.log(`Backup concluído! Tamanho: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve({
        file: backupFile,
        size: (archive.pointer() / 1024 / 1024).toFixed(2),
        version
      });
    });

    archive.on('error', (err) => {
      console.error('Erro durante o backup:', err);
      reject(err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Aviso:', err);
      } else {
        reject(err);
      }
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Files and directories to backup
    const filesToBackup = [
      'src',
      'public',
      'scripts',
      'index.html',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      'eslint.config.js',
      '.env.example',
      '.env.development',
      '.env.production',
      'api-documentation.md',
      'database-schema.md',
      'deployment-guide.md',
      'documentation.md',
      'project-documentation.md',
      'user-guide.md',
      'netlify.toml'
    ];

    // Add files to the archive with validation
    filesToBackup.forEach(item => {
      const itemPath = path.join(__dirname, item);
      
      if (fs.existsSync(itemPath)) {
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Add directory and its contents
          archive.directory(itemPath, item);
        } else {
          // Validate file before adding
          if (stats.size > 0) {
            archive.file(itemPath, { name: item });
          } else {
            console.warn(`Warning: Skipping empty file ${item}`);
          }
        }
      }
    });

    // Finalize the archive
    archive.finalize();
  });
}

// Function to create backup using AdmZip
export async function createBackupAdmZip() {
  console.log('Iniciando backup usando AdmZip...');
  const backupDir = path.join(__dirname, 'backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    console.log('Criando diretório de backups...');
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get next version number
  const version = getNextVersion(backupDir);
  console.log(`Versão do backup: ${version}`);
  
  // Get current timestamp for the backup file name
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, ''); // Remove milliseconds

  const backupFile = path.join(backupDir, `backup-v${version}-${timestamp}.zip`);
  console.log(`Arquivo de backup será criado em: ${backupFile}`);

  try {
    const zip = new AdmZip();

    // Files and directories to backup
    const itemsToBackup = [
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

    // Add each item to the zip file
    itemsToBackup.forEach(item => {
      const itemPath = path.join(__dirname, item);
      if (fs.existsSync(itemPath)) {
        if (fs.lstatSync(itemPath).isDirectory()) {
          zip.addLocalFolder(itemPath, item);
        } else {
          zip.addLocalFile(itemPath);
        }
      }
    });

    // Save the zip file
    zip.writeZip(backupFile);
    console.log(`Backup criado com sucesso: ${backupFile}`);
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    process.exit(1);
  }
}