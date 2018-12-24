import { SET_PLACES, REMOVE_PLACE } from './actionTypes';
import { uiStartLoading, uiStopLoading } from './ui';

export const addPlace = (placeName, location, image) => {
  return dispatch => {
    dispatch(uiStartLoading());
 
    /** UPLOAD FILE TO STORAGE using Cloud function in functions/index.js **/

//Note: the image file data is coming from the PickImage component which has a imageUri and base64 props
    // url to run cloud function is returned from firebase deploy in the terminal:
    fetch("https://console.firebase.google.com/project/react-practice-app-55aac/overview", {
      method: "POST",
      body: JSON.stringify({
        // cloud function expects an image prop on the body:
        image: image.base64
      })
    })
    .catch(err => {
      console.log(err);
      alert("Something went wrong");
      dispatch(uiStopLoading());
    })
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
      return fetch("https://react-practice-app-55aac.firebaseio.com/places.json", {
        method: "POST",
        body: JSON.stringify(placeData)
      });
    })
    // NOTE: 4xx and 5xx will not be caught! only Network Request failures are caught
    .catch(err => {
      console.log(err);
      // not ideal for errors, but beter than nothing - can use redux or state for error msgs as well
      alert("Something went wrong");
      dispatch(uiStopLoading());
    })
    .then(res => res.json())
    .then(parsedRes => {
      console.log(parsedRes);
      dispatch(uiStopLoading());
    })
    .catch(err => {
      // add catch block at end of the chain to catch 4xx and 5xx in addition to network missing errs
      console.log(err);
      alert("something went wrong")
      dispatch(uiStopLoading());
    });
  };
};

/** Get places from database and store them in redux store 
 * Called when Find Places component mounts which will retrieve the list from database in componentDidMount
*/
export const getPlaces = () => {
  return dispatch => {
    return fetch("https://react-practice-app-55aac.firebaseio.com/places.json")
      .catch(err => {
        alert("something went wrong.");
        console.log(err);
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
  return dispatch => {
    // remove item from store immediately so don't wait for async op to complete
    dispatch(removePlace(key));
    fetch(`https://react-practice-app-55aac.firebaseio.com/places/${key}.json`, {
      method: "DELETE"
    })
    .catch(err => {
      //@TODO: Add code to restore the place to the store if delete fails from database
      // You could have a deleted places array which caches the place in case of a catch firing
      console.log(err);
      alert("Something went wrong");
      dispatch(uiStopLoading());
    })
    .then(res => res.json())
    .then(parsedRes => {
      console.log("Deteled.")
    });
  };
};

// remove place from redux store
export const removePlace = (key) => ({
  type: REMOVE_PLACE,
  key
});