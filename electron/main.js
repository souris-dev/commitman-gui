const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const isDev = require('electron-is-dev');   
const path = require('path');
 
let mainWindow;
 
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        //titleBarStyle: "hidden",
        show: false,
        //frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
 
    mainWindow.loadURL(startURL);
 
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    ipcMain.handle('exit-app', (event, arg) => {
        mainWindow = null;
    });

    ipcMain.on('open-repo', async (event, args) => {
        console.log("Open a repo.");
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Open a repository',
            properties: ['openDirectory'],
        });

        if (result.canceled) {
            console.log(result.canceled);
            event.reply('open-repo-reply', undefined);
        }

        fs.readdir(result.filePaths[0],
            { withFileTypes: true },
            (err, files) => {
                var fileStruct = [];
                var isRepo = false;

                files.forEach(file => {
                    if (file.name === ".cm" && file.isDirectory()) {
                        isRepo = true;
                    }
                    fileStruct.push({
                        name: file.name,
                        isDir: file.isDirectory(),
                        isFile: file.isFile(),
                    });
                });

                event.reply('open-repo-reply', { validRepo: isRepo, files: fileStruct });
            }
        );
    });

    ipcMain.handle('get-dir-contents', async (event, args) => {

    });
}
app.on('ready', createWindow);