import TitleBar from 'frameless-titlebar';
import { menus } from '../menus';

export default function MenuBar() {
    return <TitleBar
        title="Commit Man"
        menu={menus}
        theme={{
            barTheme: 'dark',
            barShowBorder: true,
            menuDimItems: false,
            showIconDarwin: false
        }}
        platform="win32"
    />;
}