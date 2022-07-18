import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";

import web3Reducer from "../redux/reducer/web3reducer";

import { composeWithDevTools } from "redux-devtools-extension";
const rootReducer = combineReducers({
  web3: web3Reducer,
});

const Store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);
export default Store;
