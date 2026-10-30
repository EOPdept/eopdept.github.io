
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
loginMessage.style.color = "#711B32";
  
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
    console.log("Signed-in user:", user.uid);
    console.log("Checking member document...");

const memberRef = doc(db, "members", user.uid);
const memberSnap = await getDoc(memberRef);

console.log("Member document retrieved:", memberSnap.exists());

    if (!memberSnap.exists() || memberSnap.data().approved !== true) {
      await signOut(auth);
      loginMessage.textContent =
        "Your account has not been approved for this portal.";
      return;
    }

    const role = memberSnap.data().role;

    document.querySelectorAll(".patrol-table td").forEach((cell) => {
  cell.contentEditable = role === "admin";
  cell.setAttribute("spellcheck", "false");
});

    portalRef = doc(db, "portal", "content");
    const portalSnap = await getDoc(portalRef);

    if (portalSnap.exists()) {
      const portalData = portalSnap.data();

const savedTables = portalData.patrolTables || [];

document.querySelectorAll(".patrol-table").forEach((table, tableIndex) => {
  const savedCells = savedTables[tableIndex] || {};

  table.querySelectorAll("td[data-cell]").forEach((cell) => {
    const cellId = cell.dataset.cell;
    cell.textContent = savedCells[cellId] || "";
  });
});
   
notes = Array.isArray(portalData.notes) ? portalData.notes : [];
documents = Array.isArray(portalData.documents)
  ? portalData.documents
  : [];

renderNotes();
renderDocuments();

      document.getElementById("admin-editor").hidden = role !== "admin";

meetings = portalData.meetings || [];
window.renderCalendar();

if (role === "admin") {
  document.getElementById("admin-editor").hidden = false;
  renderMeetingEditor();
       


        
                document.getElementById("save-portal-button").onclick =
          async () => {
            const saveMessage =
              document.getElementById("save-message");

            saveMessage.textContent = "Saving...";

            try {
              const tableData = Array.from(
  document.querySelectorAll(".patrol-table"),
  (table) => {
    const cells = {};

    table.querySelectorAll("td[data-cell]").forEach((cell) => {
      cells[cell.dataset.cell] = cell.textContent.trim();
    });

    return cells;
  }
);
              await updateDoc(portalRef, {
  patrolTables: tableData,
meetings: meetings,
notes: notes,
documents: documents
});



            
              

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
  console.error("Access verification error:", error);

  loginMessage.textContent =
    "Verification error: " +
    (error.code || "unknown") +
    " — " +
    (error.message || String(error));
}
});

function renderNotes() {
  const list = document.getElementById("notes-list");
  const editorList = document.getElementById("notes-editor-list");

  list.replaceChildren();
  editorList.replaceChildren();

  if (notes.length === 0) {
    return;
  }

  notes.forEach((note, index) => {
    const item = document.createElement("div");

    const title = document.createElement("h5");
    title.textContent = note.title;

    const content = document.createElement("p");
    content.textContent = note.content;

    item.appendChild(title);
    item.appendChild(content);
    list.appendChild(item);

    const editorItem = document.createElement("div");
    editorItem.className = "meeting-editor-item";

    const editorTitle = document.createElement("span");
    editorTitle.textContent = note.title;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      notes.splice(index, 1);
      renderNotes();
    });

    editorItem.appendChild(editorTitle);
    editorItem.appendChild(removeButton);
    editorList.appendChild(editorItem);
  });
}

function renderDocuments() {
  const list = document.getElementById("documents-list");
  const editorList = document.getElementById("documents-editor-list");
  editorItem.className = "meeting-editor-item";

  list.replaceChildren();
  editorList.replaceChildren();

  if (documents.length === 0) {
    return;
  }

  documents.forEach((documentItem, index) => {
    const link = document.createElement("a");
    link.textContent = documentItem.title;
    link.href = documentItem.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const item = document.createElement("p");
    item.appendChild(link);
    list.appendChild(item);

    const editorItem = document.createElement("div");
    const editorTitle = document.createElement("span");
    editorTitle.textContent = documentItem.title;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      documents.splice(index, 1);
      renderDocuments();
    });

    editorItem.appendChild(editorTitle);
    editorItem.appendChild(removeButton);
    editorList.appendChild(editorItem);
  });
}

function renderMeetingEditor() {
  const list = document.getElementById("meeting-editor-list");
  if (!list) return;

  list.replaceChildren();

  if (meetings.length === 0) {
    list.textContent = "No meetings added yet.";
    return;
  }

  meetings.forEach((meeting, index) => {
    const item = document.createElement("div");
    item.className = "meeting-editor-item";

    const details = document.createElement("div");
details.className = "meeting-editor-details";

const title = document.createElement("strong");
title.textContent = meeting.title;

const date = document.createElement("small");
date.textContent = meeting.date;

details.appendChild(title);
details.appendChild(date);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", async () => {
  meetings.splice(index, 1);

  renderMeetingEditor();
  window.renderCalendar();

  try {
    await updateDoc(portalRef, { meetings: meetings });
  } catch (error) {
    console.error("Error removing meeting:", error);
    alert("Could not save meeting removal. Please try again.");
  }
});

    item.appendChild(details);
    item.appendChild(removeButton);
    list.appendChild(item);
  });
}


document.getElementById("add-meeting-button").addEventListener("click", async () => {
  const dateInput = document.getElementById("meeting-date-input");
  const titleInput = document.getElementById("meeting-title-input");

  const date = dateInput.value;
  const title = titleInput.value.trim();

  if (!date || !title) {
    alert("Please select a date and enter a meeting title.");
    return;
  }

  meetings.push({ date, title });

meetings.sort((a, b) => a.date.localeCompare(b.date));

dateInput.value = "";
titleInput.value = "";

renderMeetingEditor();
window.renderCalendar();

try {
  await updateDoc(portalRef, { meetings: meetings });
} catch (error) {
  console.error("Error saving meeting:", error);
  alert("Could not save meeting. Please try again.");
}
});

document.getElementById("add-note-button").addEventListener("click", () => {
  const titleInput = document.getElementById("note-title-input");
  const contentInput = document.getElementById("note-content-input");

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Please enter both a note title and its content.");
    return;
  }

  notes.push({ title, content });

  titleInput.value = "";
  contentInput.value = "";

  renderNotes();
});
document.getElementById("add-document-button").addEventListener("click", () => {
  const titleInput = document.getElementById("document-title-input");
  const linkInput = document.getElementById("document-link-input");

  const title = titleInput.value.trim();
  const url = linkInput.value.trim();

  if (!title || !url) {
    alert("Please enter both a document title and a Google Drive link.");
    return;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "drive.google.com") {
      alert("Please enter a valid Google Drive link.");
      return;
    }
  } catch {
    alert("Please enter a valid Google Drive link.");
    return;
  }

  documents.push({ title, url });

  titleInput.value = "";
  linkInput.value = "";

  renderDocuments();
});
let meetings = [];
let notes = [];
let documents = [];
let portalRef = null;

// Monthly calendar display and navigation
(() => {
  const grid = document.getElementById("calendar-grid");
  const monthLabel = document.getElementById("calendar-month-label");
  const prevButton = document.getElementById("prev-month");
  const nextButton = document.getElementById("next-month");
  const selectedLabel = document.getElementById("selected-date-label");
  const scheduleList = document.getElementById("schedule-list");

  if (
    !grid || !monthLabel || !prevButton ||
    !nextButton || !selectedLabel || !scheduleList
  ) {
    return;
  }

  let displayedMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  let selectedDate = new Date();

  function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = displayedMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    grid.replaceChildren();

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
      const heading = document.createElement("div");
      heading.className = "calendar-weekday";
      heading.textContent = day;
      grid.appendChild(heading);
    });

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        const blank = document.createElement("div");
        blank.className = "calendar-empty";
        grid.appendChild(blank);
        continue;
      }

      const date = new Date(year, month, dayNumber);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "calendar-day";
      button.textContent = dayNumber;

      if (date.toDateString() === new Date().toDateString()) {
        button.classList.add("is-today");
      }

      if (date.toDateString() === selectedDate.toDateString()) {
        button.classList.add("is-selected");
      }

      const dateString =
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");

      if (meetings.some(meeting => meeting.date === dateString)) {
        button.classList.add("has-meeting");
      }

      button.addEventListener("click", () => {
        selectedDate = date;
        renderCalendar();
      });

      grid.appendChild(button);
    }

    selectedLabel.textContent = selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    const selectedDateString =
      selectedDate.getFullYear() + "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    const selectedMeetings = meetings.filter(
      meeting => meeting.date === selectedDateString
    );

    scheduleList.replaceChildren();

    if (selectedMeetings.length === 0) {
      scheduleList.textContent =
        "No meetings have been added for this date yet.";
    } else {
      selectedMeetings.forEach(meeting => {
        const item = document.createElement("p");
        item.textContent = meeting.title;
        scheduleList.appendChild(item);
      });
    }
  }

  window.renderCalendar = renderCalendar;

  prevButton.addEventListener("click", () => {
    displayedMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() - 1,
      1
    );
    selectedDate = new Date(displayedMonth);
    renderCalendar();
  });

  nextButton.addEventListener("click", () => {
    displayedMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() + 1,
      1
    );
    selectedDate = new Date(displayedMonth);
    renderCalendar();
  });

  renderCalendar();
})();
