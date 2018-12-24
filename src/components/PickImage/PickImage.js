import React, { Component } from 'react';
import { View, Image, Button, StyleSheet } from 'react-native';
import imagePlaceholder from '../../assets/background.jpg';
import ImagePicker from '../ImagePicker';

class PickImage extends Component {
  state = {
    pickedImage: null
  };

  pickImageHandler = () => {
    // builtin method with react-native-image-picker library to show menu to pick an image from photo lib
    ImagePicker.showImagePicker(
      {title: "Pick an Image"},
      // second arg is response from selection
      res => {
        // used props exposed by the library to check for cases to handle:
        if (res.didCancel) {
          console.log("User Cancelled.");
        } else if (res.error) {
          console.log("Error", res.error);
        } else {
          // <Image> component expects a uri property passed into source prop.  Set this so when it pulls from 
          // state it gets what it expects.
          this.setState({
            pickedImage: { uri: res.uri }
          });
          // forward the image to SharedPlace to set it in state:
          this.props.onImagePicked({ 
            uri: res.uri, 
            base64: res.data // base64 string representation of image to send over wire to store on server, etc.
          });
        }
      }
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Image source={this.state.pickedImage} style={styles.previewImage} />
        </View>
        <View style={styles.button}>
          <Button title="pick image" onPress={this.pickImageHandler} />
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

export default PickImage;