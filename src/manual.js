import logo from './logo.svg';
import './App.css';
import TitleBar from 'frameless-titlebar';
import { defaultTemplate } from './menus';

function ManualHome() {
  return (
    <div className="ExampleContainer">
        <TitleBar
          title="Commit Man"
          menu={defaultTemplate}
          theme={{
            barTheme: 'dark',
            barShowBorder: true,
            menuDimItems: false,
            showIconDarwin: false
          }}
          platform="win32"
          />
          <div className="App">
            <h1>Manual</h1>  
        </div>
    </div>
  );
}

export default ManualHome;
