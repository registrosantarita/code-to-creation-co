const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

const APP_URL = "https://code-to-creation-co.lovable.app";

function nav(win) {
  return win.webContents.navigationHistory;
}

function childMenu(child) {
  return Menu.buildFromTemplate([
    {
      label: "Navegar",
      submenu: [
        {
          label: "Voltar",
          accelerator: "Alt+Left",
          click: () => nav(child).canGoBack() && nav(child).goBack(),
        },
        {
          label: "Avançar",
          accelerator: "Alt+Right",
          click: () => nav(child).canGoForward() && nav(child).goForward(),
        },
        { role: "reload", label: "Recarregar" },
        { type: "separator" },
        { label: "Cancelar e fechar", accelerator: "Esc", click: () => child.close() },
      ],
    },
  ]);
}

function createWindow() {

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#0B0B0C",
    title: "Conferência Registral",
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(APP_URL);

  // Links externos abrem no navegador padrão; OAuth abre em janela filha.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_URL) || url.includes("lovable.app") || url.includes("supabase.co")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 560,
          height: 760,
          autoHideMenuBar: false,
        },
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Janelas de login (Google/Apple) ganham menu próprio com "Voltar".
  win.webContents.on("did-create-window", (child) => {
    child.setMenu(childMenu(child));
    child.webContents.on("before-input-event", (event, input) => {
      if (input.type !== "keyDown") return;
      const back = input.key === "Backspace" || (input.alt && input.key === "ArrowLeft");
      const forward = input.alt && input.key === "ArrowRight";
      if (back && child.webContents.navigationHistory.canGoBack()) {
        child.webContents.navigationHistory.goBack();
        event.preventDefault();
      } else if (forward && child.webContents.navigationHistory.canGoForward()) {
        child.webContents.navigationHistory.goForward();
        event.preventDefault();
      }
    });
  });


  win.webContents.on("did-fail-load", (_e, _code, description) => {
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          `<body style="background:#0B0B0C;color:#F5F2EA;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center">
            <div><h1 style="color:#C9A44C">Sem conexão</h1>
            <p>Não foi possível carregar o sistema.<br/>Verifique sua internet e reabra o aplicativo.</p>
            <p style="opacity:.6;font-size:12px">${description}</p></div>
          </body>`,
        ),
    );
  });
}

const menu = Menu.buildFromTemplate([
  {
    label: "Arquivo",
    submenu: [{ role: "reload", label: "Recarregar" }, { type: "separator" }, { role: "quit", label: "Sair" }],
  },
  {
    label: "Editar",
    submenu: [
      { role: "undo", label: "Desfazer" },
      { role: "redo", label: "Refazer" },
      { type: "separator" },
      { role: "cut", label: "Recortar" },
      { role: "copy", label: "Copiar" },
      { role: "paste", label: "Colar" },
      { role: "selectAll", label: "Selecionar tudo" },
    ],
  },
  {
    label: "Navegar",
    submenu: [
      {
        label: "Voltar",
        accelerator: "Alt+Left",
        click: (_i, win) => win && nav(win).canGoBack() && nav(win).goBack(),
      },
      {
        label: "Avançar",
        accelerator: "Alt+Right",
        click: (_i, win) => win && nav(win).canGoForward() && nav(win).goForward(),
      },
      { type: "separator" },
      {
        label: "Início",
        accelerator: "Alt+Home",
        click: (_i, win) => win && win.loadURL(APP_URL),
      },
    ],
  },
  {
    label: "Exibir",
    submenu: [
      { role: "zoomIn", label: "Ampliar" },
      { role: "zoomOut", label: "Reduzir" },
      { role: "resetZoom", label: "Zoom padrão" },
      { role: "togglefullscreen", label: "Tela cheia" },
    ],
  },
]);

app.whenReady().then(() => {
  Menu.setApplicationMenu(menu);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

void path;
