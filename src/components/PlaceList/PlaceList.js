import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ListItem from '../ListItem/ListItem';

const PlaceList = props => {

  return (
    // FlatList is used for any dynamic or long list
    <FlatList 
      style={styles.listContainer}
      data={props.places} // required prop - must be an array
      renderItem={(info) => (
        <ListItem 
          placeName={info.item.name} // the place was saved in the value prop in App.js
          placeImage={info.item.image} 
          // this is passed down from the screen container component and pushes a new page to the stack with navigation
          onItemPressed={() => { props.onItemSelected(info.item.key) }} 
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    width: '100%' // use this to take up all horizontal space and not all the height instead of flex: 1
  }
});

export default PlaceList;