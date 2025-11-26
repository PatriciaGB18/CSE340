'use strict' 

// Get the form element based on its ID
const form = document.querySelector("#updateForm")

// Add an event listener to the form to detect any changes (input, select, textarea)
form.addEventListener("change", function () {
  // Find the submit button element
  const updateBtn = document.querySelector("button[type='submit']")
  
  // Remove the disabled attribute, enabling the button
  if (updateBtn) {
      updateBtn.removeAttribute("disabled")
  }
})