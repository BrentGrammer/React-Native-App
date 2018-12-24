import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

/** 
 * Note: the underlineColorAndroid is builtin for android text inputs. 
 */

const DefaultInput = props => (
  <TextInput 
    style={[
      styles.input, 
      props.style, 
      !props.valid && props.touched ? styles.invalid : null
    ]} // passing in style from parent overwrites the default styles previous in the array
    underlineColorAndroid="transparent" 
    {...props} // this allows you to pass any props that would normally be supported by TextInput without having to explicitly set and grab them here.
  />
);

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: "#eee",
    padding: 5,
    marginTop: 8,
    marginBottom: 8 // top/bottom marg used to not set left/right margin to keep input centered
  },
  invalid: {
    backgroundColor: '#f9c0c0',
    borderColor: 'red'
  }
});

export default DefaultInput;  