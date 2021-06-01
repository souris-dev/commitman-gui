import React, { useState, Fragment } from "react";
import ReactDiffViewer from "react-diff-viewer";
import "./DiffEditorPage.css";

import { Transition } from "@headlessui/react";
import { useHistory } from "react-router";

import { Menu } from "@headlessui/react";
import { useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/solid";

const { ipcRenderer } = window.require("electron");

function VersionDropdown(props) {
  return (
    <div className="w-56 text-right">
      <Menu
        as="div"
        className="relative inline-block text-left z-50 flex-initial"
      >
        <div>
          <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            {props.versionNumber === -1
              ? "Current"
              : "v" + props.versionNumber.toString()}
            <ChevronDownIcon
              className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              {props.menuItemsRetriever().map((item) => (
                <Menu.Item>
                  {({ active }) => {
                    var clName =
                      "group flex rounded-md items-center w-full px-2 py-2 text-sm";
                    if (active) {
                      clName += " bg-purple-700 text-white";
                    } else {
                      clName += " text-gray-900";
                    }
                    return (
                      <button className={clName} onClick={item.onClick}>
                        {item.text}
                      </button>
                    );
                  }}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

export default function DiffEditorPage(props) {
  const [originalContent, setOriginalContent] = useState("");
  const [newContent, setNewContent] = useState("");
  const filePath = props.history.location.state.filePath;
  const fileName = props.history.location.state.fileName;
  const repoPath = props.history.location.state.repoPath;

  const [vOrig, setVOrig] = useState(props.history.location.state.vOrig);
  const [vNew, setVNew] = useState(props.history.location.state.vNew);
  const [commitHistory, setCommitHistory] = useState([]);

  let history = useHistory();

  useEffect(() => {
    ipcRenderer.send("get-file-contents", repoPath, filePath, vOrig, vNew);
    ipcRenderer.once("get-file-contents-reply", (event, fileVersions) => {
      setOriginalContent(fileVersions.originalContent);
      setNewContent(fileVersions.newContent);
    });

    ipcRenderer.send("get-commit-history", repoPath);
    ipcRenderer.once("get-commit-history-reply", (event, commitHistory: []) => {
      var commitHistoryVersions = commitHistory.map((item) => item.number);
      commitHistoryVersions = commitHistoryVersions.filter(
        (item) => item !== 0
      );
      setCommitHistory(commitHistoryVersions);
    });
  }, [repoPath, filePath, vOrig, vNew, originalContent, newContent]);

  return (
    <>
      <div className="parent-div-ht-full bg-gray-800">
        <div className="h-14 bg-gray-800 flex content-center items-center justify-between px-4 shadow-xl">
          <div className="text-white text-1xl font-light">
            {fileName}{" "}
            <button
              className="mx-3 my-4 transition duration-300 ease-in-out border-2 opacity-30 hover:opacity-80 text-red-500 border-red-600 hover:bg-red-500 rounded hover:text-white px-2 py-1 text-sm"
              onClick={() => {
                history.goBack();
              }}
            >
              Close
            </button>
          </div>
          
            <VersionDropdown
              versionNumber={vOrig}
              menuItemsRetriever={() => {
                var items = commitHistory.map((item) => ({
                  text: "v" + item,
                  onClick: () => setVOrig(item),
                }));
                items.push({ text: "Current", onClick: () => setVOrig(-1) });
                return items;
              }}
            />
            <VersionDropdown
              className="-translate-x-40"
              versionNumber={vNew}
              menuItemsRetriever={() => {
                var items = commitHistory.map((item) => ({
                  text: "v" + item,
                  onClick: () => setVNew(item),
                }));
                items.push({ text: "Current", onClick: () => setVNew(-1) });
                return items;
              }}
            />
          
        </div>
        <ReactDiffViewer
          showDiffOnly={false}
          oldValue={originalContent}
          newValue={newContent}
          splitView={true}
          useDarkTheme={true}
        />
      </div>
    </>
  );
}

/*
<ReactDiffViewer
          oldValue={originalContent}
          newValue={newContent}
          splitView={true}
          useDarkTheme={true}
        />
        */