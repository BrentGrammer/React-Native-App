import React, { Component } from 'react';
import { connect } from 'react-redux';
// NOTE: Dimensions helper that allows you to dynamically find out the dimensions of the device the program is running on.
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authLogout }  from "../../store/actions/index";

/**
 * Note: there is a bug in android where you need to explicitly set the width of the drawer to make it work.
 *   set the width of the drawer in SideDrawer.js component using the Dimensions helper to get the width of the window and 
 *   multiply it by a decimal to make the drawer take up a percentage of the window.
 * 
 * The code in style makes the drawer 80% of window width 
 */

class SideDrawer extends Component {
  render() {
    return (
      // to combine styles you can pass an array of styles
      // note - the dimensions calculation is left inline to dynamically calculate if device is rotated.
      <View style={[styles.container, { width: Dimensions.get("window").width * 0.8 }]}> 
        <TouchableOpacity onPress={this.props.onLogout}>
          <View style={styles.drawerItem}>
            <Icon 
              name={Platform.OS === "android" ? "md-log-out" : "ios-log-out"} size={30} 
              color="#aaa" 
              style={styles.drawerItemIcon} 
            />
            <Text>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    backgroundColor: 'white', // <-- removes transparency on drawer on android
    flex: 1 //<-- makes drawer take the full available height
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee"
  },
  drawerItemIcon: {
    marginRight: 10,
    padding: 10
  }
});

const mapDispatchToProps = dispatch => ({
  onLogout: () => dispatch(authLogout())
});

export default connect(null, mapDispatchToProps)(SideDrawer);