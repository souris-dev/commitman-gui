import React from "react";
import { useState, useRef, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";
import "./FileBrowsePage.css";

import { Scrollbars } from "react-custom-scrollbars-2";

import Popover from "@material-tailwind/react/Popover";
import PopoverContainer from "@material-tailwind/react/PopoverContainer";
import PopoverHeader from "@material-tailwind/react/PopoverHeader";
import PopoverBody from "@material-tailwind/react/PopoverBody";

import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { Fragment } from "react";
const { ipcRenderer } = window.require("electron");

export default function FileBrowserPage(props) {
  const repo = props.history.location.state.repo;
  const repoName = repo.repoName;

  const [currentFolder, setCurrentFolder] = useState({
    files: repo.files,
    pathOfFolder: repo.repoPath,
    pathOfParentFolder: "",
  });

  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const [clickedFilePath, setClickedFilePath] = useState("");
  const [clickedFileName, setClickedFileName] = useState("");

  const [compareFromVersion, setCompareFromVersion] = useState(-1);
  const [compareToVersion, setCompareToVersion] = useState(-1);
  const [commitHistory, setCommitHistory] = useState([]);

  const [totalCommitHistory, setTotalCommitHistory] = useState([]);
  const [totalCommitHistoryDialogShow, setTotalCommitHistoryDialogShow] =
    useState(false);

  const [repoInfoDialogShowing, setRepoInfoDialogShowing] = useState(false);

  const [redirectTo, setRedirectTo] = useState(null);

  const history = useHistory();

  useEffect(() => {
    ipcRenderer.send("get-commit-history", repo.repoPath);
    ipcRenderer.once("get-commit-history-reply", (event, args) => {
      setTotalCommitHistory(args);
    });
  }, [repo.repoPath]);

  if (redirectTo) {
    return (
      <Redirect
        push
        history={history}
        to={{
          pathname: redirectTo.to,
          state: redirectTo.params,
        }}
      />
    );
  }

  const showCommitHistory = () => {
    ipcRenderer.send("get-commit-history", repo.repoPath);
    ipcRenderer.once("get-commit-history-reply", (event, args) => {
      setTotalCommitHistory(args);
      setTotalCommitHistoryDialogShow(true);
    });
  };

  const showRepoInfo = () => {
    ipcRenderer.send("get-commit-history", repo.repoPath);
    ipcRenderer.once("get-commit-history-reply", (event, args) => {
      setTotalCommitHistory(args);
      setRepoInfoDialogShowing(true);
    });
  };

  const openInTerminal = () => {
    ipcRenderer.send("open-in-terminal", repo.repoPath);
  };

  const doraTheExplorer = () => {
    ipcRenderer.send("dora-the-explorer", repo.repoPath);
  };

  const changeDirectory = (selectedDirentry) => {
    console.log("changing directory to: " + selectedDirentry.filePath);
    ipcRenderer.send("get-dir-contents", selectedDirentry.filePath);
    ipcRenderer.once("get-dir-contents-reply", (event, args) => {
      console.log(args);
      setCurrentFolder(args);
    });
  };

  const goBackDir = () => {
    ipcRenderer.send("get-dir-contents", currentFolder.pathOfParentFolder);
    ipcRenderer.once("get-dir-contents-reply", (event, args) => {
      setCurrentFolder(args);
    });
  };

  const DirEntryCard = (props) => {
    const buttonRef = useRef();
    if (!props.isDir) {
      return (
        <>
          <div
            ref={buttonRef}
            className="h-44 cursor-pointer bg-gray-800 border-1 border-gray-700 rounded-lg hover:border-yellow-500"
          >
            <div className="h-4/6 text-4xl text-gray-700 flex content-center items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pt-3 h-full w-2/5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              title={props.entryName}
              className="h-2/6 px-3 truncate overflow-hidden py-3 font-extralight"
            >
              {props.entryName}
            </div>
          </div>
          <Popover placement="bottom" ref={buttonRef}>
            <PopoverContainer>
              <PopoverHeader>Compare versions</PopoverHeader>
              <PopoverBody>
                <div>
                  Compare the different versions of this file to see changes.
                  <button
                    className="block mt-3 bg-indigo-600 transition duration-150 ease-in-out hover:bg-indigo-500 rounded text-white px-3 py-2 text-sm"
                    onClick={async () => {
                      ipcRenderer.send(
                        "get-commit-history-file",
                        repo.repoPath,
                        props.filePath
                      );
                      ipcRenderer.once(
                        "get-commit-history-file-reply",
                        (event, commitHist) => {
                          setCommitHistory(commitHist);
                          setClickedFilePath(props.filePath);
                          setClickedFileName(props.entryName);
                          setCompareDialogOpen(true);
                        }
                      );
                    }}
                  >
                    Compare
                  </button>
                </div>
              </PopoverBody>
            </PopoverContainer>
          </Popover>
        </>
      );
    } else if (props.isDir) {
      return (
        <div
          className="h-44 cursor-pointer bg-gray-800 border-1 border-gray-700 rounded-lg hover:border-yellow-500"
          onClick={props.dirBrowseCallBack}
        >
          <div className="h-4/6 text-4xl text-gray-700 flex content-center items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="pt-3 h-full w-2/5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <div
            title={props.entryName}
            className="overflow-ellipsis overflow-hidden h-2/6 px-3 py-3 font-extralight"
          >
            {props.entryName}
          </div>
        </div>
      );
    }
  };

  const CloseDialog = () => (
    <Transition appear show={isCloseModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => setIsCloseModalOpen(false)}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Close repository?
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Do you want to close this repository?
                </p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border-2 border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={() => history.goBack()}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="ml-4 inline-flex justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border-2 border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={() => setIsCloseModalOpen(false)}
                >
                  No
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );

  const CommitHistoryDialog = () => (
    <Transition appear show={totalCommitHistoryDialogShow} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto min-w-max"
        onClose={() => setTotalCommitHistoryDialogShow(false)}
      >
        <div className="min-h-screen px-4 text-center min-w-max">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-min p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Commit History
              </Dialog.Title>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-hidden sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="overflow border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Commit No.
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Commit Message
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Commit Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {totalCommitHistory.map((commit) => (
                            <tr key={commit.number}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {commit.number !== 0
                                        ? commit.number.toString()
                                        : "-"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {commit.number !== 0
                                    ? commit.message
                                    : "Creation"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {commit.dtime.toString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border-2 border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={() => setTotalCommitHistoryDialogShow(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );

  const RepoInfoDialog = () => (
    <Transition appear show={repoInfoDialogShowing} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => setRepoInfoDialogShowing(false)}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Repository Information
              </Dialog.Title>
              <div className="flex flex-col mt-4">
                <span className="inline">
                  <span className="font-bold">Name: </span>
                  <span className="">{repoName}</span>
                </span>
                <span className="inline mt-2">
                  <span className="font-bold">Created on: </span>
                  <span className="">
                    {totalCommitHistory[0] !== undefined
                      ? totalCommitHistory[0].dtime.toString()
                      : ""}
                  </span>
                </span>
                <span className="inline mt-2">
                  <span className="font-bold">Path: </span>
                  <span className="">{repo.repoPath}</span>
                </span>
                <span className="inline mt-2">
                  <span className="font-bold">Number of versions: </span>
                  <span className="">
                    {totalCommitHistory.length.toString()}
                  </span>
                </span>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border-2 border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={() => setRepoInfoDialogShowing(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );

  const Sidebar = () => (
    <div className="parent-div-ht-full w-3/12 absolute sm:relative bg-gray-800 shadow md:h-full flex-col justify-between flex">
      <div className="">
        <div className="text-xl font-normal text-gray-500 pl-5 pt-7">
          Actions
        </div>
        <ul className="mt-8">
          <li
            className="flex w-full justify-between text-gray-400 hover:text-gray-200 cursor-pointer items-center mb-8"
            onClick={showRepoInfo}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-md ml-2">Repository Info</span>
            </div>
          </li>
          <li
            className="flex w-full justify-between text-gray-400 hover:text-gray-200 cursor-pointer items-center mb-8"
            onClick={showCommitHistory}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-md  ml-2">View Commit History</span>
            </div>
          </li>
          <li
            className="flex w-full justify-between text-gray-400 hover:text-gray-200 cursor-pointer  items-center mb-8"
            onClick={openInTerminal}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-code"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <polyline points="7 8 3 12 7 16" />
                <polyline points="17 8 21 12 17 16" />
                <line x1={14} y1={4} x2={10} y2={20} />
              </svg>
              <span className="text-md  ml-2">Open in Terminal</span>
            </div>
          </li>
          <li
            className="flex w-full justify-between text-gray-400 hover:text-gray-200 cursor-pointer  items-center mb-8"
            onClick={doraTheExplorer}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-md  ml-2">Open in File Explorer</span>
            </div>
          </li>
          <li className="flex w-full justify-between text-gray-400 hover:text-gray-200 cursor-pointer items-center"
          onClick={() => setIsCloseModalOpen(true)}>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-md  ml-2">Close Repo</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );

  const FileBrowser = () => (
    <div className="md:w-4/5 w-10/12 flex flex-col h-full bg-gray-800 px-5 text-white">
      <div className="h-20 bg-gray-800 flex content-center items-center justify-between">
        <div className="text-white text-2xl font-semibold">{repoName}</div>
        <button
          className="-mx-4 my-2 transition duration-300 ease-in-out border-2 opacity-30 hover:opacity-80 text-red-500 border-red-600 hover:bg-red-500 rounded hover:text-white px-3 py-2 text-sm"
          onClick={() => {
            setIsCloseModalOpen(true);
          }}
        >
          Close Repo
        </button>
      </div>
      <div className="mt-4 text-white text-xl font-light">Files</div>

      <Scrollbars autoHide autoHideTimeout={1000} className="mt-4 px-4">
        <div className="grid grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-5">
          {currentFolder.pathOfFolder !== repo.repoPath ? (
            <DirEntryCard
              isDir={true}
              entryName={".."}
              filePath={currentFolder.pathOfParentFolder}
              dirBrowseCallBack={() => goBackDir()}
            />
          ) : (
            ""
          )}
          {currentFolder.files.map((direntry) => {
            if (direntry.name !== ".cm") {
              return (
                <DirEntryCard
                  key={direntry.name}
                  isDir={direntry.isDir}
                  entryName={direntry.name}
                  filePath={direntry.filePath}
                  dirBrowseCallBack={() => changeDirectory(direntry)}
                />
              );
            } else {
              return <></>;
            }
          })}
        </div>
        <div className="h-14"></div>
      </Scrollbars>
    </div>
  );

  // Render everything:

  return (
    <>
      <div className="flex flex-no-wrap parent-div-ht-full">
        <Sidebar />
        <FileBrowser />
      </div>

      {/*Compare dialog*/}
      {/*Note: Making a separate component out of this gives weird focus errors*/}
      <Transition appear show={compareDialogOpen} as={Fragment}>
        <Dialog
          open={compareDialogOpen}
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setCompareDialogOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium leading-6 text-gray-900"
                >
                  Choose Versions
                </Dialog.Title>
                <div className="mt-3 grid grid-cols-2 gap-x-7 gap-y-3">
                  <div>
                    <h5 className="text-lg">From version</h5>
                    <RadioGroup
                      value={compareFromVersion}
                      onChange={setCompareFromVersion}
                    >
                      <RadioGroup.Option value={-1}>
                        {({ active, checked }) => {
                          var clName =
                            "py-2 px-3 border border-gray-500 rounded-md";
                          if (active) {
                            clName =
                              "py-2 px-3 border border-gray-600 rounded-md";
                          }
                          if (checked) {
                            clName =
                              "py-2 px-3 border-2 border-indigo-600 rounded-md";
                          }

                          return (
                            <div
                              className={
                                clName +
                                " cursor-pointer mb-2 focus:outline-none focus:ring focus:border-indigo-600"
                              }
                            >
                              Current
                            </div>
                          );
                        }}
                      </RadioGroup.Option>
                      {commitHistory.map((commitItem) => {
                        if (commitItem.number === 0) {
                          // hide creation
                          return <></>;
                        }
                        return (
                          <RadioGroup.Option
                            key={commitItem.number}
                            value={commitItem.number}
                          >
                            {({ active, checked }) => {
                              var clName =
                                "py-2 px-3 border border-gray-500 rounded-md";
                              if (active) {
                                clName =
                                  "py-2 px-3 border border-gray-600 rounded-md";
                              }
                              if (checked) {
                                clName =
                                  "py-2 px-3 border-2 border-indigo-600 rounded-md focus:outline-none focus:ring focus:border-indigo-600";
                              }

                              return (
                                <div
                                  className={clName + " cursor-pointer mb-2"}
                                >
                                  {"v" + commitItem.number.toString()}
                                </div>
                              );
                            }}
                          </RadioGroup.Option>
                        );
                      })}
                    </RadioGroup>
                  </div>
                  <div>
                    <h5 className="text-lg">To version</h5>
                    <RadioGroup
                      value={compareToVersion}
                      onChange={setCompareToVersion}
                    >
                      <RadioGroup.Option value={-1}>
                        {({ active, checked }) => {
                          var clName =
                            "py-2 px-3 border border-gray-500 rounded-md";
                          if (active) {
                            clName =
                              "py-2 px-3 border border-gray-600 rounded-md";
                          }
                          if (checked) {
                            clName =
                              "py-2 px-3 border-2 border-indigo-600 rounded-md";
                          }

                          return (
                            <div
                              className={
                                clName +
                                " cursor-pointer mb-2 focus:outline-none"
                              }
                            >
                              Current
                            </div>
                          );
                        }}
                      </RadioGroup.Option>
                      {commitHistory.map((commitItem) => {
                        if (commitItem.number === 0) {
                          // hide creation
                          return <></>;
                        }
                        return (
                          <RadioGroup.Option
                            key={commitItem.number}
                            value={commitItem.number}
                          >
                            {({ active, checked }) => {
                              var clName =
                                "py-2 px-3 border border-gray-500 rounded-md";
                              if (active) {
                                clName =
                                  "py-2 px-3 border border-gray-600 rounded-md";
                              }
                              if (checked) {
                                clName =
                                  "py-2 px-3 border-2 border-indigo-600 rounded-md";
                              }

                              return (
                                <div
                                  className={
                                    clName +
                                    " cursor-pointer mb-2 focus:outline-none"
                                  }
                                >
                                  {"v" + commitItem.number.toString()}
                                </div>
                              );
                            }}
                          </RadioGroup.Option>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={() => {
                      setRedirectTo({
                        to: "/ShowDiff",
                        params: {
                          filePath: clickedFilePath,
                          fileName: clickedFileName,
                          repoPath: repo.repoPath,
                          vOrig: compareFromVersion,
                          vNew: compareToVersion,
                        },
                      });
                    }}
                  >
                    Compare
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/*Close repo dialog*/}
      <CloseDialog />

      {/*Commit history dialog*/}
      <CommitHistoryDialog />

      {/*Repo Info Dialog*/}
      <RepoInfoDialog />
    </>
  );
}
