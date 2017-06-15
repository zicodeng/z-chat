/*
 * This file should contain code for the following tasks:
 * 1. Display the list of chat messages.
 * 2. Send a new message.
 * 3. Allow a user to edit and delete their own messages.
 * 4. Allow a user to log out.
 * 5. Redirect a user to index.html if they are not logged in.
 */

"use strict";

firebase.auth().onAuthStateChanged(function (user) {

    // Get ul element in html, so we can append child to it later
    var chatMessage = document.getElementById("chat-message");

    // If there is a user
    if(user) {

        var nameOnPage = document.getElementById("user-display-name");
        nameOnPage.innerText = "Hi! " + user.displayName;

        // Connect to database and channel
        var database = firebase.database();
        // ref refers to the root of database
        var messages = database.ref("channels/general");

        // Collect data from user
        var messageForm = document.getElementById("message-form");
        var messageInput = document.getElementById("message-input");

        // When user submits the form to send a message, push it to firebase
        messageForm.addEventListener("submit", function(e) {
            e.preventDefault();

            if(user.emailVerified) {
                // Get user input content
                var message = messageInput.value;

                // Push a new message to database
                messages.push({
                    text: message,
                    timestamp: new Date().getTime(),
                    email: user.email,
                    photoURL: user.photoURL,
                    displayName: user.displayName
                })
                .then(function() {
                    // Clear typing area after submit successfully
                    messageForm.reset();
                    messageInput.focus();
                    messageInput.select();
                })
                .catch(function() {
                    window.alert(error);
                });
            } else {
                window.alert("Please verify your email before you send");
                messageForm.reset();
                messageInput.focus();
                messageInput.select();
            }
        });

        // For each data, create html elements and display them on page
        // Data here means each data in the database
        messages.on("child_added", function(data) {

            // Get key and val of data
            var id = data.key;
            var message = data.val();

            // Get text and timestamp of each message
            var text = message.text;
            var timestamp = message.timestamp;
            var userEmail = message.email;
            var userPhotoURL = message.photoURL;
            var userDisplayName = message.displayName;

            // Create li for each chat message
            var messageLi = document.createElement("li");
            messageLi.id = id;

            var imgDiv = document.createElement("div");
            imgDiv.setAttribute("class", "profile-img");
            var img = document.createElement("img");
            img.setAttribute("src", userPhotoURL);
            imgDiv.appendChild(img);

            // Create p for display name
            var messageDisplayName = document.createElement("h2");
            messageDisplayName.innerText = userDisplayName;

            // Create p for message text
            var messageText = document.createElement("p");
            messageText.id = id + "messageText";
            messageText.innerText = text;

            // Create p for timestamp
            var messageTimestamp = document.createElement("p");
            messageTimestamp.innerText = moment(timestamp).format("lll");

            // Edit message
            var editButton = document.createElement("button");
            editButton.classList.add("btn-success", "btn-block", "hidden");
            editButton.setAttribute("type", "click");
            editButton.innerText = "Edit";

            var editForm = document.getElementById("edit-form");
            var editInput = document.getElementById("edit-input");
            editForm.classList.add("hidden");

            editButton.addEventListener("click", function(e) {
                if(user.emailVerified) {
                    e.preventDefault();
                    
                    messageForm.classList.add("hidden");
                    editForm.classList.remove("hidden");

                    editInput.focus();
                    editInput.select();

                    // Set initial input value to user message text
                    editInput.innerText = messageText.innerText;
        
                    // When user clicks edit button
                    editForm.addEventListener("submit", function(e) {
                        e.preventDefault();

                        var editedMessage = editInput.value;

                        data.ref.update({
                            text: editedMessage,
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        })
                        .then(function () {
                            // Clear typing area after edit successfully
                            editForm.reset();
                            messageInput.focus();
                            messageInput.select();

                            editForm.classList.add("hidden");
                            messageForm.classList.remove("hidden");
                        })
                        .catch(function(error) {
                            window.alert(error);
                        })
                    });
                } else {
                    window.alert("Please verify your email before you edit");
                }
            });
            
            // Allow user to delete message
            var deleteButton = document.createElement("button");
            deleteButton.classList.add("btn-danger", "btn-block", "hidden");
            deleteButton.setAttribute("type", "submit");
            deleteButton.innerText = "Delete";

            // Ask user to confirm deletion
            var deleteAlert = document.createElement("div");
            deleteAlert.classList.add("alert", "alert-danger");
            deleteAlert.setAttribute("role", "alert");
            deleteAlert.textContent = "Are you sure to delete this message?";

            // Delete confirm button
            var deleteConfirmButton = document.createElement("button")
            deleteConfirmButton.classList.add("btn-danger", "btn-block", "hidden");
            deleteConfirmButton.setAttribute("type", "click");
            deleteConfirmButton.innerText = "Confirm to delete";

            // Delete discard button
            var deleteDiscardButton = document.createElement("button")
            deleteDiscardButton.classList.add("btn-success", "btn-block", "hidden");
            deleteDiscardButton.setAttribute("type", "click");
            deleteDiscardButton.innerText = "Discard delete";

            deleteButton.addEventListener("click", function() {
                if(user.emailVerified) {
                    deleteAlert.classList.add("active");
                    deleteConfirmButton.classList.remove("hidden");
                    deleteDiscardButton.classList.remove("hidden");

                    deleteConfirmButton.addEventListener("click", function() {
                        // Delete on firebase
                        data.ref.remove();
                        // Delete on page
                        messageLi.remove();
                    });

                    deleteDiscardButton.addEventListener("click", function() {
                        deleteAlert.classList.remove("active");
                        deleteConfirmButton.classList.add("hidden");
                        deleteDiscardButton.classList.add("hidden");
                    });
                } else {
                    window.alert("Please verify your email before you delete");
                }
            }); 
            
            // User can only modify messages created by himself
            if(user.email === userEmail) {
                deleteButton.classList.remove("hidden");
                editButton.classList.remove("hidden")
            }
    
            // Append elements to html
            messageLi.appendChild(imgDiv);
            messageLi.appendChild(messageDisplayName);
            messageLi.appendChild(messageTimestamp);
            messageLi.appendChild(messageText);
            messageLi.appendChild(editButton);
            messageLi.appendChild(deleteButton);
            messageLi.appendChild(deleteAlert);
            messageLi.appendChild(deleteConfirmButton);
            messageLi.appendChild(deleteDiscardButton);
            chatMessage.appendChild(messageLi);

            // Scroll to bottom of the chat div when page loads
            var chatDiv = document.querySelector(".chat");
            chatDiv.scrollTop = chatDiv.scrollHeight;
            
        });

        // If User delete a message on firebase, we want to reflect this change on our page
        messages.on("child_removed", function(data) {
            var removeLi = document.getElementById(data.key);
            removeLi.remove();
        });

         // Detect user edit
        messages.on("child_changed", function(data) {
            var message = data.val();
            var messageText = document.getElementById(data.key + "messageText");
            messageText.innerText = message.text;
        });

        // Allow user to log out.
        var logoutButton = document.getElementById("logout-button");
        logoutButton.addEventListener("click", function() {
            firebase.auth().signOut();
            window.location.href = "index.html";
        });
    } else {
        // If there is no user
        // Redirect to index.html if they are not logged in.
        window.location.href = "index.html";
    }
});