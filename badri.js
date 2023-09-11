const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');


// Initialize Firebase and Firestore
const serviceAccount = require("./king.json");
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

// Serve static files
app.use(express.static('public'));

// Use bodyParser middleware to parse request bodies
app.use(bodyParser.json());

// Serve the web.html file directly
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/signup.html");
});

app.post("/login",async (req, res) => {
    // Handle login logic here
    const email = req.body.Email;
    const password = req.body.Password;
    
    try {
        const usersRef = db.collection("personal info");
        const snapshot = await usersRef.where("Email", "==", email).where("Password", "==", password).get();
        
        if (snapshot.empty) {
            // No matching user found
            const failureResponse = {
                success: false,
                message: "Login failed"
            };
            res.json(failureResponse);
        } else {
            // Matching user found, login successful
            const successResponse = {
                success: true,
                message: "Login successful"
            };
            res.json(successResponse);
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request."
        });
    }
});

app.post("/signupsubmit", (req, res) => {
    // Handle signup submit logic here
    const fullName = req.body.FullName;
    const email = req.body.Email;
    const password = req.body.Password;

    // Store user information in Firestore
    db.collection("personal info")
        .add({
            FullName: fullName,
            Email: email,
            Password: password,
        })
        .then(() => {
            const successResponse = {
                success: true,
                message: "Signup successful"
            };
            res.json(successResponse);
            
        })
        .catch(error => {
            console.error("Error adding document: ", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while processing your request."
            });
        });
});
// Handle news API request
app.get("/getNews", async (req, res) => {
    try {
        const apiKey = "1c55ebd80e684ed9b3427d7a5b4e8f2c"; // Replace with your actual API key
        const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
        
        const response = await axios.get(newsApiUrl);
        const newsData = response.data;

        res.json(newsData);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching news."
        });
    }
});

// ... Other routes ...

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
