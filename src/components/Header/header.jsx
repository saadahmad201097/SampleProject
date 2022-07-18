import React from "react";
import {withRouter } from "react-router-dom";
import { styleLight } from "../../styleLight.js";

import { connect } from "react-redux";
import { setMetaMask, deleteMetaMask, Web3Object,Web3Connected } from "../../redux/actions/web3action";
import { blockChainConfig } from "../../constants/config";
const selectedBlockChain =
  blockChainConfig[
    sessionStorage.getItem("selectedBlockChain")
      ? sessionStorage.getItem("selectedBlockChain")
      : 0
  ];

const {
  networkIdTestNet,
  networkIdMainNet,
} = selectedBlockChain;

const Web3 = require("web3");

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFlag: false,
      showSpinner: true,
      showWalletConnectDialog: false,
      theme: "",
      selectedTab: "gojiswap",
    };
  }

  addContract(calledFor, provider = null) {
    // let web3ForAliaPrice;
    if (
      calledFor === "metamask" &&
      Web3.givenProvider &&
      Web3.givenProvider.networkVersion === networkIdTestNet &&
      Web3.givenProvider.networkVersion === networkIdMainNet
    ) {
      this.props.Web3Object(Web3.givenProvider);
      this.props.Web3Connected(true);
    } 
  }

  clearReducer() {
    this.props.setMetaMask("");
  }

  async connectWithWalletMetaMask(calledFor = "connected") {
    if (window.screen.width > 768) {
      let ethereum;
      if (typeof window.ethereum !== "undefined") {
        ethereum = window.ethereum;
        if (ethereum.networkVersion !== networkIdTestNet) {
          return;
        }
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        localStorage.setItem("accounts", accounts[0]);
        localStorage.setItem("connectedWith", "metamask");
        localStorage.setItem("userConnected", true);

        if (accounts.length > 0) {
          // console.log("accounts", accounts[0]);
          this.props.setMetaMask(accounts[0]);
        }

        if (accounts.length === 0) {
          this.clearReducer();
        }

        ethereum.on("networkChanged", (accounts) => {
          // console.log(accounts);
          // this.clearReducer();
          this.addContract("metamask");
          this.props.setMetaMask("");
          if (accounts !== networkIdMainNet) {
          }
        });

        this.addContract("metamask");
      } else {
        this.clearReducer();
      }
    } else {
      return;
    }
  }

  async connectWithWalletConnect(provider) {
    localStorage.setItem("accounts", provider.accounts[0]);
    localStorage.setItem("connectedWith", "walletConnect");
    localStorage.setItem("userConnected", true);
    this.props.setMetaMask(provider.accounts[0]);
    this.addContract("walletConnect", provider);
  }

  connectWithWallet(calledFor) {
    if (calledFor === "metamask") {
      this.connectWithWalletMetaMask();
    }

  }

  componentDidMount(prevProps) {
    const account = localStorage.getItem("accounts");
    const userlogout = localStorage.getItem("logout");

    setInterval(() => {
      let web3 = "";
      if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(Web3.givenProvider);
      }
      if (web3 !== "") {
        web3.eth
          .getAccounts()
          .then((acc) => {
            if (
              acc.length === 0 &&
              localStorage.getItem("userConnected") === "true" &&
              localStorage.getItem("connectedWith") === "metamask"
            ) {
              localStorage.removeItem("userConnected");
              localStorage.removeItem("connectedWith");
              window.location.reload();
            }
          })
          .catch((e) => {
            // console.log(e);
          });
      }
    }, 1000);

    if (localStorage.getItem("userConnected") === "true") {
      setTimeout(() => {
        // document.getElementById("connectButton").click();
        const connectedWith = localStorage.getItem("connectedWith");
        if (connectedWith === "metamask") {
          this.connectWithWallet("metamask");
        }
      }, 600);

        // const selTab = sessionStorage.getItem("selectedTab");
    // if (selTab) {
    // this.setState({ selectedTab:selTab});
    // } else {
    //   sessionStorage.setItem("selectedTab", "gojiswap");
    // }
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "light");
    }
    this.setState({
      theme: localStorage.getItem("theme")
        ? localStorage.getItem("theme")
        : "light",
    });
    }

    window.ethereum !== undefined &&
      window.ethereum.on("accountsChanged", (acc) => {
        if (this.props.metaMaskAddress !== "" && acc.length > 0) {
          this.handleLogout(false);
          this.clearReducer();
          this.connectWithWallet("metamask");
        }
      });

    if (!this.props.metaMaskAddress && !account && !userlogout) {
      this.setState({ showWalletConnectDialog: true });
    }
  }

  handleButtonClick = () => {
    if (localStorage.getItem("theme")) {
      if (localStorage.getItem("theme") === "dark") {
        localStorage.setItem("theme", "light");
        this.setState({ theme: "light" });
      } else {
        localStorage.setItem("theme", "dark");
        this.setState({ theme: "dark" });
      }
    }
  };

  //   const changeSelectedTab = (key) => {
  //     sessionStorage.setItem("selectedTab", key);
  // this.setState({ selectedTab:key});
  //     props.history.push(`/${key}`);
  //   };

  handleLogout()
  {
    sessionStorage.removeItem("userConnected");
    sessionStorage.removeItem("userAccount");
    sessionStorage.removeItem("userBalance");
    localStorage.removeItem("walletconnect");
    localStorage.removeItem("connectedWith");
    localStorage.removeItem("accounts");
    localStorage.removeItem("connectorId");
    localStorage.removeItem("userConnected");
    this.props.Web3Connected(false)
    this.props.Web3Object({})
    this.props.setMetaMask("")
  }

  render() {
    window.ethereum !== undefined &&
      window.ethereum.on("accountsChanged", (acc) => {
        if (acc.length === 0) {
          this.handleLogout();
        }
      });

      return (
        <>
          <div>
            <div className="d-flex w-auto d-none d-sm-flex">
                <button
                id={"connectButton"}
                  className="btn theme-btn m-0 top-btn"
                  onClick={() =>this.props.web3connected ? this.handleLogout() : this.connectWithWalletMetaMask()}
                >
                  {this.props.web3connected ?
                 "Connected" :"Connect to wallet"}
                </button>
            </div>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html:styleLight,
            }}
          />
        </>
      );
  }
}

const mapDispatchToProps = {
  setMetaMask,
  deleteMetaMask,
  Web3Connected,
  Web3Object
};

const mapStateToProps = (state, ownProps) => {
  return {
    metaMaskAddress: state.web3.metaMaskAddress,
    web3connected: state.web3.web3connected,

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));

