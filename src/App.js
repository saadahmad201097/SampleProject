import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import uploadFile from "./components/uploadFile";
import verifyFile from "./components/verifyFile";
import viewFiles from "./components/viewFiles";

import ScrollToTop from "./components/commonComponents/scrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/" component={uploadFile} />
          <Route exact path="/viewfiles" component={viewFiles} />
          <Route exact path="/admin" component={verifyFile} />
        </Switch>
        <ScrollToTop />
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
      />{" "}
    </div>
  );
}

export default App;
