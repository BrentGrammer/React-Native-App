import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { connect } from 'react-redux';
import PlaceList from '../../components/PlaceList/PlaceList';
import { getPlaces } from "../../store/actions/index";

class FindPlaceScreen extends Component {
  // This overrides the navigator style by using the specific property navigatorStyle
  static navigatorStyle = {
    navButtonColor: "orange"
  };

  state = {
    placesLoaded: false,
    removeAnim: new Animated.Value(1), // instantiate value with Animated api and pass in a style value to start from (this would be for opacity)
    placesAnim: new Animated.Value(0)
  };

  constructor(props) {
    super(props);
    // This is used to listen for events with RNN to open the side drawer screen.
    // This method listens for events fired by RNN which you can get in the argument and handle.
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
  }

  // listening for the NavBarButtonPress event will be an object with type and id onit.
  // the id needs to be assigned to the button to handle it in startMainTabs.js setup - add an id prop to the buttons. 
  onNavigatorEvent = (event) => {
      // check these events to reset the store flag for redirecting if user revisits tab to reload the places list
      // this is done here because componentDidMount only fires once and component is not destroyed when user navigates to 
      // a different tab.   
      if (event.type === "ScreenChangedEvent" && event.id === "WillAppear") {
        this.props.onLoadPlaces();
      }
    if (event.type === 'NavBarButtonPress' && event.id === 'sideDrawerToggle') {
      this.props.navigator.toggleDrawer({
        side: "left" // need to set to left to avoid errors on android.
      });
    }
  };
  
  placesSearchHandler = () => {
    Animated.timing(this.state.removeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      this.setState({
        placesLoaded: true
      });
      this.placesLoadedHandler();
    });
  };

  placesLoadedHandler = () => {
    Animated.timing(this.state.placesAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };

  itemSelectedHandler = (key) => {
    const selPlace = this.props.places.find(place => place.key === key);

    // builtin navigator prop on registered screens exposes push and pop methods, etc. to add remove pages from view stack.
    // Note: a working back button is added automatically with push()
    this.props.navigator.push({
      screen: "my-app.PlaceDetailScreen",
      title: selPlace.name,
      // this allows you to pass props to the push screen which will be merged.
      // the PlaceDetail.js component expects a selectedPlace to display, so this is passed here to it.
      passProps: {
        selectedPlace: selPlace
      }
    });
  };

  render() {
    // render a button to fetch places if none are loaded:
    let content = (
      <Animated.View 
        style={{
          opacity: this.state.removeAnim,
          transform: [
            {
              scale: this.state.removeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 1] // 12 used in place of 0 (the toValue) and 1 used in place of the start value (passed to new Animated.Value())
              })
            }
          ]
        }}
      >
        <TouchableOpacity onPress={this.placesSearchHandler}>
          <View style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Find Places</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );

    if(this.state.placesLoaded) {
      content = (
        <Animated.View style={{
          opacity: this.state.placesAnim
        }}>
          <PlaceList 
            places={this.props.places} 
            onItemSelected={this.itemSelectedHandler} 
          />
        </Animated.View>
      );
    }

    return (
      <View style={this.state.placesLoaded ? null : styles.buttonContainer}>
        {content}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1, // makes it take the whole page height so centering will position in center of page
    justifyContent: "center",
    alignItems: "center"
  },
  searchButton: {
    borderColor: "orange",
    borderWidth: 3,
    borderRadius: 50,
    padding: 20
  },
  searchButtonText: {
    color: "orange",
    fontWeight: "bold",
    fontSize: 26
  }
});

const mapStateToProps = (state) => {
  return {
    places: state.places.places
  };
};

const mapDispatchToProps = dispatch => ({
  onLoadPlaces: () => dispatch(getPlaces())
});

export default connect(mapStateToProps, mapDispatchToProps)(FindPlaceScreen);