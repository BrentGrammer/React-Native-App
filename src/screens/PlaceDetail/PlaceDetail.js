import React, { Component } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  Dimensions } from 'react-native';
import { connect } from 'react-redux';
import MapView from "react-native-maps";

// icon from library:
import Icon from 'react-native-vector-icons/Ionicons';
import { deletePlace } from '../../store/actions/index';


/**
 * Props passed in from passProps object in FindPlaceScreen when this screen is pushed after user selects a place:
 *   selectedPlace - place from state array when user presses on a place in the list
 *      this prop is null by default
 *  
 */

class PlaceDetail extends Component {
  state = {
    viewMode: "portrait"
  };

  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", this.updateStyles);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.updateStyles);
  }

  updateStyles = dims => {
    this.setState({
      viewMode: dims.window.height > 500 ? "portrait" : "landscape"
    })
  };

  placeDeletedHandler = () => {
    // key is on the prop from the outer component that pushed this page with navigation.
    this.props.onDeletePlace(this.props.selectedPlace.key);
    this.props.navigator.pop()
  };

  render() {
    
    return (
        <View 
          style={[
            styles.container, 
            this.state.viewMode === "portrait" 
              ? styles.portraitContainer 
              : styles.landscapeContainer
          ]}
        >
          {/* View wrapper around image and mapview to adjust portrait and landscape styling and layout
              to make the image and mapview display in column instead of side by side without this.
              This extra View blocks the landscapeContainer row setting and defaults to column to make
              the MapView and Image stack */}
          <View style={styles.placeDetailContainer}>
            <View style={styles.subContainer}>
              <Image 
                source={this.props.selectedPlace.image} 
                style={styles.placeImage} 
              /> 
            </View>
            <View style={styles.subContainer}>
              <MapView 
                initialRegion={{
                  // location from redux store set when place is selected - contains latidude and longitude coords
                  ...this.props.selectedPlace.location,
                  // same settings from PickLocation.js
                  latitudeDelta: 0.0122,
                  longitudeDelta: 
                    Dimensions.get("window").width / 
                    Dimensions.get("window").height * 
                    0.0122
                }}
                style={styles.map}
              >
                {/* lat and long in location obj from store passed to coordinate */}
                <MapView.Marker location={this.props.selectedPlace.location} />
              </MapView>
            </View>
          </View>
          <View style={styles.subContainer}>
            <View>
              <Text style={styles.placeName}>{this.props.selectedPlace.name}</Text>
            </View>
            <View style={styles.subContainer}>
              <TouchableOpacity onPress={this.placeDeletedHandler}>
                <View style={styles.deleteButton}>
                  <Icon size={30} name={Platform.OS === 'android' ? "md-trash" : "ios-trash"} color="red" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    );
  }

};

const styles = StyleSheet.create({
  container: {
    margin: 22,
    flex: 1 // this is needed to make the container stretch to full height so children aren't bunched up.
  },
  portraitContainer: {
    flexDirection: "column"
  },
  landscapeContainer: {
    flexDirection: "row"
  },
  map: {
    // preconfigured style settings built in to Stylesheet to make the element fill the container nicely
    // and take the space available.
    ...StyleSheet.absoluteFillObject
  },
  // used to change portrait/landscape layout of mapview and image to make them stack in landscape view
  // this blocks the "row" setting applied to the elements from landscapeContainer and uses the default column layout View uses automatically with flexbox
  placeDetailContainer: {
    flex: 2 // container for map and image should be next to subContainer holding trash icon and take more space
  },
  placeImage: {
    width: "100%",
    height: "100%" // changed from hard coded height to 100% so it only takes space available on top of MapView
  },
  placeName: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 28
  },
  deleteButton: {
    alignItems: 'center'
  },
  subContainer: {
    flex: 1 // make the subcontainers take equal priority - this makes the mapview and image share the space equally
  }
});

const mapDispatchToProps = (dispatch) => {
  return {
    onDeletePlace: (key) => dispatch(deletePlace(key))
  };
};

export default connect(null, mapDispatchToProps)(PlaceDetail);



/*** OLD CODE WITH MODAL ****/
// import React from 'react';
// import { Modal, View, Text, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
// // icon from library:
// import Icon from 'react-native-vector-icons/Ionicons';

// /**
//  * Props from App.js:
//  *   selectedPlace - place from state array when user presses on a place in the list
//  *      this prop is null by default
//  *  
//  */

// const PlaceDetail = props => {
//   let modalContent = null;

//   if (props.selectedPlace) {
//     modalContent = (
//       <View>
//         <Image source={props.selectedPlace.image} style={styles.placeImage} />
//         <Text style={styles.placeName}>{props.selectedPlace.name}</Text>
//       </View>
//     );
//   }

//   return (
//     <Modal 
//       visible={props.selectedPlace !== null} animationType="slide"
//       onRequestClose={props.onModalClosed} // this is fired when back button is pressed and is required on TV and Android
//     >
//       <View style={styles.modalContainer}>
//         {modalContent}
//         <View>
//           <TouchableOpacity onPress={props.onItemDeleted}>
//             <View style={styles.deleteButton}>
//               <Icon size={30} name="md-trash" color="red" />
//             </View>
//           </TouchableOpacity>
//           <Button title="Close" onPress={props.onModalClosed} />
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     margin: 22
//   },
//   placeImage: {
//     width: "100%",
//     height: 200
//   },
//   placeName: {
//     fontWeight: "bold",
//     textAlign: "center",
//     fontSize: 28
//   },
//   deleteButton: {
//     alignItems: 'center'
//   }
// });

// export default PlaceDetail;

