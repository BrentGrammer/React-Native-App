import React from 'react';
import { 
  TouchableOpacity, 
  TouchableNativeFeedback, 
  Text, 
  View, 
  StyleSheet,
  Platform 
} from 'react-native';

const ButtonWithBackground = props => {

  //console.log(props);
  // store the identical jsx in a content variable:
  const content = (
    <View style={[
      styles.button, 
      { backgroundColor: props.color },
      props.disabled ? styles.disabled : null
    ]}>
      <Text style={props.disabled ? styles.disabled : null}>{props.children}</Text>
    </View>
  );
  if (props.disabled) {
    return content;
  }
  // conditionally render different jsx based on the platform OS:
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback onPress={props.onPress}>
        {content}
      </TouchableNativeFeedback>
    );
  }
  return (
    <TouchableOpacity onPress={props.onPress}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black"
  },
  disabled: {
    backgroundColor: '#eee',
    color: '#aaa',
    borderColor: '#aaa'
  },
  disabledText: {
    color: '#aaa'
  }
});

export default ButtonWithBackground;