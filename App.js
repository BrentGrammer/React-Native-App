import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import AuthScreen from './src/screens/Auth/Auth';
import SharePlaceScreen from './src/screens/SharePlace/SharePlace';
import FindPlaceScreen from './src/screens/FindPlace/FindPlace';
import PlaceDetailScreen from './src/screens/PlaceDetail/PlaceDetail';
import SideDrawerScreen from './src/screens/SideDrawer/SideDrawer';
import configureStore from './src/store/configureStore';

const store = configureStore();

/*** REGISTER SCREENS USED IN THE ENTIRE APP HERE ****/
// First arg is a string id you make up for the screen - convention is "app-name.screenName" - This must be unique!
// Second argument is a function that returns the screen component
// To connect a component to the redux store, pass in the store and Provider as third and fourth args:
Navigation.registerComponent("my-app.AuthScreen", () => AuthScreen, store, Provider);
Navigation.registerComponent("my-app.SharePlaceScreen", () => SharePlaceScreen, store, Provider);
Navigation.registerComponent("my-app.FindPlaceScreen", () => FindPlaceScreen, store, Provider);
Navigation.registerComponent("my-app.PlaceDetailScreen", () => PlaceDetailScreen, store, Provider);
Navigation.registerComponent("my-app.SideDrawerScreen", () => SideDrawerScreen);

/*** START AN APP ***/
// Can have tab based app for screen with tabs or single screen app for a login screen etc.
// This app is started on the login Auth screen and when user logs in, startMainTabs is called from MainTabs folder to start
// a application with tabs - this overwrites and cancels out the single page app started.

// docs: https://github.com/wix/react-native-navigation/blob/v1/docs/top-level-api.md
// You need to provide options for config and need a screen property
Navigation.startSingleScreenApp({
  screen: {
    screen: "my-app.AuthScreen", // <-- the unique string id assigned to the screen to use
    title: "Login" // <-- title displays in the navbar automatically added by the library
  }
});




/******** OLD CODE BEFORE USING REACT_NATIVE_NAVIGATION LIB *******/

// import React, {Component} from 'react';
// import {Platform, StyleSheet, Text, View, TextInput, Button } from 'react-native';
// import { connect } from 'react-redux';
// import { addPlace, deletePlace, selectPlace, deselectPlace } from './src/store/actions/index';

// import PlaceInput from './src/components/PlaceInput/PlaceInput';
// import PlaceList from './src/components/PlaceList/PlaceList';
// import placeImage from './src/assets/logo.png';
// import PlaceDetail from './src/components/PlaceDetail/PlaceDetail';

// type Props = {};

// class App extends Component<Props> {
  
//   placeAddedHandler = (placeName) => {
//     this.props.onAddPlace(placeName);
//     console.log('place added')
//   };

//   placeSelectedHandler = (key) => {
//     this.props.onSelectPlace(key);
//   };

//   placeDeletedHandler = () => {
//     this.props.onDeletePlace();
//   };

//   modalClosedHandler = () => {
//     // this action creator sets the placeSelected to null in the store.
//     // the logic in the PlaceDetail.js file will close the modal if this prop is null (on the visible property of Modal)
//     this.props.onDeselectPlace();
//   };

//   render() {
//     return (
//       <View style={styles.container}>
//         {/* PlaceDetail is a modal */}
//         <PlaceDetail 
//           selectedPlace={this.props.selectedPlace} 
//           onItemDeleted={this.placeDeletedHandler} 
//           onModalClosed={this.modalClosedHandler} 
//         />
//         <PlaceInput onPlaceAdded={this.placeAddedHandler} />
//         <PlaceList 
//           places={this.props.places} 
//           onItemSelected={this.placeSelectedHandler} 
//         />
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, //removing this will allow just building from top to bottom - the container will only take as much space as child elements need instead of all the available space.
//     justifyContent: 'flex-start', // this allows you to keep flex:1 so the color isn't changed and container takes full width.
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//     padding: 20
//   }
// });

// const mapStateToProps = (state) => {
//   return {
//     places: state.places.places,
//     selectedPlace: state.places.selectedPlace
//   };
// };

// const mapDispatchToProps = (dispatch) => {
//   return {
//     onAddPlace: (name) => dispatch(addPlace(name)),
//     onDeletePlace: () => dispatch(deletePlace()),
//     onSelectPlace: (key) => dispatch(selectPlace(key)),
//     onDeselectPlace: () => dispatch(deselectPlace())
//   };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(App);
