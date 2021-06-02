import React from "react";
import { useHistory } from "react-router";
import './ManualPage.css';

function ManualPages() {
  let history = useHistory();

  return (
    <>
      <div className="parent-div-ht-full bg-gray-800">
        <div className="h-14 bg-gray-800 flex content-center items-center justify-between px-4 shadow-xl">
          <div className="text-white text-1xl font-light">
            Commands
            <button
              className="mx-3 my-4 transition duration-300 ease-in-out border-2 opacity-30 hover:opacity-80 text-red-500 border-red-600 hover:bg-red-500 rounded hover:text-white px-2 py-1 text-sm"
              onClick={() => {
                history.goBack();
              }}
            >
              Close
            </button>
          </div>
          <div>
            <table className="text-white">
              <tr>
                <th>Command</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>init</td>
                <td>
                  <pre>
                    Initialize Commit man in the current directory Usage : cm
                    init This will create a .cm folder in the current directory,
                    and a log file inside that folder.
                  </pre>
                </td>
              </tr>
              <tr>
                <td>reinit</td>
                <td>
                  <pre>
                    Reinitialize Commit man in the current directory Usage : cm
                    reinit This will reinitialize .cm folder in case of logfile
                    corruption or unavailability.
                  </pre>
                </td>
              </tr>
              <tr>
                <td>commit</td>
                <td>
                  <pre>
                    Commits curent version of working directory Usage : cm
                    commit [message]. This will create a new commit folder
                    insider the .cm folder.
                  </pre>
                </td>
              </tr>
              <tr>
                <td>revert</td>
                <td>
                  <pre>
                    Reverts to an old version of working directory Usage : cm
                    revert &lt; Commit_Number &gt; [-f | --force] This will
                    revert to an older version of the project and with the force
                    option revert will take place even if the latest code has
                    not been commited.
                  </pre>
                </td>
              </tr>
              <tr>
                <td>showlog</td>
                <td>
                  <pre>
                    Displays Log file in a tabular format on the Terminal.
                    Usage: cm showlog Queries data from the log file and adds
                    headers and spacing, then displays them to the terminal.
                  </pre>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManualPages;
