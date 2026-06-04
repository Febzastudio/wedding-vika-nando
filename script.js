// ==========================================================================
// BUKA UNDANGAN & KONTROL MUSIK
// ==========================================================================
function openInvitation() {
    const cover = document.getElementById("cover");
    const content = document.getElementById("content");
    const music = document.getElementById("bgMusic");

    if (cover) cover.style.display = "none";
    if (content) content.style.display = "block";

    if (music) {
        music.play().catch((error) => {
            console.log("Autoplay diblokir oleh kebijakan keamanan browser:", error);
        });
    }
}

// Mengekspos fungsi ke cakupan global karena menggunakan type="module" di HTML
window.openInvitation = openInvitation;

// ==========================================================================
// DETEKSI NAMA TAMU OTOMATIS (?to=Nama+Tamu)
// ==========================================================================
const params = new URLSearchParams(window.location.search);
const guest = params.get("to");
const guestNameContainer = document.getElementById("guestName");

if (guest && guestNameContainer) {

    const namaTamu = decodeURIComponent(guest);

    guestNameContainer.innerHTML =
    '<div class="guest-label">' +
    'Kepada Yth.<br>' +
    'Bapak/Ibu/Saudara/i<br><br>' +
    '<strong>' + namaTamu + '</strong>' +
    '<small class="guest-note">Mohon maaf apabila terdapat kesalahan penulisan nama dan gelar</small>' +
'</div>'
}

// ==========================================================================
// HITUNG MUNDUR (COUNTDOWN) - ANTI MINUS
// ==========================================================================
const targetDate = new Date("June 11, 2026 14:00:00").getTime();

const countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Proteksi: Jika waktu sudah terlewat, hentikan hitungan di angka 0
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById("days").innerHTML = "0";
        document.getElementById("hours").innerHTML = "0";
        document.getElementById("minutes").innerHTML = "0";
        document.getElementById("seconds").innerHTML = "0";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update elemen DOM jika tersedia
    if (document.getElementById("days")) document.getElementById("days").innerHTML = days;
    if (document.getElementById("hours")) document.getElementById("hours").innerHTML = hours;
    if (document.getElementById("minutes")) document.getElementById("minutes").innerHTML = minutes;
    if (document.getElementById("seconds")) document.getElementById("seconds").innerHTML = seconds;
}, 1000);

// ==========================================================================
// INTEGRASI DATA BASE (FIREBASE CONFIG)
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// SILAKAN MASUKKAN KREDENSI FIREBASE ANDA DI SINI
const firebaseConfig = {
    apiKey: "AIzaSyAVVlfywkGqQOowZ06U0t1GQubnh7Wt2Q4",
    authDomain: "febzastudio.firebaseapp.com",
    projectId: "febzastudio",
    storageBucket: "febzastudio.firebasestorage.app",
    messagingSenderId: "963884292211",
    appId: "1:963884292211:web:68d3068ea4b1ebf9e5f206"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================================================
// FORM RSVP (KONFIRMASI KEHADIRAN)
// ==========================================================================
const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const nama = document.getElementById("rsvpNama").value;
        const status = document.getElementById("rsvpStatus").value;
        const messageContainer = document.getElementById("rsvpMessage");

        try {
            await addDoc(collection(db, "rsvp"), {
                nama: nama,
                status: status,
                tanggal: new Date()
            });

            if (messageContainer) {
                messageContainer.innerHTML = "<p style='color: green; margin-top: 10px;'>Terima kasih atas konfirmasi Anda.</p>";
            }
            rsvpForm.reset();
        } catch (error) {
            console.error("Gagal mengirim RSVP:", error);
            if (messageContainer) {
                messageContainer.innerHTML = "<p style='color: red; margin-top: 10px;'>Gagal mengirim. Coba lagi nanti.</p>";
            }
        }
    });
}

// ==========================================================================
// FORM UCAPAN & DOA (Buku Tamu)
// ==========================================================================
const wishForm = document.getElementById("wishForm");

if (wishForm) {
    wishForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nama = document.getElementById("wishName").value;
        const pesan = document.getElementById("wishMessage").value;

        try {
            await addDoc(collection(db, "ucapan"), {
                nama: nama,
                pesan: pesan,
                tanggal: new Date()
            });

            wishForm.reset();
            loadUcapan(); // Memuat ulang daftar ucapan terbaru
        } catch (error) {
            console.error("Gagal mengirim ucapan:", error);
        }
    });
}

// ==========================================================================
// MEMUAT DAFTAR UCAPAN (LOAD DATA) - AMAN DARI XSS
// ==========================================================================
async function loadUcapan() {
    const wishList = document.getElementById("wishList");
    if (!wishList) return;

    wishList.innerHTML = "<p style='text-align: center; color: #888;'>Memuat ucapan...</p>";

    try {
        const q = query(collection(db, "ucapan"), orderBy("tanggal", "desc"));
        const snapshot = await getDocs(q);
        
        wishList.innerHTML = ""; // Bersihkan teks loading

        snapshot.forEach((doc) => {
            const data = doc.data();

            // AMAN: Menggunakan pendekatan DOM Node untuk mencegah serangan XSS (Injeksi HTML/Script jahat)
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("ucapan-item");

            const senderName = document.createElement("strong");
            senderName.textContent = data.nama;

            const messageText = document.createElement("p");
            messageText.textContent = data.pesan;
            messageText.style.marginTop = "5px";

            itemDiv.appendChild(senderName);
            itemDiv.appendChild(messageText);
            wishList.appendChild(itemDiv);
        });
        
        if (snapshot.empty) {
            wishList.innerHTML = "<p style='text-align: center; color: #888; font-style: italic;'>Belum ada ucapan.</p>";
        }

    } catch (error) {
        console.error("Gagal memuat daftar ucapan:", error);
        wishList.innerHTML = "<p style='text-align: center; color: red;'>Gagal memuat ucapan.</p>";
    }
}

// Panggil fungsi pemuat ucapan saat halaman pertama kali terbuka
loadUcapan();
