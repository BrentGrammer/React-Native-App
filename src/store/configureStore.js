import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from "redux-thunk";

import placesReducer from './reducers/places';
import uiReducer from './reducers/ui';
import authReducer from './reducers/auth';

const rootReducer = combineReducers({
  places: placesReducer,
  ui: uiReducer,
  auth: authReducer
});

// compose allows adding more than one enhancer (middleware is a type of enhancer along with redux devtools)
let composeEnhancers = compose;

// __DEV__ is a special global var exposed by React-Native and is only true if in development mode.
// Only add redux devtools in development to avoid bloating production code unnecessarily
if (__DEV__) {
  // this is set to a compose function provided by redux devtools, but if it fails then fallback to the normal compose function from redux
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore = () => {
  // create store expects one single reducer as a first arg (the bundled reducers) and the second arg is 
  // the enhancers (middlewares, redux devtools etc.)
  return createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
};

export default configureStore;