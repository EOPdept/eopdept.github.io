
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
  getDoc,
  updateDoc
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

    const portalRef = doc(db, "portal", "content");
    const portalSnap = await getDoc(portalRef);

    if (portalSnap.exists()) {
      const portalData = portalSnap.data();

      document.getElementById("patrol-content").textContent =
        portalData.patrol || "No patrol information added yet.";

      document.getElementById("calendar-content").textContent =
        portalData.calendar || "No meeting information added yet.";

      document.getElementById("documents-content").textContent =
        portalData.documents || "No documents added yet.";

      if (role === "admin") {
        document.getElementById("admin-editor").hidden = false;

        document.getElementById("patrol-input").value =
          portalData.patrol || "";

        document.getElementById("calendar-input").value =
          portalData.calendar || "";

        document.getElementById("documents-input").value =
          portalData.documents || "";
                document.getElementById("save-portal-button").onclick =
          async () => {
            const saveMessage =
              document.getElementById("save-message");

            saveMessage.textContent = "Saving...";

            try {
              await updateDoc(portalRef, {
                patrol:
                  document.getElementById("patrol-input").value,
                calendar:
                  document.getElementById("calendar-input").value,
                documents:
                  document.getElementById("documents-input").value
              });

              document.getElementById("patrol-content").textContent =
                document.getElementById("patrol-input").value ||
                "No patrol information added yet.";

              document.getElementById("calendar-content").textContent =
                document.getElementById("calendar-input").value ||
                "No meeting information added yet.";

              document.getElementById("documents-content").textContent =
                document.getElementById("documents-input").value ||
                "No documents added yet.";

              saveMessage.textContent = "Changes saved successfully.";
            } catch (error) {
              console.error("Error saving portal:", error);
              saveMessage.textContent =
                "Could not save changes. Please try again.";
            }
          };
      }
    }

    loginMessage.textContent =
      role === "admin"
        ? "Signed in successfully. Administrator access confirmed."
        : "Signed in successfully. Member access confirmed.";

    document.getElementById("login-form").hidden = true;
    document.getElementById("dashboard").hidden = false;

    document.getElementById("logout-button").onclick = async () => {
      await signOut(auth);
    };
  } catch (error) {
    loginMessage.textContent =
      "Could not verify your access. Please try again.";
  }
});
