/*
 * This file should contain code for the following tasks:
 * 1. Create a new account.
 * 2. Sign in an existing account.
 * 3. Redirect a user to chat.html once they are logged in/signed up.
 */

"use strict";

// Sign up
var signupForm = document.getElementById("signup-form");
var signupName = document.getElementById("signup-name");
var signupEmail = document.getElementById("signup-email");
var signupPassward = document.getElementById("signup-password");
var signupPasswordConfirm = document.getElementById("signup-password-confirm");
var signupError = document.getElementById("signup-error");

var isSignup = false;

signupForm.addEventListener("submit",  function(e) {
    e.preventDefault();

    // Remore error alert before it is triggered
    signupError.classList.remove("active");

    var userDisplayName = signupName.value;
    var email = signupEmail.value;
    var password = signupPassward.value;
    var passwordConfirm = signupPasswordConfirm.value;

    // md5 is a method to get hash for an image
    var userPhotoURL = "https://www.gravatar.com/avatar/" + md5(email);

    // Alert user
    // If passward and password confirm do not match
    if(password !== passwordConfirm) {
        signupError.classList.add("active");
        signupError.textContent = "Passwords do not match";

        // If user has a blank display name
    } else if (userDisplayName.length === 0) {
        signupError.classList.add("active");
        signupError.textContent = "Your display name cannot be blank";
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (user) {

            // Send verification email
            user.sendEmailVerification();

            isSignup = true;

            // Update user displayName and photoURL in firebase
            user.updateProfile({
                displayName: userDisplayName,
                photoURL: userPhotoURL
            });
        })
        .catch(function (error) {
            signupError.classList.add("active");
            signupError.textContent = error.message;
        });
    }
})

// Login
var loginForm = document.getElementById("login-form");
var loginEmail = document.getElementById("login-email");
var loginPassword = document.getElementById("login-password");
var loginButton = document.getElementById("login-button");
var loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    // Get user input of email and password
    var email = loginEmail.value;
    var password = loginPassword.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
    // If pass
    .then(function() {
        window.location.href = "chat.html";
    })
    // If not pass
    .catch(function(error) {
        loginError.classList.add("active");
        loginError.textContent = error.message;
    })
});

// Detect user state
firebase.auth().onAuthStateChanged(function(user) {

    // If there is a user object
    if(user != null) {
        // If the user is trying to sign up
        if(isSignup) {
            window.alert("Please check your email inbox and complete the verification");
        }
        
        // Always redirect to chat page if there is a user
        window.location.href = "chat.html";
    }
});