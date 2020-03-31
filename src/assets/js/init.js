const { ipcRenderer } = require('electron');
const { dialog, shell, app } = require('electron').remote;
const path = require('path');
const SHAPI = require( path.resolve(__dirname, './assets/js/api.js') );
const fs = require('fs');
const rimraf = require('rimraf');
const ncp = require('ncp');
const http = require('http');
const unzipper = require('unzipper');

let api = new SHAPI();