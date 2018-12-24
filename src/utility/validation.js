const validate = (val, rules, connectedValue) => {
  for (let rule in rules) {
    let isValid = true;
    switch(rule) {
      case "isEmail":
        // check isValid first so if another rule fails, this won't overwrite isValid
        isValid = isValid && emailValidator(val);
        break;
      case "minLength":
        // second arg passed in is getting the value of minLength in the rules object
        isValid = isValid && minLengthValidator(val, rules[rule]);
        break;
      case "equalTo":
        isValid = isValid && equalToValidator(val, connectedValue[rule]);
        break;
      case "notEmpty": 
        isValid = isValid && notEmptyValidator(val);
        break;
      default:
        isValid = true;
    }
    return isValid;
  }
};

const emailValidator = (val) => {
  // regex from stack overflow - catches most invalid emails
  return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
          .test(val);
};

const minLengthValidator = (val, minLength) => {
  return val.length >= minLength;
};

const equalToValidator = (val, checkVal) => {
  return val === checkVal;
};

const notEmptyValidator = val => {
  return val.trim() !== "";
};

export default validate;