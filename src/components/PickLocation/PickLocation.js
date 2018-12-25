import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
// default export of react-native-maps library:
import MapView from 'react-native-maps';

class PickLocation extends Component {
  // manage initialRegion for mapview in state:
  state = {
    focusedLocation: {
      // defining region - deltas are length beyond the point indicated by lat and long to form a view area
      latitude: 37.7900352,
      longitude: -122.4013726,
      latitudeDelta: 0.0122,
      // calculate this dynamically to account for aspect ratio of device:
      // window width / height * latitudeDelta:
      longitudeDelta: 
        Dimensions.get("window").width / 
        Dimensions.get("window").height * 
        0.0122
    },
    locationChosen: false // only show marker if user picks a location
  };

  reset = () => {
    this.setState({
      focusedLocation: {
        latitude: 37.7900352,
        longitude: -122.4013726,
        latitudeDelta: 0.0122,
        longitudeDelta: 
          Dimensions.get("window").width / 
          Dimensions.get("window").height * 
          0.0122
      },
      locationChosen: false 
    });
  };

  pickLocationHandler = (event) => {
    // react-native-maps provides event data in nativeEvent prop
    const coords = event.nativeEvent.coorindate;
    // use library animation methods to animate movement on map (call then on the ref set up on MapView):
    // animate to region takes a region object (same shape in store in focusedLocation)
    this.map.animateToRegion({
      region: {
        ...this.state.focusedLocation,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    });
    this.setState(prevState => {
      return {
        focusedLocation: {
          ...prevState.focusedLocation,
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        locationChosen: true
      };
    });
    // pass location data to SharedPlace.js for use
    this.props.onLocationPick({
      latitude: coords.latitude,
      longitude: coords.longitude
    });
  };

  // get users location
  getLocationHandler = () => {
    // this is exposed by react-native through this API - it is not the navigator obj of the web
    // takes 2 args - a success function and an error callback if fetch position failed.
    // optional third arg with options such as timeout, etc.
    navigator.geolocation.getCurrentPosition((position) => {
      // created to reuse the pickLocationHandler - need to pass in a nativeEvent object - create manually:
      const coordsEvent = {
        nativeEvent: {
          coordinate: {
            // position passed in has coords prop with latitude and longitude points of user location
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }
      };
      this.pickLocationHandler(coordsEvent);

    }, (err) => {
      console.log(err);
      alert("Fetching position failed, please pick one manually.");
    });
  };

  render() {
    let marker = null;
    // only render  a marker if user pressed on the map.
    if (this.state.locationChosen) {
      // use Marker subcomponent which takes one coordinate prop set to the stored focused location.
      // coordinate only needs a latitude and longitude point, not the deltas.
      marker = <MapView.Marker coordinate={this.state.focusedLocation}/>
    }

    const { focusedLocation, locationChosen } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
        <MapView 
          // takes object describing what part of the world to view:
          initialRegion={focusedLocation}
          // initialRegion only set once - region will be updated with state changes
          // You don't need this if using animate methods in the handler - the map will be moved via those. left for reference
          // this is used here though when reset is called on sharedplace parent, the map will update back to original position - it won't do it otherwise since initialRegion only fires once
          region={ !locationChosen ? focusedLocation : null } // condition to keep animation working, setting region breaks animation.  null will make region be ignored
          style={styles.map}
          // returns lat long coordinate
          onPress={this.pickLocationHandler}
          // assign ref to this component to call react-native-maps animate methods on it
          ref={ref => this.map = ref}
        >
          {marker} 
        </MapView>
        </View>
        <View style={styles.button}>
          <Button title="locate me" onPress={this.getLocationHandler}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%', // this is set because the View wrapper in here is blocking the inherited flexbox behavior from the wrapper in the parent.
    alignItems: "center"
  },
  map: {
    width: '100%',
    height: '250px'
  },
  button: {
    margin: 8
  }
});

export default PickLocation;