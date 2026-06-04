
// ======================
// BUKA UNDANGAN
// ======================

function openInvitation(){

document.getElementById("cover").style.display="none";
document.getElementById("content").style.display="block";

const music=document.getElementById("bgMusic");

music.play().catch(()=>{
console.log("Autoplay diblokir browser");
});

}

window.openInvitation=openInvitation;


// ======================
// NAMA TAMU OTOMATIS
// contoh:
// ?to=Bapak%20Ahmad
// ======================

const params=new URLSearchParams(window.location.search);

const guest=params.get("to");

if(guest){

document.getElementById("guestName").innerHTML=
"Kepada Yth.<br><strong>"+guest+"</strong>";

}


// ======================
// COUNTDOWN
// ======================

const targetDate=
new Date("June 11, 2026 14:00:00").getTime();

setInterval(()=>{

const now=new Date().getTime();

const distance=targetDate-now;

const days=Math.floor(
distance/(1000*60*60*24)
);

const hours=Math.floor(
(distance%(1000*60*60*24))
/
(1000*60*60)
);

const minutes=Math.floor(
(distance%(1000*60*60))
/
(1000*60)
);

const seconds=Math.floor(
(distance%(1000*60))
/
1000
);

document.getElementById("days").innerHTML=days;
document.getElementById("hours").innerHTML=hours;
document.getElementById("minutes").innerHTML=minutes;
document.getElementById("seconds").innerHTML=seconds;

},1000);


// ======================
// FIREBASE
// ======================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
getDocs,
query,
orderBy
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// GANTI DENGAN CONFIG ANDA

const firebaseConfig = {

apiKey: "ISI_APIKEY",

authDomain: "ISI_AUTHDOMAIN",

projectId: "ISI_PROJECTID",

storageBucket: "ISI_STORAGE",

messagingSenderId: "ISI_SENDERID",

appId: "ISI_APPID"

};


// ======================

const app=initializeApp(firebaseConfig);

const db=getFirestore(app);


// ======================
// RSVP
// ======================

const rsvpForm=
document.getElementById("rsvpForm");

if(rsvpForm){

rsvpForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const nama=
document.getElementById("rsvpNama").value;

const status=
document.getElementById("rsvpStatus").value;

await addDoc(
collection(db,"rsvp"),
{

nama:nama,
status:status,
tanggal:new Date()

}
);

document.getElementById(
"rsvpMessage"
).innerHTML=
"Terima kasih atas konfirmasi Anda.";

rsvpForm.reset();

}
);

}


// ======================
// UCAPAN
// ======================

const wishForm=
document.getElementById("wishForm");

if(wishForm){

wishForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const nama=
document.getElementById("wishName").value;

const pesan=
document.getElementById("wishMessage").value;

await addDoc(
collection(db,"ucapan"),
{

nama:nama,
pesan:pesan,
tanggal:new Date()

}
);

wishForm.reset();

loadUcapan();

}
);

}


// ======================
// LOAD UCAPAN
// ======================

async function loadUcapan(){

const wishList=
document.getElementById("wishList");

wishList.innerHTML="";

const q=query(
collection(db,"ucapan"),
orderBy("tanggal","desc")
);

const snapshot=
await getDocs(q);

snapshot.forEach((doc)=>{

const data=doc.data();

wishList.innerHTML+=`

<div class="ucapan-item">

<strong>${data.nama}</strong>

<p>${data.pesan}</p>

</div>

`;

});

}

loadUcapan();
