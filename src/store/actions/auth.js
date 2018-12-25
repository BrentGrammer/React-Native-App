import { AsyncStorage } from "react-native";

import { TRY_AUTH, AUTH_SET_TOKEN, AUTH_REMOVE_TOKEN } from "./actionTypes";
import {uiStartLoading, uiStopLoading} from "./index";
import startMainTabs from '../../screens/MainTabs/startMainTabs';

// import call to start single page app from App.js to use for logging user out:
import App from "../../../App";

const API_KEY = "api key goes here";

export const tryAuth = (authData, authMode) => {
  return dispatch => {
    dispatch(uiStartLoading());
    // The endpoints provided by Firebase for singing in and signing up a user are different (the request data and params are all the same)
    // set default url to be the login/sign in user endpoint:
    let url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=" + API_KEY;
    // check authmode passed into authHandler in Auth screen from state to determine auth op to dispatch
    if (authMode === "signup") {
      // change endpoint to make request to to be the sign up url provided by firebase
      url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=" + API_KEY;
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
        // store idToken sent with response for auth both in both redux and async storage and pass in:
        const { idToken, expiredIn, refreshToken } = parsedRes;
        dispatch(authStoreToken(idToken, expiredIn, refreshToken));
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
export const authSetToken = (token, expireTime) => {
  return {
    type: AUTH_SET_TOKEN,
    token,
    expiration: expireTime
  };
};

// this action generator bundles or batches storing the token in both the redux store and in AsyncStorage.
// args are props on the res object from firebase auth endpoint calls: idToken, expiresIn, refreshToken
export const authStoreToken = (token, expiresIn, refreshToken) => {
  return dispatch => {
    const now = new Date();
    const expireTime = now.getTime() + (expiresIn * 1000); //value is in secs on response, convert to millisecs for calc
    // dispatch action to store it in redux as well here:
    dispatch(authSetToken(token, expireTime));
    // key can be any string you want, then set the token as the value in the second arg.
    AsyncStorage.setItem("rn:auth:authToken", token);
    // need to parse to a string for storing since only string values are accepted
    AsyncStorage.setItem("rn:auth:expiration", expireTime.toString());
    AsyncStorage.setItem("rn:auth:refreshToken", refreshToken);
  };
};

// checks for token in AsyncStorage and stores in redux store on app re-launch for example
export const authGetToken = () => {
  return (dispatch, getState) => {
    const promise = new Promise((resolve, reject) => {
      // retrieve from redux store first:
      const token = getState().auth.token;
      const expiration = getState().auth.expiration;

      /*** THIS COMPLEX BLOCK FIRES TO CHECK ASYNC STORAGE IF NONE FOUND IN REDUX ***/

      // You need to check for null token in redux, but also that the expiration date is not valid (in the past) so that the
      // refresh token process and async storage get token operations will fire if there is a token, but it's expired. 
      // Note: the value in redux is a number in millsecs - need to wrap in new Date() to compare to now date
      if (!token || new Date(expiration) <= new Date()) {
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
            // parse value into a date because it is stored as a string in async storage (convert to number and pass in to new date):
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
            //this will fire the promise.catch block to request a refresh token
            reject();
          });
      } else {
        resolve(token);
      }
    });

    // add a catch block to the promise before returning to handle clearing the async storage if token/values stored are invalid
    // or expired and to use a refresh token to get a new valid token.
    return promise
      .catch(err => {
        // return this block so that the .then block to check token is not run before this finishes.
        return AsyncStorage.getItem("rn:auth:refreshToken")
          .then(refreshToken => {
            // make req using the refreshtoken to get a new valid token:
            return fetch("https://securetoken.googleapis.com/v1/token?key=" + API_KEY, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              // note that the body must be in encoded form format and not json
              body: "grant_type=refresh_token&refresh_token=" + refreshToken
            })
          })
          .then(res => res.json())
          .then(parsedRes => {
            const { id_token, expires_in, refresh_token } = parsedRes;
            // the new id token will be on the id_token prop from refresh token req response
            if (id_token) {
              // store the new token and data received:
              dispatch(authStoreToken(id_token, expires_in, refresh_token));
              // return the token so that authAutoSignin can use it and pass it on to the next block to check if null or valid
              return id_token;
            } else {
              authClearStorage();
            }
          });
    })
    .then(token => {
      // this ensures that the catch block in authAutoSignin will fire if the token is null or invalid
      if (!token) {
        throw new Error();
      } else {
        // return valid token for authAutoSignin to use
        return token;
      }
    });

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
    // return this to be able to chain a then in the logout action so that it only runs after the storage is cleared to prevent
    // a loop keeping the user logged in if storage wasn't cleared in time.
    return AsyncStorage.removeItem("rn:auth:refreshToken");
};

export const authLogout = () => {
  return dispatch => {
    authClearStorage()
      .then(() => {
        // only call the auth screen app to load after storage is cleared
        // execute the imported wrapped call to start a single page app from App.js for the auth screen when user signs out:
        App();
      });
    dispatch(authRemoveToken());
  };
};

//removes token from the redux store (sets it to null):
export const authRemoveToken = () => {
  return {
    type: AUTH_REMOVE_TOKEN
  };
};