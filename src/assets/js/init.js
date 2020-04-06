const { ipcRenderer } = require('electron');
const { dialog, shell, app, clipboard, process } = require('electron').remote;
const isDev = require('electron-is-dev');
const path = require('path');
const SSAPI = require( path.resolve(__dirname, './assets/js/module.api.js') );
const SRXD = require( path.resolve(__dirname, './assets/js/module.srxd.js') );
const UserSettings = require( path.resolve(__dirname, './assets/js/module.usersettings.js') );
const Locale = require( path.resolve(__dirname, './assets/js/module.locale.js') );
const fs = require('fs');
const ncp = require('ncp');
const http = require('http');

let systemOS = process.platform;
let tempDirLocation = app.getPath('temp');

let api = new SSAPI();
let srxdControl = new SRXD();

// TODO: Mac/Linux Support
function detectGameDirectory() {
    if(process.platform == "win32") {
        return path.join(app.getPath("userData"), "../..", "LocalLow", "Super Spin Digital", "Spin Rhythm XD", "Custom");
    } else {
        console.error("Unsupported system");
    }
}

// Initialize User Settings
let userSettings = new UserSettings({
    defaults: {
        showExplicit: false,
        gameDirectory: detectGameDirectory(),
        language: app.getLocale()
    }
});

// Initialize Locale
let locale = new Locale(userSettings.get('language'));
const DOMLocaleElements = document.querySelectorAll("*[locale]");
DOMLocaleElements.forEach(function(localeElement) {
    localeElement.innerHTML = locale.get(localeElement.innerHTML);
});
const DOMLocalePlaceholderElements = document.querySelectorAll("*[localePlaceholder]");
DOMLocalePlaceholderElements.forEach(function(localePlaceholderElement) {
    localePlaceholderElement.placeholder = locale.get(localePlaceholderElement.placeholder);
});