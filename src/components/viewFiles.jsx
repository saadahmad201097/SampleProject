import React, { useState, useEffect } from "react";
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
import { Spinner, Table } from "react-bootstrap";
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

function ViewFiles(props) {
  const [files, setFiles] = useState("");
  const [loading, setLoading] = useState(false);

  const getUploadedFiles = async () => {
    setLoading(true);
    const web3 = new Web3(Web3.givenProvider);
    var contract = new web3.eth.Contract(FileUploadConAbi, FileUploadConAdd);
    let verifyResponse = await contract.methods
      .checkHistory(props.metaMaskAddress)
      .call();
    console.log(verifyResponse);
    if (verifyResponse) {
      let ipfs = [];
      for (let i = 0; i < verifyResponse.length; i++) {
        if (verifyResponse[i]) {
          ipfs.push(axios.get(`https://ipfs.io/ipfs/${verifyResponse[i]}`));
        }
      }
      let res = await Promise.all(ipfs);
      console.log(res);
      ipfs = [];
      for (let i = 0; i < res.length; i++) {
        if (res[i].data) {
          ipfs.push(res[i].data.file);
        }
      }

      setFiles(ipfs);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.metaMaskAddress) getUploadedFiles();
  }, [props.metaMaskAddress]);

  return (
    <>
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
            <div className="col-sm-12">
              <div className="swapper position-relative">
                <div className="tab-content" id="ex1-content">
                  <div
                    className="tab-pane fade show active"
                    id="ex1-tabs-1"
                    role="tabpanel"
                    aria-labelledby="ex1-tab-1"
                  >
                    <div className="swap-form form px-sm-5 pb-sm-5 pt-sm-4">
                      {loading ? (
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Spinner animation="border" size="lg" />
                        </div>
                      ) : files && files.length > 0 ? (
                        files.map((file, index) => {
                          return (
                            <Table striped bordered hover size="sm">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>File Hash (Click to Download File)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>
                                    <a
                                      href={`https://ipfs.io/ipfs/${file}`}
                                      target='_blank'
                                      download
                                    >
                                      {file}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          No Data Found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ViewFiles));
