import React, { Component } from 'react';
import { connect } from 'react-redux';
import { 
  View, 
  Text, 
  Button, 
  TextInput, 
  StyleSheet, 
  ImageBackground, 
  Dimensions,
  KeyboardAvoidingView,  // helper component that pushes view up when keyboard is pulled up.
  Keyboard, // API for closing keyboard when pulled up by clicking outside of it
  TouchableWithoutFeedback,
  ActivityIndicator 
} from 'react-native';
// import startMainTabs from '../MainTabs/startMainTabs'; this is now done in the auth action creators
import DefaultInput from '../../components/UI/DefaultInput/DefaultInput';
import HeadingText from '../../components/UI/HeadingText/HeadingText';
import MainText from '../../components/UI/MainText/MainText';
import backgroundImage from '../../assets/background.jpg';
import ButtonWithBackground from '../../components/UI/ButtonWithBackground/ButtonWithBackground';
import validate from "../../utility/validation";
import { tryAuth, authAutoSignin } from "../../store/actions/index";

class AuthScreen extends Component {

  state = {
    viewMode: Dimensions.get("window").height > 500 ? "portrait" : "landscape",
    authMode: "login",
    controls: {
      email: {
        value: "",
        valid: false,
        validationRules: {
          isEmail: true
        },
        touched: false
      },
      password: {
        value: "",
        valid: false,
        validationRules: {
          minLength: 6
        },
        touched: false
      },
      confirmPassword: {
        value: "",
        valid: false,
        validationRules: {
          equalTo: "password"
        },
        touched: false
      }
    }
  };
  
  constructor(props) {
    super(props);
    Dimensions.addEventListener("change", this.updateStyles);
  }

  // You need to detach the change listener to prevent memory leak
  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.updateStyles);
  }

  componentDidMount() {
    // this checks for token in async storage and sets it in store if app is closed and relaunches.  It will start main tabs app
    // if token is found and valid.
    this.props.onAutoSignin();
  }

  switchAuthModeHandler = () => {
    //toggle login/signup text on top switch button:
    this.setState(prevState => {
      return {
        authMode: prevState.authMode === "login" ? "signup" : "login"
      };
    });
  };

  updateStyles = (dims) => {
    this.setState({
      viewMode: dims.window.height > 500 ? "portrait" : "landscape"
    });
  }

  authHandler = () => {
    const authData = {
      email: this.state.controls.email.value,
      password: this.state.controls.password.value
    };
    // pass in a second arg which is a string to indicate handling a signup or login auth operation
    this.props.onTryAuth(authData, this.state.authMode);
    // changes the navigation to tab based after login and replaces the current singlepage based navigation:
    //startMainTabs(); -now done in auth action generators
  };

  // the key represents the property in the controls object in state (email, password, etc.)
  updateInputState = (key, value) => {
    let connectedValue = {};
    // check if equalTo prop exists to trigger handling the confirm password field
    if (this.state.controls[key].validationRules.equalTo) {
      // Need to get the value of password to pass in as connected value to check confirm password field in validation.
      const equalControl = this.state.controls[key].validationRules.equalTo;
      // equalControl will be 'password' since it is hard coded by default
      const equalValue = this.state.controls[equalControl].value;
      connectedValue = {
        ...connectedValue,
        equalTo: equalValue //<-- will be the password prop val in state
      }
    } 
    // check put in place for when user updates password after confirm password field is filled out.
    if (key === 'password') {
      connectedValue = {
        ...connectedValue,
        equalTo: value // <-- just getting the val entered by user in password field
      }
    }
    
    this.setState(prevState => {
      return {
        controls: {
          ...prevState.controls,
          // This updates the confirm password validation if password is modified after confirm password is filled out.
          confirmPassword: {
            ...prevState.controls.confirmPassword,
            valid: key === 'password' 
              ? validate(
                  prevState.controls.confirmPassword.value, 
                  prevState.controls.confirmPassword.validationRules, 
                  connectedValue
                )
              : prevState.controls.confirmPassword.valid
          },
          [key]: {
            ...prevState.controls[key],
            value,
            valid: validate(value, prevState.controls[key].validationRules, connectedValue),
            touched: true // flag set to false initially to prevent invalid styles being applied before user interaction
          }
        }
      }
    })
  };

  render() {
    let headingText = null;
    // flag to use for switching to login/logout forms
    let confirmPasswordControl = null;
    const { email, password, confirmPassword } = this.state.controls;

    let submitButton = (
      <ButtonWithBackground 
            color="#29aaf4" 
            onPress={this.authHandler}
            disabled={
              !email.valid || 
              !password.valid || 
              !confirmPassword.valid && this.state.authMode === "signup" // field is only present on signup form
            }
          >
            Submit
          </ButtonWithBackground>
    );

    if (this.props.isLoading) {
      submitButton = <ActivityIndicator />
    }
    // conditionally render the heading text if the device is not rotated.
    if (this.state.viewMode === "portrait") {
      headingText = (
        <MainText>
          <HeadingText>Please Login</HeadingText>
        </MainText>
      )
    }
    // hide confirm password field if on login form
    if (this.state.authMode === "signup") {
      confirmPasswordControl = (
        <View 
          style={
            this.state.viewMode === "portrait" 
              ? styles.portraitPasswordWrapper
              : styles.landscapePasswordWrapper
          }
        >
          <DefaultInput 
            placeholder="Confirm Password" 
            style={styles.input} 
            value={this.state.controls.confirmPassword.value}
            onChangeText={(val) => this.updateInputState('confirmPassword', val)}
            valid={this.state.controls.confirmPassword.valid}
            touched={this.state.controls.confirmPassword.touched}
            secureTextEntry // from react-native - hide text for password fields
          />
        </View>
      );
    }

    return (
      <ImageBackground 
        source={backgroundImage} 
        style={styles.backgroundImage}
      >
        <KeyboardAvoidingView 
          style={styles.container}
          behavior="padding"
        >
          {headingText}
          <ButtonWithBackground 
            color="#29aaf4"
            onPress={this.switchAuthModeHandler}
          >
            Switch To {this.state.authMode === "login" ? "Signup" : "Login"}
          </ButtonWithBackground>
          {/* Put inputs in separate container and set their width to 100% - you can reuse them in any container View and 
              just set the width on the container.
              
              ***Setting the input styles here will overwrite the default styles set in the DefaultInput.js component

              Wrap these with a touchable component to close the keyboard when pressed outside of it
          */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inputContainer}>
              <DefaultInput 
                placeholder="E-mail Address" 
                style={styles.input} 
                value={this.state.controls.email.value}
                onChangeText={(val) => this.updateInputState('email', val)}
                valid={this.state.controls.email.valid}
                touched={this.state.controls.email.touched} // prevent invalid styles before user interaction
                // react-native attributes you can use with TextInput to configure behavior of the keyboard:
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              <View 
                style={ 
                  // whenever in login form, you always want the portrait styles to apply (since confirm password is not present)
                  this.state.viewMode === "portrait" || this.state.authMode === "login"
                    ? styles.portraitPasswordContainer 
                    : styles.landscapePasswordContainer
                }
              >
                <View 
                  style={
                    this.state.viewMode === "portrait" || this.state.authMode === "login"
                      ? styles.portraitPasswordWrapper
                      : styles.landscapePasswordWrapper
                  }>
                  <DefaultInput 
                    placeholder="Password" 
                    style={styles.input} 
                    value={this.state.controls.password.value}
                    onChangeText={(val) => this.updateInputState('password', val)}
                    valid={this.state.controls.password.valid}
                    touched={this.state.controls.password.touched}
                    // react-native attributes can be used with TextInput:
                    secureTextEntry={true}
                  />
                </View>
                {confirmPasswordControl}
              </View>
            </View>
          </TouchableWithoutFeedback>
          {submitButton}
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  backgroundImage: {
    width: '100%',
    flex: 1
  },
  inputContainer: {
    width: '80%'
  },
  input: {
    backgroundColor: "#eee",
    borderColor: "#bbb"
  },
  landscapePasswordContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  portraitPasswordContainer: {
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  landscapePasswordWrapper: {
    width:  '45%' // restirct width had to be added because when screen rotated, fields were too big.
  },
  portraitPasswordWrapper: {
    width:  '100%' 
  }
});

const mapStateToProps = state => ({
  isLoading: state.ui.isLoading
});

const mapDispatchToProps = dispatch => ({
  onTryAuth: (authData, authMode) => dispatch(tryAuth(authData, authMode)),
  onAutoSignin: () => dispatch(authAutoSignin())
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthScreen);