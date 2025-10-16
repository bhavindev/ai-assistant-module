import fs from "fs-extra";

const LOG_FILE = "./data/logs.json";
fs.ensureFileSync(LOG_FILE);

export const logRepository = {
  async readAll() {
    return (await fs.readJson(LOG_FILE).catch(() => [])) || [];
  },

  async writeAll(logs) {
    await fs.writeJson(LOG_FILE, logs, { spaces: 2 });
  },

  async addLog(entry) {
    const logs = await this.readAll();
    logs.push(entry);
    await this.writeAll(logs);
  },

  async clearAll() {
    await fs.writeJson(LOG_FILE, [], { spaces: 2 });
  }
};
