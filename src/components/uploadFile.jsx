import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import {
  setMetaMask,
  deleteMetaMask,
  Web3Object,
  Web3Connected,
} from "../redux/actions/web3action";
import { blockChainConfig } from "../constants/config";
import { isGreater } from "../helpers/helpers";
import Dropzone from "react-dropzone";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import Header from "../components/Header/header";

const selectedBlockChain =
  blockChainConfig[
    sessionStorage.getItem("selectedBlockChain")
      ? sessionStorage.getItem("selectedBlockChain")
      : 0
  ];

const {
  networkIdTestNet,
  networkIdMainNet,
  providerUrl,
  FileUploadConConfig: { add: FileUploadConAdd },
  FileUploadConConfig: { abi: FileUploadConAbi },
  ethTokenConConfig: { add: EthTokenConAdd },
  ethTokenConConfig: { abi: EthTokenConAbi },
} = selectedBlockChain;

const Web3 = require("web3");

const supportedFiles = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

function Home(props) {
  const [selectedFile, setSelectedFile] = useState("");
  const [responseHash, setResponseHash] = useState("");

  const [loaderFor, setLoaderFor] = useState("");

  const showToast = (msg, type = "error") => {
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  async function uploadFileOnBlockChain(web3, acc) {
    const contract = new web3.eth.Contract(FileUploadConAbi, FileUploadConAdd);
    const result = await contract.methods
      .filesToVerify(responseHash)
      .send({
        from: acc,
      })
      .then((res) => {
        console.log(res);
        setResponseHash("");
        setSelectedFile("");
        setLoaderFor("");
        showToast("Uploaded Successfully", "success");
      })
      .catch((err) => {
        console.log(err);
        setLoaderFor("");
        showToast("Something went wrong while uploading file");
      });
    return result;
  }

  async function checkForTokenApproval(web3, acc, fromCurrencyContract) {
    if (!responseHash) {
      showToast("Please select file to upload.");
      return;
    }

    var contract = new web3.eth.Contract(FileUploadConAbi, FileUploadConAdd);
    let verifyResponse = await contract.methods
      .verifyFiles(responseHash)
      .call();

    console.log(verifyResponse);

    if (verifyResponse === false) {
      fromCurrencyContract.methods
        .allowance(acc, FileUploadConAdd)
        .call()
        .then((resAllowance) => {
          setLoaderFor("verifyFile");
          if (resAllowance === "0") {
            fromCurrencyContract.methods
              .approve(FileUploadConAdd, "1000000000000000000")
              .send({ from: acc })
              .then((res) => {
                uploadFileOnBlockChain(web3, acc);
              })
              .catch((err) => {
                setLoaderFor("");
                console.log(err);
              });
          } else {
            uploadFileOnBlockChain(web3, acc);
          }
        })
        .catch((err) => {
          setLoaderFor("");
          console.log(err);
        });
    } else if (verifyResponse === true) {
      setLoaderFor("");
      showToast("This file has already been uploaded");
    } else {
      setLoaderFor("");
      showToast("Something went wrong while uploading file");
    }
  }

  function handleSwap() {
    if (props.web3connected) {
      const web3 = new Web3(Web3.givenProvider);
      web3.eth.getAccounts().then(async (acc) => {
        const fromCurrencyContract = new web3.eth.Contract(
          EthTokenConAbi,
          EthTokenConAdd
        );
        const balance = await fromCurrencyContract.methods
          .balanceOf(acc[0])
          .call();
        console.log(balance);
        if (isGreater(web3.utils.toWei("1", "ether"), balance)) {
          showToast("You don't have enough balance to proceed");
          return;
        }
        checkForTokenApproval(web3, acc[0], fromCurrencyContract);
      });
    } else {
      document.getElementById("connectButton").click();
    }
  }

  const handleFileSelect = async (file) => {
    console.log(file);
    if (file && file[0]) {
      if (!supportedFiles.includes(file[0].type)) {
        showToast("Files with type .png, .jpeg, .jpg and .pdf are allowed.");
        return;
      }
      if (file[0].size > 10485760) {
        showToast("File size must not be greater then 10mb");
        return;
      }
      setLoaderFor("uploadFile");
      setSelectedFile(file[0]);
      //ipfs get api https://ipfs.io/ipfs/QmVtrZFmdmMk2wDpk1PQX19v1kba5fmV9BxS2NW6LzmyeU
      let fileData = new FormData();
      fileData.append("path", file[0]);
      let fileRes = await axios.post(
        "https://ipfs.infura.io:5001/api/v0/add",
        fileData
      );

      console.log(fileRes);
      if (fileRes.data.Hash) {
        const data = {
          file: fileRes.data.Hash,
          type: file[0].type,
        };
        console.log(data);

        const blob = new Blob([JSON.stringify(data)], {
          type: "text/plain",
        });
        let formData = new FormData();
        formData.append("path", blob);
        let res = await axios.post(
          "https://ipfs.infura.io:5001/api/v0/add",
          formData
        );
        console.log(res);
        if (res.data.Hash) {
          setResponseHash(res.data.Hash);
          setLoaderFor("");
        }
      } else {
        setLoaderFor("");
        showToast("Something went wrong while uploading nft");
      }
    }
  };

  return (
    <div className="uniswap">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 35,
        }}
      >
        <Header></Header>
      </div>

      <div className="container mt-5">
        <div className="row m-0 position-relative">
          <div className="col-sm-12 swapper-section d-flex justify-content-center">
            <div className="swapper position-relative">
              <div className="tab-content" id="ex1-content">
                <div
                  className="tab-pane fade show active"
                  id="ex1-tabs-1"
                  role="tabpanel"
                  aria-labelledby="ex1-tab-1"
                >
                  <div className="swap-form form px-sm-5 pb-sm-5 pt-sm-4">
                    <div className="input-group" style={{ fontSize: 12 }}>
                      <Dropzone
                        onDrop={(acceptedFiles) =>
                          handleFileSelect(acceptedFiles)
                        }
                      >
                        {({ getRootProps, getInputProps }) => (
                          <button
                            className="btn"
                            disabled={!props.web3connected}
                          >
                            <div {...getRootProps()} style={{ fontSize: 12 }}>
                              <input {...getInputProps()} />

                              {loaderFor === "uploadFile" ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Select File"
                              )}
                            </div>
                          </button>
                        )}
                      </Dropzone>

                      <input
                        disabled
                        className="form-control"
                        style={{ fontSize: 12 }}
                        value={selectedFile.name}
                      />
                    </div>

                    <div className="form-btn mt-sm-5 mt-5">
                      <button
                        className="btn theme-btn w-100"
                        onClick={!loaderFor ? handleSwap : ""}
                      >
                        {props.web3connected ? (
                          loaderFor === "verifyFile" ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Upload File"
                          )
                        ) : (
                          "Connect wallet"
                        )}
                      </button>
                    </div>

                    <div className="form-btn mt-sm-2 mt-2">
                      <button
                        className="btn theme-btn w-100"
                        onClick={() => props.history.push("/viewfiles")}
                      >
                        {props.web3connected
                          ? "View Uploaded File"
                          : "Connect wallet"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapDispatchToProps = {
  setMetaMask,
  deleteMetaMask,
  Web3Connected,
  Web3Object,
};

const mapStateToProps = (state, ownProps) => {
  return {
    metaMaskAddress: state.web3.metaMaskAddress,
    web3connected: state.web3.web3connected,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Home));
