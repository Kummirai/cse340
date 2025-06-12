document.addEventListener("DOMContentLoaded", function () {
  const classificationInput = document.querySelector("#classification");
  const classificationNotice = document.querySelector(".classification-notice");
  const classificationSubmit = document.querySelector("#classificationSubmit");

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

  // Function to check if the input contains unwanted characters
  function hasUnwantedCharacters(input) {
    const unwantedChars = /[^a-zA-Z]/;
    return unwantedChars.test(input);
  }

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
  if (classificationSubmit) {
    classificationSubmit.addEventListener("click", function (event) {
      if (hasUnwantedCharacters(classificationInput.value)) {
        event.preventDefault();
        classificationNotice.textContent = "Please remove unwanted characters.";
        classificationNotice.style.color = "red";
        sendData();
      } else {
        classificationNotice.textContent =
          "Name must be alphabetic characters only.";
      }
    });
  }
});
