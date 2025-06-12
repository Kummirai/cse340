const classificationInput = document.querySelector("#classification");
const classificationNotice = document.querySelector(".classification-notice");
const classificationSubmit = document.querySelector("#classificationSubmit");
const invMake = document.querySelector("#inv_make");
const invModel = document.querySelector("#inv_model");
const invPrice = document.querySelector("#inv_price");
const invYear = document.querySelector("#inv_year");
const invMiles = document.querySelector("#inv_miles");

//function to  if mileage is digits only
function isValidMileage(input) {
  const mileagePattern = /^\d+$/; // Matches digits only
  return mileagePattern.test(input);
}

// Function to check if the input contains unwanted characters
function hasUnwantedCharacters(input) {
  const unwantedChars = /[^a-zA-Z]/;
  return unwantedChars.test(input);
}

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
  const yearPattern = /^(18|20)\d{2}$/;
  return yearPattern.test(input);
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
  if (!isValidNumber(invMake.value)) {
    invMake.classList.add("error");
    invMake.setCustomValidity("Make must be a valid number.");
  } else {
    invMake.classList.remove("error");
    invMake.setCustomValidity("");
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

// Add event listener to the input field to check for unwanted characters
classificationInput.addEventListener("input", function () {
  if (hasUnwantedCharacters(classificationInput.value)) {
    classificationInput.classList.add("error");
    classificationNotice.style.color = "red";
  } else {
    classificationInput.classList.remove("error");
    classificationNotice.style.color = "black";
  }
});

// Add event listener to the submit button to prevent form submission if unwanted characters are present
classificationSubmit.addEventListener("click", function (event) {
  if (hasUnwantedCharacters(classificationInput.value)) {
    event.preventDefault(); // Prevent form submission
    classificationNotice.textContent = "Please remove unwanted characters.";
    classificationNotice.style.color = "red";
    sendData();
  } else {
    classificationNotice.textContent =
      "Name must be alphabetic characters only.";
  }
});

// Function to send data to the server
const sendData = async () => {
  try {
    const response = await fetch("/inv/add-classification", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Success:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};
