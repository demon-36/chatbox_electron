const electron = require('electron');
const path = require('path');
const url = require('url');
const {app, BrowserWindow, Menu, ipcMain} = electron;
const { webContents } = require('electron')

let mainWin;
let logWin;

function createMainWindow(){
    mainWin = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWin.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWin.on('closed', () => {
        app.quit();
    })
}

ipcMain.on("start-gc", (e, arg) => {
    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, 'subWin.html'),
        protocol: 'file:',
        slashes: true
    }))
})

ipcMain.on("user:login", (e, user) => {
    createLogWindow();
    logWin.webContents.on('did-finish-load', () => {
        logWin.webContents.send("logged-in", user);
    });
});

ipcMain.on("message:received", (e, message, user) => {
    mainWin.webContents.send("message:show", message, user);
})

ipcMain.on("message:typing", (e, user) => {
    let winArr = webContents.getAllWebContents();
    for (let wina of winArr){
        wina.webContents.send("message:typingbyuser", user);
    }
})

function createLogWindow(){
    logWin = new BrowserWindow({
        width: 400, 
        height: 300,
        webPreferences: {
            nodeIntegration: true
        }
    });
    logWin.loadURL(url.format({
        pathname: path.join(__dirname, 'logWin.html'),
        protocol: 'file:',
        slashes: true
    }));
    logWin.on('close', () => {
        logWin = null;
    })
}

app.on('ready', () => {
    createMainWindow();
});