// ==========================
// Firebase Init
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, GoogleAuthProvider, signInWithPopup, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 🔑 Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQwsuHKzxMlrmxGO2jrkQf9q2E2cCcD44",
  authDomain: "maxy-bootcamp-14405.firebaseapp.com",
  projectId: "maxy-bootcamp-14405",
  storageBucket: "maxy-bootcamp-14405.firebasestorage.app",
  messagingSenderId: "1011362869192",
  appId: "1:1011362869192:web:aa867236b2c49e9aa55afd",
  measurementId: "G-VC0MESJHXN"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================
// Utils: Smooth scroll anchor
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ==========================
// Flipcard toggle
// ==========================
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('is-flipped'));
});

// ==========================
// Modal System (tanpa ubah HTML/CSS)
// ==========================
let _openModalId = null;

function styleModal(el) {
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    display: 'none',          
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.65)',
    zIndex: '9999'
  });

  // Cari kontainer isi (prioritas .page-content -> .page -> child pertama)
  const content = el.querySelector('.page-content') || el.querySelector('.page') || el.firstElementChild || el;
  // Pastikan kontainer tampil wajar
  Object.assign(content.style, {
    background: 'var(--bg, #0a0d14)',
    color: 'var(--fg, #e9edff)',
    padding: content.classList.contains('page-content') ? content.style.padding || '24px' : '24px',
    borderRadius: '16px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 12px 36px rgba(0,0,0,.25)'
  });

  // Klik di dalam konten tidak menutup modal
  content.addEventListener('click', e => e.stopPropagation());
  // Klik overlay menutup modal
  el.addEventListener('click', () => closePopup(el.id));
}

function ensureModal(id, htmlIfCreate = null) {
  let el = document.getElementById(id);
  if (!el && htmlIfCreate) {
    const wrapper = document.createElement('div');
    wrapper.id = id;
    wrapper.className = 'popup';
    wrapper.innerHTML = htmlIfCreate;
    document.body.appendChild(wrapper);
    el = wrapper;
  }
  if (el && !el.dataset._styled) {
    styleModal(el);
    el.dataset._styled = '1';
  }
  return el;
}

function openPopup(id, messageText = null) {
  const el = ensureModal(
    id, 
    id === 'success-popup'
      ? `<div class="page"><div class="page-content">
            <h2 class="h2">Berhasil</h2>
            <p>${messageText ? messageText : ''}</p>
         </div></div>`
      : null
  );
  if (!el) return;

  if (messageText) {
    const p = el.querySelector('p');
    if (p) p.textContent = messageText;
  }

  el.style.display = 'flex';
  _openModalId = id;
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  if (_openModalId === id) _openModalId = null;
}

// ESC untuk menutup modal aktif
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && _openModalId) closePopup(_openModalId);
});

// Siapkan login & register popup kalau ada di HTML
['login-popup','register-popup','success-popup'].forEach(id => ensureModal(id));

// ==========================
// Open/Toggle Login/Register
// ==========================
const openLoginBtn = document.getElementById("open-login");
if (openLoginBtn) {
  openLoginBtn.addEventListener("click", e => {
    e.preventDefault();
    openPopup("login-popup");
  });
}

const openRegisterLink = document.getElementById("open-register");
if (openRegisterLink) {
  openRegisterLink.addEventListener("click", e => {
    e.preventDefault();
    closePopup("login-popup");
    openPopup("register-popup");
  });
}

const backToLoginLink = document.getElementById("back-to-login");
if (backToLoginLink) {
  backToLoginLink.addEventListener("click", e => {
    e.preventDefault();
    closePopup("register-popup");
    openPopup("login-popup");
  });
}

// ==========================
// Authentication
// ==========================
const regAuthForm = document.getElementById("register-form-auth");
if (regAuthForm) {
  regAuthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email")?.value || "";
    const pass = document.getElementById("reg-password")?.value || "";
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      closePopup("register-popup");
      openPopup("success-popup", "✅ Akun berhasil dibuat!");
    } catch (err) { 
      alert("⚠️ Error: " + err.message); 
    }
  });
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value || "";
    const pass = document.getElementById("login-password")?.value || "";
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      closePopup("login-popup");
      openPopup("success-popup", "✅ Login berhasil!");
    } catch (err) { 
      alert("⚠️ Login error: " + err.message); 
    }
  });
}

const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      closePopup("login-popup");
      openPopup("success-popup", "✅ Login Google berhasil!");
    } catch (err) { 
      alert("⚠️ Google login error: " + err.message); 
    }
  });
}

// Show/Hide Login-Logout button
const logoutBtn = document.getElementById("logout-btn");
onAuthStateChanged(auth, (user) => {
  const openLogin = document.getElementById("open-login");
  if (user) {
    if (openLogin) openLogin.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (openLogin) openLogin.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
if (logoutBtn) logoutBtn.addEventListener("click", () => signOut(auth));

// ==========================
// Live Chat (Enter to send)
// ==========================
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const typingPreview = document.getElementById("typing-preview");

let currentUser = "me";

function sendMessage() {
  if (!chatBox || !chatInput) return;
  const text = chatInput.value.trim();
  if (text === "") return;

  const div = document.createElement("div");
  div.className = "chat-message " + currentUser;
  div.textContent = (currentUser === "me" ? "You" : "Other") + ": " + text;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  chatInput.value = "";
  if (typingPreview) typingPreview.textContent = "";

  // Simulasi balasan
  if (currentUser === "me") {
    setTimeout(() => {
      const reply = document.createElement("div");
      reply.className = "chat-message other";
      reply.textContent = "Miki: Aight → " + text;
      chatBox.appendChild(reply);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
  }
}

if (sendBtn) sendBtn.addEventListener("click", sendMessage);

if (chatInput) {
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatInput.addEventListener("input", () => {
    if (!typingPreview) return;
    typingPreview.textContent = chatInput.value
      ? "You are typing: " + chatInput.value
      : "";
  });
}

// ==========================
// Registration Form → Firestore
// ==========================
const regForm = document.querySelector("#register form");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      fullname: form.fullname.value,
      email: form.email.value,
      company: form.company.value,
      role: form.role.value,
      track: form.track.value,
      notes: form.notes.value,
      date: form.date.value,
      plan: form.plan.value,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "registrations"), data);
      form.reset();
      openPopup("success-popup", "🎫 Tiketmu berhasil dikirim ke e-mail!");
    } catch (err) {
      alert("⚠️ Error: " + err.message);
    }
  });
}

// ==========================
// Scroll ke bawah (Footer)
// ==========================
const toBottom = document.querySelector(".to-bottom");
if (toBottom) {
  toBottom.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
  });
}
