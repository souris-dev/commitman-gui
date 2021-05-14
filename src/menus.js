//import { ipcRenderer, shell } from 'electron';
const electron = window.require('electron');

export const defaultTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open Repo',
            },
            {
                label: 'Exit',
                click: (item, win, e) => {
                    if (electron.remote)
                        electron.remote.getCurrentWindow().close();
                }
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Manual'
            },
            {
                label: 'About'
            }
        ]
    }
];