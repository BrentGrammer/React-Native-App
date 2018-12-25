import App from './App';

// execute as a function since it is wrapped in one in order to be re-used to sign user out:
App();

/**
 * You only need to import the App parent component on index.js and react-native-navigation will load the screens
 * registered in App.js
 */




/******** OLD CODE BEFORE USING REACT_NATIVE_NAVIGATION LIB *******/

// import React from 'react';
// import {AppRegistry} from 'react-native';
//import { Provider } from 'react-redux';
// import App from './App';
//import {name as appName} from './app.json';
//import configureStore from './src/store/configureStore';

// const store = configureStore();

// // You need to make this a component registerComponent below expects a component (make it a function that returns JSX)
// const RNRedux = () => (
//   <Provider store={store}>
//     <App />
//   </Provider>
// );

// This tells react-native what the root component for the app is:
// the second arg is a function that returns a root app component
//AppRegistry.registerComponent(appName, () => RNRedux);

//AppRegistry.registerComponent(appName, () => App);
