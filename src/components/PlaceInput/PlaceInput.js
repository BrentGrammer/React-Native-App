import React from 'react';

import DefaultInput from '../UI/DefaultInput/DefaultInput';

const PlaceInput = props => {
 
    return (
      <DefaultInput 
        placeholder="place name" 
        value={props.placeData.value} 
        valid={props.placeData.valid}
        touched={props.placeData.touched}
        onChangeText={props.onChangeText} 
      />
    );
}

export default PlaceInput;