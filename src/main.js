const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

let DATA_DIR, DATA_FILE;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ systems: [], revisions: [] }, null, 2));
  }
}

function loadData() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
  catch { return { systems: [], revisions: [] }; }
}

function saveData(data) {
  ensureDataDir();
  // Auto-backup: keep last 5 backups
  if (data._backup) {
    delete data._backup;
    const backupDir = path.join(DATA_DIR, "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupFile = path.join(backupDir, `bom-backup-${ts}.json`);
    try {
      // Copy current data as backup
      if (fs.existsSync(DATA_FILE)) {
        fs.copyFileSync(DATA_FILE, backupFile);
      }
      // Clean old backups, keep last 5
      const backups = fs.readdirSync(backupDir).filter(f => f.startsWith("bom-backup-")).sort().reverse();
      backups.slice(5).forEach(f => { try { fs.unlinkSync(path.join(backupDir, f)); } catch(e) {} });
    } catch(e) {}
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 860, minWidth: 1000, minHeight: 650,
    title: "BOM Manager v2.0",
    backgroundColor: "#0a0a0d",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  DATA_DIR = path.join(app.getPath("userData"), "bom-data");
  DATA_FILE = path.join(DATA_DIR, "bom-database.json");
  createWindow();
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── IPC ───
ipcMain.handle("load-data", () => loadData());
ipcMain.handle("save-data", (_, data) => { saveData(data); return true; });

ipcMain.handle("export-jira-csv", async (_, csvContent) => {
  const r = await dialog.showSaveDialog(mainWindow, {
    title: "Jira CSV Dışa Aktar",
    defaultPath: `bom-jira-${Date.now()}.csv`,
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });
  if (!r.canceled && r.filePath) { fs.writeFileSync(r.filePath, "\uFEFF" + csvContent, "utf-8"); return r.filePath; }
  return null;
});

ipcMain.handle("import-jira-csv", async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title: "Jira CSV İçe Aktar",
    filters: [{ name: "CSV", extensions: ["csv"] }],
    properties: ["openFile"],
  });
  if (!r.canceled && r.filePaths.length > 0) return fs.readFileSync(r.filePaths[0], "utf-8");
  return null;
});

ipcMain.handle("export-bom-json", async (_, jsonContent) => {
  const r = await dialog.showSaveDialog(mainWindow, {
    title: "BOM JSON Kaydet",
    defaultPath: `bom-backup-${Date.now()}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!r.canceled && r.filePath) { fs.writeFileSync(r.filePath, jsonContent, "utf-8"); return r.filePath; }
  return null;
});

ipcMain.handle("import-bom-json", async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title: "BOM JSON Yükle",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });
  if (!r.canceled && r.filePaths.length > 0) return fs.readFileSync(r.filePaths[0], "utf-8");
  return null;
});

// ─── EXCEL IMPORT ───
ipcMain.handle("import-excel", async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title: "Excel BOM Dosyası Seç",
    filters: [{ name: "Excel", extensions: ["xlsx", "xls", "xlsm"] }],
    properties: ["openFile"],
  });
  if (r.canceled || !r.filePaths.length) return null;

  try {
    const wb = XLSX.readFile(r.filePaths[0]);
    const sheets = wb.SheetNames.map(name => {
      const ws = wb.Sheets[name];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      return { name, data };
    });
    return { filePath: r.filePaths[0], sheets };
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle("export-excel", async (_, { sheetData, fileName }) => {
  const r = await dialog.showSaveDialog(mainWindow, {
    title: "Excel Olarak Kaydet",
    defaultPath: fileName || `bom-export-${Date.now()}.xlsx`,
    filters: [{ name: "Excel", extensions: ["xlsx"] }],
  });
  if (r.canceled || !r.filePath) return null;

  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "BOM");
    XLSX.writeFile(wb, r.filePath);
    return r.filePath;
  } catch (e) {
    return null;
  }
});
