import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DATA_DIR = path.join(__dirname, '../../data-test-' + Date.now());
const TEST_LOGS_FILE = path.join(TEST_DATA_DIR, 'assistant-logs.jsonl');

class TestStorageRepository {
  constructor() {
    this.DATA_DIR = TEST_DATA_DIR;
    this.LOGS_FILE = TEST_LOGS_FILE;
  }

  validatePath(filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(this.DATA_DIR))) {
      throw new Error('Path traversal attempt detected');
    }
    return resolvedPath;
  }

  async write(entry) {
    try {
      const validPath = this.validatePath(this.LOGS_FILE);
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
      const validPath = this.validatePath(this.LOGS_FILE);
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
      const validPath = this.validatePath(this.LOGS_FILE);
      await fs.writeFile(validPath, '');
      return { message: 'Logs cleared successfully' };
    } catch (error) {
      console.error('Failed to clear logs:', error);
      throw new Error('Failed to clear logs');
    }
  }
}

describe('StorageRepository', () => {
  let repository;

  beforeAll(async () => {
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  beforeEach(async () => {
    await fs.writeFile(TEST_LOGS_FILE, '');
    repository = new TestStorageRepository();
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to clean up test directory:', error);
    }
  });

  describe('write', () => {
    test('should write a log entry to JSONL file', async () => {
      const entry = {
        id: '123',
        message: 'test message',
        timestamp: new Date().toISOString(),
      };

      await repository.write(entry);

      const content = await fs.readFile(TEST_LOGS_FILE, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(1);
      expect(JSON.parse(lines[0])).toEqual(entry);
    });

    test('should append multiple entries as separate lines', async () => {
      const entry1 = { id: '1', message: 'first' };
      const entry2 = { id: '2', message: 'second' };

      await repository.write(entry1);
      await repository.write(entry2);

      const content = await fs.readFile(TEST_LOGS_FILE, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0])).toEqual(entry1);
      expect(JSON.parse(lines[1])).toEqual(entry2);
    });
  });

  describe('readAll', () => {
    test('should return empty array for empty file', async () => {
      const result = await repository.readAll();
      expect(result).toEqual([]);
    });

    test('should read all entries from JSONL file', async () => {
      const entries = [
        { id: '1', message: 'first' },
        { id: '2', message: 'second' },
        { id: '3', message: 'third' },
      ];

      for (const entry of entries) {
        await fs.appendFile(TEST_LOGS_FILE, JSON.stringify(entry) + '\n');
      }

      const result = await repository.readAll();
      expect(result).toEqual(entries);
    });

    test('should skip invalid JSON lines', async () => {
      await fs.writeFile(
        TEST_LOGS_FILE,
        '{"id":"1","message":"valid"}\n' +
          'invalid json line\n' +
          '{"id":"2","message":"also valid"}\n'
      );

      const result = await repository.readAll();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', message: 'valid' });
      expect(result[1]).toEqual({ id: '2', message: 'also valid' });
    });
  });

  describe('list', () => {
    test('should return limited number of most recent entries', async () => {
      const entries = [];
      for (let i = 1; i <= 10; i++) {
        const entry = { id: String(i), message: `message ${i}` };
        entries.push(entry);
        await repository.write(entry);
      }

      const result = await repository.list(5);
      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('10');
      expect(result[4].id).toBe('6');
    });

    test('should use default limit of 50', async () => {
      for (let i = 1; i <= 60; i++) {
        await repository.write({ id: String(i), message: `msg ${i}` });
      }

      const result = await repository.list();
      expect(result).toHaveLength(50);
      expect(result[0].id).toBe('60');
      expect(result[49].id).toBe('11');
    });
  });

  describe('clear', () => {
    test('should clear all logs', async () => {
      await repository.write({ id: '1', message: 'test' });
      await repository.write({ id: '2', message: 'test2' });

      const before = await repository.readAll();
      expect(before).toHaveLength(2);

      const result = await repository.clear();
      expect(result.message).toBe('Logs cleared successfully');

      const after = await repository.readAll();
      expect(after).toEqual([]);
    });
  });

  describe('validatePath', () => {
    test('should allow paths within data directory', () => {
      const validPath = path.join(TEST_DATA_DIR, 'test.json');
      expect(() => repository.validatePath(validPath)).not.toThrow();
    });

    test('should prevent path traversal attempts', () => {
      const invalidPath = path.join(TEST_DATA_DIR, '../../../etc/passwd');
      expect(() => repository.validatePath(invalidPath)).toThrow('Path traversal attempt detected');
    });
  });
});
