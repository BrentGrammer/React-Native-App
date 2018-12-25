import { AsyncStorage } from "react-native";

import { TRY_AUTH, AUTH_SET_TOKEN } from "./actionTypes";
import {uiStartLoading, uiStopLoading} from "./index";
import startMainTabs from '../../screens/MainTabs/startMainTabs';

export const tryAuth = (authData, authMode) => {
  return dispatch => {
    dispatch(uiStartLoading());
    // The endpoints provided by Firebase for singing in and signing up a user are different (the request data and params are all the same)
    // set default url to be the login/sign in user endpoint:
    const apiKey = "apikeyhere";
    let url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=" + apiKey;
    // check authmode passed into authHandler in Auth screen from state to determine auth op to dispatch
    if (authMode === "signup") {
      // change endpoint to make request to to be the sign up url provided by firebase
      url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=" + apiKey;
    } 

    // endpoint exposed by firebase authentication - the payload for signup and login user endpoints is the same - the only difference is the url
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .catch(err => {
      console.log(err);
      alert("Something went wrong.");
      dispatch(uiStopLoading());
    })
    .then(res => {
      if (!res.ok) {
        dispatch(uiStopLoading());
        throw Error(response.statusText);
      }
      return res.json();
    })
    .then(parsedRes => {
      dispatch(uiStopLoading());
      // errors on response will not throw catch from Firebase.  You need to check for an error prop on the response.
      // the res obj will also have an idToken prop, which should contain a value, otherwise do not authenticate user
      if (!parsedRes.idToken) {
        alert("Auth failed. Please try again.");
      } else {
        // store idToken sent with response for auth both in redux and async storage:
        dispatch(authStoreToken(parsedRes.idToken, parsedRes.expiredIn));
        // start a tab app if user was created successfully in firebase
        // changes the navigation to tab based after login and replaces the current singlepage based navigation:
        startMainTabs();
      }
    })
    .catch(err => {
      console.log(err);
      dispatch(uiStopLoading());
    });
  };
};

// store idToken on response from firebase in store for auth
export const authSetToken = (token) => {
  return {
    type: AUTH_SET_TOKEN,
    token
  };
};

// store auth token in AsyncStorage in addition to redux store for access if app closes.
export const authStoreToken = (token, expiresIn) => {
  return dispatch => {
    dispatch(authSetToken(token));
    const now = new Date();
    const expireTime = now.getTime() + (expiresIn * 1000); //value is in secs on response, convert to millisecs for calc
    // key can be any string you want, then set the token as the value in the second arg.
    AsyncStorage.setItem("rn:auth:authToken", token);
    // need to parse to a string for storing since only string values are accepted
    AsyncStorage.setItem("rn:auth:expiration", expireTime.toString());
  };
};

// checks for token in AsyncStorage and stores in redux store
export const authGetToken = () => {
  return (dispatch, getState) => {
    const promise = new Promise((resolve, reject) => {
      const token = getState().auth.token;

      /*** THIS COMPLEX BLOCK FIRES TO CHECK ASYNC STORAGE IF NONE FOUND IN REDUX ***/
      if (!token) {
        // declare let to use in different then blocks
        let fetchedToken;
        // check async storage before rejecting totally:
        AsyncStorage.getItem("rn:auth:authToken")
          .catch(err => reject())
          .then(tokenFromStorage => {
            fetchedToken = tokenFromStorage;
            // need to check if null since catch will only catch timeout or connection related errors and not fire if token is null
            if (!tokenFromStorage) {
              reject();
              return;
            }
            // check the expiration date of token then:
            return AsyncStorage.getItem("rn:auth:expiration");
          })
          .then((expiration) => {
            // parse value into a date because it is stored as a string (convert to number and pass in to new date):
            const parsedExpiration = new Date(parseInt(expiration));
            const now = new Date();
            if (parsedExpiration > now) {
              // set it in redux if not expired
              dispatch(authSetToken(fetchedToken));
              resolve(fetchedToken);
            } else {
              reject();
            }
          })
          .catch(err => {
            reject();
          });
      } else {
        resolve(token);
      }
    });

    // add a catch block to the promise before returning to handle clearing the async storage if token/values stored are invalid
    // or expired.
    promise.catch(err => {
      authClearStorage();
    });
    return promise;
  };
};

// called in componentDidMount on AuthScreen
export const authAutoSignin = () => {
  return dispatch => {
    dispatch(authGetToken())
      .then(token => {
        startMainTabs();
      })
      .catch(err => console.log("Failed to get token."))
  };
};

export const authClearStorage = () => {
    AsyncStorage.removeItem("rn:auth:authToken");
    AsyncStorage.removeItem("rn:auth:expiration");
};