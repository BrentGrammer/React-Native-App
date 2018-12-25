import { SET_PLACES, REMOVE_PLACE } from './actionTypes';
import { uiStartLoading, uiStopLoading, authGetToken } from './index';

export const addPlace = (placeName, location, image) => {
  return dispatch => {
    let authToken;
    dispatch(uiStartLoading());
    dispatch(authGetToken())
      .catch(() => {
        alert("something went wrong.");
      })
      .then(token => {
        authToken = token;
        //Note: the image file data is coming from the PickImage component which has a imageUri and base64 props
        // url to run cloud function is returned from firebase deploy in the terminal:
        // Note: auth is handled separately for cloud function endpoints - see functions/index.js and authorization header settings in the body of the request
        return fetch("https://console.firebase.google.com/project/react-practice-app-55aac/overview", {
          method: "POST",
          body: JSON.stringify({
            // cloud function expects an image prop on the body:
            image: image.base64
          }),
          // add authorization header to hold the token for verification in the cloud functin in functions/index.js
          headers: {
            // Note: casing doesn't matter in the header title - first letter is cap by convention
            "Authorization": "Bearer " + authToken
          }
        });
      })
 
    /** UPLOAD FILE TO STORAGE using Cloud function in functions/index.js **/
    .then(res => res.json())
    .then(parsedRes => {
      const placeData = {
        name: placeName,
        location,
        image: parsedImage.imageUrl // prop generated on response in backend in functions/index.js cloud function.
      };
      /** Now store data on the database **/
      // return fetch call to store the data in the firebase so you can chain more blocks at top level
      // note: in firebase you need to add a .json to the endpoint
      return fetch("https://react-practice-app-55aac.firebaseio.com/places.json?auth=" + authToken, {
        method: "POST",
        body: JSON.stringify(placeData)
      });
    })
    .then(res => res.json())
    .then(parsedRes => {
      console.log(parsedRes);
      dispatch(uiStopLoading());
    })
    .catch(err => {
      // add catch block at end of the chain to catch 4xx and 5xx in addition to network missing errs??
      // may not be correct - you may need to check res.ok prop in first fetch then block to get 4xx and 5xx errors
      console.log(err);
      alert("something went wrong")
      dispatch(uiStopLoading());
    });
  };
};

/** Get places from database and store them in redux store 
 * Called when Find Places component mounts which will retrieve the list from database in componentDidMount
 * use getState in the second arg to grab the token sent from firebase auth response.idToken which is stored in the redux store
*/
export const getPlaces = () => {
  return (dispatch, getState) => {
    dispatch(authGetToken())
      .then(token => {
        return fetch("https://react-practice-app-55aac.firebaseio.com/places.json?auth=" + token);
      })
      .catch(err => {
        alert("No valid token found.");
      })
      .then(res => res.json())
      .then(parsedRes => {
        //convert object returned from firebase to array
        const places = [];
        for (let key in parsedRes) {
          // returns { <fbkey>: { image, location, name }, <fbkey2>: { image, location, name } }
          places.push({
            ...parsedRes[key],
            // change structure to obj with uri prop since Image in ListItem expects that to be passed into source prop:
            image: {
              uri: parsedRes[key].image
            },
            key: key
          })
        }
        // send places to store so FindPlace.js can consume them to render the list
        dispatch(setPlaces(places));
      })
      .catch(err => {
        alert("something went wrong.");
        console.log(err);
      });
  }
};

export const setPlaces = places => {
  return {
    type: SET_PLACES,
    places
  };
};

// delete from firebase
export const deletePlace = (key) => {
  return (dispatch) => {
    dispatch(getAuthToken())
      .then(token => {
        // remove item from store immediately so don't wait for async op to complete if token is valid
        dispatch(removePlace(key));
        return fetch(`https://react-practice-app-55aac.firebaseio.com/places/${key}.json?auth=${token}`, {
          method: "DELETE"
        })
      })
      .catch(err => {
        alert("No valid token found.");
      })
      .then(res => res.json())
      .then(parsedRes => {
        console.log("Deteled.")
      })
      .catch(err => {
        //@TODO: Add code to restore the place to the store if delete fails from database
        // You could have a deleted places array which caches the place in case of a catch firing
        console.log(err);
        alert("Something went wrong");
        dispatch(uiStopLoading());
      });
    };
};

// remove place from redux store
export const removePlace = (key) => ({
  type: REMOVE_PLACE,
  key
});