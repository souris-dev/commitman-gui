//import { ipcRenderer, shell } from 'electron';
const { ipcRenderer } = window.require('electron');

export const menus = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open Repo',
                click: (item, win, e) => {
                    ipcRenderer.send('open-repo');
                }
            },
            {
                label: 'Exit',
                click: (item, win, e) => {
                    ipcRenderer.invoke('exit-app');
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