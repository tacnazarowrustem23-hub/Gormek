import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, doc, updateDoc,
  deleteDoc, increment, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFhFKeFhn-3mHJA9eIYY2ptOs9Hy-ew5w",
  authDomain: "gormek.firebaseapp.com",
  projectId: "gormek",
  storageBucket: "gormek.firebasestorage.app",
  messagingSenderId: "691271972105",
  appId: "1:691271972105:web:fee1769c747ec8f204cfd8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const loginBox = document.getElementById("loginBox");
const adminBox = document.getElementById("adminBox");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const photoInput = document.getElementById("photoInput");
const gallery = document.getElementById("gallery");

let isAdmin = false;

loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(err => alert("Giriş başarısız: " + err.message));
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  isAdmin = !!user;
  loginBox.style.display = user ? "none" : "block";
  adminBox.style.display = user ? "block" : "none";
  renderGallery();
});

photoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    await addDoc(collection(db, "photos"), {
      url: reader.result,
      likes: 0,
      createdAt: serverTimestamp()
    });
    photoInput.value = "";
  };
  reader.readAsDataURL(file);
});

function renderGallery() {
  const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    gallery.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "medya-kutu";

      const img = document.createElement("img");
      img.src = data.url;
      card.appendChild(img);

      const likeBtn = document.createElement("button");
      likeBtn.className = "button";
      likeBtn.textContent = `❤️ ${data.likes || 0}`;
      likeBtn.addEventListener("click", async () => {
        await updateDoc(doc(db, "photos", id), { likes: increment(1) });
      });
      card.appendChild(likeBtn);

      if (isAdmin) {
        const delBtn = document.createElement("button");
        delBtn.className = "sil-btn";
        delBtn.textContent = "🗑️ Sil";
        delBtn.addEventListener("click", async () => {
          await deleteDoc(doc(db, "photos", id));
        });
        card.appendChild(delBtn);
      }

      gallery.appendChild(card);
    });
  });
}
