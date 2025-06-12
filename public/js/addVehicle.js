const invMake = document.querySelector("#inv_make");
const invModel = document.querySelector("#inv_model");
const invPrice = document.querySelector("#inv_price");
const invYear = document.querySelector("#inv_year");
const invMiles = document.querySelector("#inv_miles");
const addVehicle = document.querySelector("#add-vehicle");

//function to check if the input is 3 characters or more
function isValidLength(input) {
  return input.length >= 3;
}

//function to check if the input is a decimal or integer
function isValidNumber(input) {
  const numberPattern = /^-?\d+(\.\d+)?$/; // Matches integers and decimals
  return numberPattern.test(input);
}

//Function to check if the input is a valid year and is 4 digit long
function isValidYear(input) {
  const yearPattern = /^(19|20)\d{2}$/;
  return yearPattern.test(input);
}

//function to  if mileage is digits only
function isValidMileage(input) {
  const mileagePattern = /^\d+$/; // Matches digits only
  return mileagePattern.test(input);
}

//Add event listener to the input field to check for valid mileage
invMiles.addEventListener("input", function () {
  if (!isValidMileage(invMiles.value)) {
    invMiles.classList.add("error");
    invMiles.setCustomValidity("Mileage must be digits only.");
  } else {
    invMiles.classList.remove("error");
    invMiles.setCustomValidity("");
  }
});

// Add event listener to the input field to check for valid year
invYear.addEventListener("input", function () {
  if (!isValidYear(invYear.value)) {
    invYear.classList.add("error");
    invYear.setCustomValidity("Year must be a valid 4-digit year (1900-2099).");
  } else {
    invYear.classList.remove("error");
    invYear.setCustomValidity("");
  }
});

// Add event listener to the input is decimal or integer
invPrice.addEventListener("input", function () {
  if (!isValidNumber(invPrice.value)) {
    invPrice.classList.add("error");
    invPrice.setCustomValidity("Make must be a valid number.");
  } else {
    invPrice.classList.remove("error");
    invPrice.setCustomValidity("");
  }
});

// Add event listener to the input field to check for valid length
invMake.addEventListener("input", function () {
  if (!isValidLength(invMake.value)) {
    invMake.classList.add("error");
    invMake.setCustomValidity("Make must be at least 3 characters long.");
  } else {
    invMake.classList.remove("error");
    invMake.setCustomValidity("");
  }
});
// Add event listener to the input field to check for valid length
invModel.addEventListener("input", function () {
  if (!isValidLength(invModel.value)) {
    invModel.classList.add("error");
    invModel.setCustomValidity("Model must be at least 3 characters long.");
  } else {
    invModel.classList.remove("error");
    invModel.setCustomValidity("");
  }
});

// Add event listener to the add vehicle form
addVehicle.addEventListener("submit", function (event) {
  // Prevent form submission if there are validation errors
  if (
    !isValidMileage(invMiles.value) ||
    !isValidYear(invYear.value) ||
    !isValidNumber(invPrice.value) ||
    !isValidLength(invMake.value) ||
    !isValidLength(invModel.value)
  ) {
    event.preventDefault();
    alert("Please correct the errors in the form before submitting.");
  }
});
