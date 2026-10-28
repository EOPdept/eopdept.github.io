
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Replace the placeholder values below with your own Firebase config.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    loginMessage.textContent =
      "Sign-in failed. Check your email and password, then try again.";
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginMessage.textContent = "";
    return;
  }

  try {
    const memberRef = doc(db, "members", user.uid);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists() || memberSnap.data().approved !== true) {
      await signOut(auth);
      loginMessage.textContent =
        "Your account has not been approved for this portal.";
      return;
    }

    const role = memberSnap.data().role;
    loginMessage.textContent =
      role === "admin"
        ? "Signed in successfully. Administrator access confirmed."
        : "Signed in successfully. Member access confirmed.";

    // We'll add the dashboard here in the next step.
  } catch (error) {
    loginMessage.textContent =
      "Could not verify your access. Please try again.";
  }
});
