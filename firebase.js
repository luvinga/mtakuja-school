// Firebase is loaded via CDN script tags in each HTML file.
// This file initializes Firebase and exposes the Firestore instance globally.

const firebaseConfig = {
    apiKey: "AIzaSyBDDXuihAUcRqlK0OG60Lgg-hjlp4sPXn8",
    authDomain: "mtakuja-school.firebaseapp.com",
    projectId: "mtakuja-school",
    storageBucket: "mtakuja-school.firebasestorage.app",
    messagingSenderId: "86459213742",
    appId: "1:86459213742:web:66e3877f732065af504a3f"
};

firebase.initializeApp(firebaseConfig);

// Global Firestore instance — used by script.js and page-level scripts
var db = firebase.firestore();

// Global Storage instance
var storage = firebase.storage();
