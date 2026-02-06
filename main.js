const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

let mainWindow;
let splash;

function createWindow() {
  // ---------------- SPLASH SCREEN ----------------
  splash = new BrowserWindow({
    width: 520,
    height: 320,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: false,
    focusable: false,
  });

  splash.loadFile("splash.html");

  // ---------------- MAIN WINDOW ----------------
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    frame: true,
    backgroundColor: "#000000",
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      contextIsolation: true,
      devTools: false,
    },
  });

  mainWindow.loadURL("https://spaceborn.in/");

  // ---------------- EXTERNAL LINK HANDLING ----------------

  // 1) Handle links opened with target="_blank"
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://spaceborn.in")) {
      return { action: "allow" };
    } else {
      shell.openExternal(url);
      return { action: "deny" };
    }
  });

  // 2) Handle normal navigation
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("https://spaceborn.in")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Smooth splash → app transition
  mainWindow.once("ready-to-show", () => {
    splash.webContents.executeJavaScript(`
      document.body.classList.add("fade-out");
    `);

    setTimeout(() => {
      splash.destroy();
      mainWindow.show();
    }, 600);
  });

  // Fallback safety (slow internet)
  setTimeout(() => {
    if (!mainWindow.isVisible()) {
      splash.destroy();
      mainWindow.show();
    }
  }, 6000);

  // ---------------- MENU ----------------
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Spaceborn",
        submenu: [
          {
            label: "About",
            click: () => shell.openExternal("https://spaceborn.in/about"),
          },
          { type: "separator" },
          { role: "quit" },
        ],
      },
      { role: "windowMenu" },
    ])
  );
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});