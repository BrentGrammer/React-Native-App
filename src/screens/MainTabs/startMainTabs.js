/**
 * SETUP FOR A TAB BASED APP
 *   use Navigation.startTabsBasedApp({ configObj });
 *   You need to pass a tabs prop into the config object which is an array of objects - you need at least a screen prop
 * **On ANDROID: You need to set a icon prop to display the tabs - this is not necessary on IOS.  
 *   react-native-vecor-icons comes with a helper on the Icon object to get the icon name, size and color.
 *   Normally you would use require('../path/to/img.jpg')
 */
import { Navigation } from 'react-native-navigation';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


/*
  wrap the start app call in a function that you will export so you can call it whenever you want.  Otherwise the 
  app will be started anytime and when you import the file.

  ***Whenever you execute startTabs now, react-native-navigation will replace the current navigation app started 
  (i.e. a singlePage) with this one.

  i.e. when you click a login button to get into the app and change screens, you may want to call this to change the 
  navigation to be tab based on the new screen. (this is imported on the AuthScreen to start when the user logs in)
*/

const startMainTabs = () => {

  // Icon.getImageSource is asynchronous - you execute it first to get the icon and then execute the start of the tab based
  // navigation app.
  Promise.all([
    Icon.getImageSource(Platform.OS === "android" ? "md-map" : "ios-map", 30),
    Icon.getImageSource(Platform.OS === "android" ? "md-share-alt" : "ios-share", 30),
    Icon.getImageSource(Platform.OS === "android" ? "md-menu" : "ios-menu", 30)
  ]).then(icons => {
    Navigation.startTabBasedApp({
      tabs: [
        {
          screen: "my-app.FindPlaceScreen",
          label: "Find Place", // <--label is the text in the tab at the bottom of the screen
          title: "Find Place",
          icon: icons[0],
          navigatorButtons: {
            leftButtons: [
              {
                icon: icons[2],
                title: "menu",
                id: "sideDrawerToggle" // the id needs to be assigned to the button to handle it with setOnNavigatorEvent() in the screens listening for it to toggle the side drawer. 
              }
            ]
          }
        },
        {
          screen: "my-app.SharePlaceScreen",
          label: "Share Place",
          title: "Share Place",
          icon: icons[1],
          navigatorButtons: {
            leftButtons: [
              {
                icon: icons[2],
                title: "menu",
                id: "sideDrawerToggle" 
              }
            ]
          }
        }
      ],
      tabsStyle: {
        tabBarSelectedButtonColor: "orange" // <-- this is for ios tab styling
      },
      drawer: {
        left: {
          screen: "my-app.SideDrawerScreen" 
        }
      },
      appStyle: {
        tabBarSelectedButtonColor: "orange" // <--This is for styling tab styles in android
      }
    });
  });
};

export default startMainTabs;



