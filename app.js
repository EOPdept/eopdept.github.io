
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
  apiKey: "AIzaSyCreHLfjPFC_LNaXS41qQHdF3XjXMOVcZg",
  authDomain: "eoporganizationportal.firebaseapp.com",
  projectId: "eoporganizationportal",
  appId: "1:411434320038:web:c22752d2f9d19edbec3467"
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
    document.getElementById("login-form").hidden = false;
    document.getElementById("dashboard").hidden = true;
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

    document.getElementById("login-form").hidden = true;
    document.getElementById("dashboard").hidden = false;

    document.getElementById("logout-button").onclick = async () => {
      await signOut(auth);
    };
    // We'll add the dashboard here in the next step.
  } catch (error) {
    loginMessage.textContent =
      "Could not verify your access. Please try again.";
  }
});
