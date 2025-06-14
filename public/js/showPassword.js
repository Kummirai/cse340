const showPassordBtn = document.querySelector("#show-password");
const passwordField = document.querySelector("#account_password");

function showPassword() {
  if (passwordField.type === "password") {
    passwordField.type = "text";
    showPassordBtn.textContent = "Hide Password";
  } else {
    passwordField.type = "password";
    showPassordBtn.textContent = "Show Password";
  }
}
showPassordBtn.addEventListener("click", () => {
  showPassword();
});

// Password validation function
function validatePassword(password) {
  const minLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!minLength) {
    return {
      valid: false,
      message: "Password must be at least 12 characters long.",
    };
  }

  if (!hasUpperCase) {
    return {
      valid: false,
      message: "Password must contain at least one capital letter.",
    };
  }

  if (!hasNumber) {
    return {
      valid: false,
      message: "Password must contain at least one number.",
    };
  }

  if (!hasSpecialChar) {
    return {
      valid: false,
      message: "Password must contain at least one special character.",
    };
  }

  return {
    valid: true,
    message: "Password is valid.",
  };
}

// Add real-time feedback as user types
passwordField.addEventListener("input", function () {
  const password = this.value;
  const validation = validatePassword(password);
  const errorElement = document.getElementById("passwordError");

  if (password.length > 0) {
    if (!validation.valid) {
      errorElement.textContent = validation.message;
      errorElement.style.display = "block";
    } else {
      errorElement.textContent = "Password meets all requirements!";
      errorElement.style.color = "green";
      errorElement.style.display = "block";
    }
  } else {
    errorElement.style.display = "none";
  }
});

// Example usage in a form submission
document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    const password = document.getElementById("account_password").value;
    const validation = validatePassword(password);

    if (!validation.valid) {
      e.preventDefault(); // Prevent form submission
      alert(validation.message); // Show error message
    }
  });
