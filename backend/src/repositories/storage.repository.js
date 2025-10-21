import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const LOGS_FILE = path.join(DATA_DIR, 'assistant-logs.jsonl');

export class StorageRepository {
  constructor() {
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      try {
        await fs.access(LOGS_FILE);
      } catch {
        await fs.writeFile(LOGS_FILE, '');
      }
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }

  validatePath(filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(DATA_DIR))) {
      throw new Error('Path traversal attempt detected');
    }
    return resolvedPath;
  }

  async write(entry) {
    try {
      const validPath = this.validatePath(LOGS_FILE);
      const line = JSON.stringify(entry) + '\n';
      await fs.appendFile(validPath, line, 'utf8');
      return entry;
    } catch (error) {
      console.error('Failed to write log entry:', error);
      throw new Error('Failed to save log entry');
    }
  }

  async readAll() {
    try {
      const validPath = this.validatePath(LOGS_FILE);
      const content = await fs.readFile(validPath, 'utf8');

      if (!content.trim()) {
        return [];
      }

      const lines = content.trim().split('\n');
      const entries = [];

      for (const line of lines) {
        if (line.trim()) {
          try {
            entries.push(JSON.parse(line));
          } catch (parseError) {
            console.warn('Skipping invalid JSON line:', parseError);
          }
        }
      }

      return entries;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Failed to read logs:', error);
      throw new Error('Failed to read logs');
    }
  }

  async list(limit = 50) {
    const allLogs = await this.readAll();
    return allLogs.slice(-limit).reverse();
  }

  async clear() {
    try {
      const validPath = this.validatePath(LOGS_FILE);
      await fs.writeFile(validPath, '');
      return { message: 'Logs cleared successfully' };
    } catch (error) {
      console.error('Failed to clear logs:', error);
      throw new Error('Failed to clear logs');
    }
  }

  async getInfo() {
    try {
      const validPath = this.validatePath(LOGS_FILE);
      const stats = await fs.stat(validPath);
      const logs = await this.readAll();

      return {
        filePath: LOGS_FILE,
        size: stats.size,
        entryCount: logs.length,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      throw new Error('Failed to get storage info');
    }
  }
}

export const storageRepository = new StorageRepository();
