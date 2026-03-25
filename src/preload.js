const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loadData: () => ipcRenderer.invoke("load-data"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  exportJiraCsv: (csv) => ipcRenderer.invoke("export-jira-csv", csv),
  importJiraCsv: () => ipcRenderer.invoke("import-jira-csv"),
  exportBomJson: (json) => ipcRenderer.invoke("export-bom-json", json),
  importBomJson: () => ipcRenderer.invoke("import-bom-json"),
  importExcel: () => ipcRenderer.invoke("import-excel"),
  exportExcel: (data) => ipcRenderer.invoke("export-excel", data),
});
