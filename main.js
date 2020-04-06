const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const { download } = require('electron-dl');
const isDev = require('electron-is-dev');

let win;
let deeplinkingUrl;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    executeDeeplink(commandLine);
  });
}

function executeDeeplink(commandLine) {
  if (process.platform == 'win32') {
    let commandLineString = commandLine.slice(1) + '';
    let commandLineArgs = commandLineString.split(",");
    deeplinkingUrl = commandLineArgs[commandLineArgs.length - 1].replace("spinshare-song://", "").replace("/", "");
  }

  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
    win.webContents.executeJavaScript(`NavigateToSongDetail("${deeplinkingUrl}")`);
  }
}

function createWindow () {
  win = new BrowserWindow({
    title: "SpinSha.re",
    width: 1300,
    height: 700,
    minHeight: 700,
    minWidth: 1300,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('./src/app.htm');

  if(isDev) {
    win.webContents.openDevTools();
  }
  win.setMenuBarVisibility(false);

  if (process.platform == 'win32') {
    deeplinkingUrl = process.argv.slice(1);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on('open-url', function (event, url) {
  event.preventDefault();
  deeplinkingUrl = url;
});

const PROTOCOL_PREFIX_SONG = "spinshare-song";
app.setAsDefaultProtocolClient(PROTOCOL_PREFIX_SONG);

ipcMain.on("download", (event, info) => {
  console.log("Download Request Received");
  download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
      .then(dl => win.webContents.send("download-complete", dl.getSavePath()));
});