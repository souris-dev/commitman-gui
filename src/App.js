import logo from './logo.svg';
import './App.css';
import TitleBar from 'frameless-titlebar';
import { defaultTemplate } from './menus';

function App() {
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
                  
        <p>
                      Start by Opening a Repo!
        </p>
        <br />
        <a
          className="App-link"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
                      Open A Repo
        </a>
                  <p> or, </p>
        <a
          className="App-link"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the manual
        </a>
      </header>
    </div>

    </div>
  );
}

export default App;
