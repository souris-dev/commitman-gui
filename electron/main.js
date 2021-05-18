const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const isDev = require('electron-is-dev');   
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { loader } = require("@monaco-editor/react");
 
let mainWindow;

function ensureFirstBackSlash(str) {
    return str.length > 0 && str.charAt(0) !== "/"
        ? "/" + str
        : str;
}

function uriFromPath(_path) {
    const pathName = path.resolve(_path).replace(/\\/g, "/");
    return encodeURI("file://" + ensureFirstBackSlash(pathName));
}

loader.config({
    paths: {
        vs: path.join(__dirname, "../node_modules/monaco-editor/min/vs")

}});

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
                        filePath: path.join(result.filePaths[0], file.name)
                    });
                });

                event.reply('open-repo-reply', {
                    validRepo: isRepo,
                    files: fileStruct,
                    repoName: path.basename(result.filePaths[0]),
                    repoPath: result.filePaths[0]
                });
            }
        );
    });

    ipcMain.handle('get-dir-contents', async (event, pathOfDir) => {
        fs.readdir(pathOfDir,
            { withFileTypes: true },
            (err, files) => {
                var fileStruct = [];
                files.forEach(file => {
                    fileStruct.push({
                        name: file.name,
                        isDir: file.isDirectory(),
                        isFile: file.isFile(),
                        filePath: path.join(pathOfDir, file.name)
                    });
                });

                event.reply('get-dir-contents-reply', {
                    files: fileStruct,
                    pathOfFolder: pathOfDir,
                    pathOfParentFolder: path.dirname(pathOfDir)
                });
            }
        );
    });

    ipcMain.on('get-commit-history', async (event, repoPath) => {
        const logdb = await open({
            filename: path.join(repoPath, '.cm', 'log.db'),
            driver: sqlite3.Database,
        });

        const result = await logdb.all('SELECT number, message, dtime from log');
        await logdb.close();
        event.reply('get-commit-history-reply', result);
    });

    ipcMain.on('get-file-contents', async (event, repoPath, filePath, vOrig, vNew) => {
        var pathDiff = path.relative(repoPath, filePath);
        var oldVersionPath = filePath;
        var newVersionPath = filePath;

        var oldFileContents = "";
        var newFileContents = "";

        if (vOrig !== -1) {
            oldVersionPath = path.join(repoPath, '.cm', 'v' + vOrig, pathDiff);
        }
        if (vNew !== -1) {
            newVersionPath = path.join(repoPath, '.cm', 'v' + vNew, pathDiff);
        }

        fs.readFile(oldVersionPath, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            oldFileContents = data.toString();

            fs.readFile(newVersionPath, (erro, dataNew) => {
                if (erro) {
                    console.log(err);
                    return;
                }
                newFileContents = dataNew.toString();

                event.reply("get-file-contents-reply", {
                    originalContent: oldFileContents,
                    newContent: newFileContents,
                });
            })
        })
    });
}
app.on('ready', createWindow);