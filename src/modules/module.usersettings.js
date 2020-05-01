const { electron, remote } = require('electron');
const app = remote.app;
const path = require('path');
const fs = require('fs');

class UserSettings {
  constructor() {
    let defaults = {
      showExplicit: false,
      gameDirectory: this.detectGameDirectory(),
      language: app.getLocale()
    };

    const userDataPath = app.getPath('userData');
    this.path = path.join(userDataPath, 'UserSettings.json');
    this.data = parseDataFile(this.path, defaults);
  }
  
  get(key) {
    return this.data[key];
  }
  
  set(key, val) {
    this.data[key] = val;
    this.write();
  }

  clear(key) {
    this.data[key] = null;
    this.write();
  }

  write() {
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  // TODO: Mac/Linux Support
  detectGameDirectory() {
    if(process.platform == "win32") {
        return path.join(app.getPath("userData"), "../..", "LocalLow", "Super Spin Digital", "Spin Rhythm XD", "Custom");
    }
    if(process.platform == "linux"){
      const homedir = require('os').homedir();
      return path.join(homedir, ".local", "share", "Steam", "steamapps", "compatdata", "1058830", "pfx", "drive_c", "users", "steamuser", "AppData", "LocalLow", "Super Spin Digital", "Spin Rhythm XD", "Custom");
    }
    else {
        console.error("Unsupported system");
    }
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    return defaults;
  }
}

module.exports = UserSettings;