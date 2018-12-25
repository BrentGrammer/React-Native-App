import React, { Component } from 'react';
import { 
  ActivityIndicator,
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ScrollView, 
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';

import { addPlace, startAddPlace } from '../../store/actions/index';
import PlaceInput from '../../components/PlaceInput/PlaceInput';
import MainText from '../../components/UI/MainText/MainText';
import HeadingText from '../../components/UI/HeadingText/HeadingText';
import PickImage from '../../components/PickImage/PickImage';
import PickLocation from '../../components/PickLocation/PickLocation';
import validate from '../../utility/validation';

class SharePlaceScreen extends Component {
  static navigatorStyle = {
    navButtonColor: "orange"
  };
  
  constructor(props) {
    super(props);
    // This is used to listen for events with RNN to open the side drawer screen.
    // This method listens for events fired by RNN which you can get in the argument and handle.
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
  }

  componentWillMount() {
    this.reset();
  }

  componentDidUpdate() {
    // check connected state flag which will fire this lifecycle method if it changes
    if (this.props.placeAdded) {
      // use RNN method to switch tabs:
      this.props.navigator.swithToTab({ tabIndex: 0});
      // reset the flag in store to false to prevent unexpected redirects on revisiting the tab:
      this.props.onStartAddPlace();
    }
  }

  // clears input and sets button back to disabled,  used for when share place finishes
  reset = () => {
    this.setState({
      controls: {
        placeName: {
          value: "",
          valid: false,
          touched: false,
          validationRules: {
            notEmpty: true
          }
        },
        // store location that user picks in PickLocation.js 
        location: {
          value: null,
          valid: false
        },
        image: {
          value: null,
          valid: false
        }
      }
    });
  };

  // listening for the NavBarButtonPress event will be an object with type and id onit.
  // the id needs to be assigned to the button to handle it in startMainTabs.js setup - add an id prop to the buttons. 
  onNavigatorEvent = (event) => {
    // check these events to reset the store flag for redirecting if user revisits tab 
    if (event.type === "ScreenChangedEvent" && event.id === "WillAppear") {
      // reset store placeAdded flag to false to prevent unexpected redirects
      this.props.onStartAddPlace();
    }
    if (event.type === 'NavBarButtonPress' && event.id === 'sideDrawerToggle') {
      this.props.navigator.toggleDrawer({
        side: "left" // need to set to left to avoid errors on android.
      });
    }
  };

  imagePickedHandler = () => {
    this.setState(prevState => {
      return {
        controls: {
          ...prevState.controls,
          image: {
            value: image,
            valid: true
          }
        }
      };
    })
  };

  // this is passed to PlaceInput to fire when a place is entered and get the value in state here
  placeNameChangedHandler = val => {
    this.setState(prevState => ({
      controls: {
        ...prevState.controls,
        placeName: {
          ...prevState.controls.placeName,
          value: val,
          valid: validate(val, prevState.controls.placeName.validationRules),
          touched: true
        }
      }
    }));
  };

  locationPickedHandler = (location) => {
    this.setState(prevState => {
      return {
        controls: {
          ...prevState.controls,
          location: {
            value: location,
            valid: true
          }
        }
      };
    })
  };

  // when user presses share place
  placeAddedHandler = () => {
    this.props.onPlaceAdded(
      this.state.controls.placeName.value,
      this.state.controls.location.value,
      this.state.controls.image.value
    ); 
    this.reset();
    // access ref set on image picker comp to use it's reset method to clear the image in it's state
    this.imagePicker.reset();
    // clears marker from map and resets to original location
    this.locationPicker.reset();
  };

  render() {
    let submitButton = (
      <Button 
        title="Share the place!" 
        onPress={this.placeAddedHandler} 
        disabled={
          !this.state.controls.placeName.valid || // don't enable submit unless user picks a location
          !this.state.controls.location.valid ||
          !state.controls.image.valid
        }
      />
    );

    if (this.props.isLoading) {
      submitButton = <ActivityIndicator />;
    }

    return (
      <KeyboardAvoidingView behavior={'padding'} style={{flex: 1}}>
        {/* you need to assign cotnainer flexbox props to a container child of ScrollView to avoid errors - 
        you cannot assign flex: 1 directly to ScrollView */}
        <MainText><HeadingText>Share a place with us!</HeadingText></MainText>
        <ScrollView>
          <View style={styles.container}>
            {/* Since this imported component has a View wrapper, you need to assign a width to it in that View wrapper to keep it 
                from shrinking (the rule from this container is blocked) 
                ref is used to access reset methods to clear state to defaults when share place is clicked
            */}
            <PickImage onImagePicked={this.imagePickedHandler} ref={ref => this.imagePicker = ref}/>
            <PickLocation onLocationPick={this.locationPickedHandler} ref={ref => this.locationPicker = ref} />
            <PlaceInput 
              placeData={this.state.controls.placeName} // pass all data in one object to avoid setting multiple props
              onChangeText={this.placeNameChangedHandler} 
            />
            <View style={styles.button}>
              {submitButton}
            </View>
          </View>
        </ScrollView> 
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  placeholder: {
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#eee",
    width: '80%',
    height: 150
  },
  button: {
    margin: 8
  },
  previewImage: {
    width: '100%', 
    height: '100%'
  }
});

const mapDispatchToProps = dispatch => ({
  onPlaceAdded: (placeName, location, image) => dispatch(addPlace(placeName, location, image)),
  onStartAddPlace: () => dispatch(startAddPlace())
});

const mapStateToProps = state => ({
  isLoading: state.ui.isLoading,
  placeAdded: state.places.placeAdded
});

export default connect(mapStateToProps, mapDispatchToProps)(SharePlaceScreen);