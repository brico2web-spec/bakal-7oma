import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCsKU41e2LuLipxVN9OYI3Q7kKLrIWqbNQ",
    authDomain: "soteria-car.firebaseapp.com",
    projectId: "soteria-car",
    storageBucket: "soteria-car.firebasestorage.app",
    messagingSenderId: "305007713414",
    appId: "1:305007713414:web:5fe58e3923f...",
    measurementId: "G-Y1DEG39PJ3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carsData = [];

// Fetch Cars from Firestore
async function fetchCars() {
    try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        carsData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        renderFleet();
        renderAdminCarsList();
    } catch (error) {
        console.error("Error fetching cars: ", error);
    }
}

// Render Public Fleet
function renderFleet() {
    const container = document.getElementById('fleet-container');
    if (!container) return;
    
    if (carsData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-3 py-10">لا توجد سيارات حاليا. أضف بعضها من لوحة الإدارة.</p>';
        return;
    }
    container.innerHTML = '';
    
    carsData.forEach(car => {
        const isReserved = car.status === 'reserved';
        const statusBadge = isReserved 
            ? `<span class="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold shadow"><i class="fa-solid fa-lock ml-1"></i> محجوزة</span>`
            : `<span class="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold shadow"><i class="fa-solid fa-check ml-1"></i> متوفرة</span>`;

        let tiersHtml = '';
        if (car.pricing_tiers && car.pricing_tiers.length > 0) {
            car.pricing_tiers.forEach(tier => {
                if (tier.days && tier.price) {
                    if (currentLang === 'ar') {
                        tiersHtml += `
                            <div class="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/20 mt-1.5">
                                <span><i class="fa-solid fa-tag text-purple-500 ml-1.5"></i> باقة ${tier.days} أيام</span>
                                <span class="font-black text-purple-600 dark:text-purple-300">${tier.price}</span>
                            </div>
                        `;
                    } else {
                        tiersHtml += `
                            <div class="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/20 mt-1.5">
                                <span><i class="fa-solid fa-tag text-purple-500 mr-1.5"></i> Pack ${tier.days} Jours</span>
                                <span class="font-black text-purple-600 dark:text-purple-300">${tier.price}</span>
                            </div>
                        `;
                    }
                }
            });
        }

        container.innerHTML += `
            <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg group">
                <div>
                    <div class="h-44 relative overflow-hidden">
                        <img src="${car.img_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80'">
                        ${statusBadge}
                    </div>
                    <div class="p-4 space-y-1">
                        <h3 class="text-lg font-bold">${car.name}</h3>
                    </div>
                </div>
                <div class="p-4 pt-0 space-y-2">
                    <div class="flex items-baseline justify-between">
                        <span class="text-xl font-black text-purple-600 dark:text-purple-400">${car.price_1day}</span>
                        <span class="text-[11px] text-gray-500 font-medium">${currentLang === 'ar' ? 'لكل يوم' : 'par jour'}</span>
                    </div>
                    ${tiersHtml}
                    <div class="mt-3 pt-2 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <span class="text-[10px] text-gray-500 font-semibold">${isReserved ? (currentLang === 'ar' ? 'محجوزة' : 'Non disponible') : (currentLang === 'ar' ? 'متاح للحجز' : 'Disponible')}</span>
                        ${isReserved ? '<button disabled class="bg-gray-300 text-gray-500 px-4 py-2 rounded-xl text-xs font-semibold cursor-not-allowed">محجوزة</button>' : `<a href="https://wa.me/212661679702?text=${encodeURIComponent(currentLang === 'ar' ? 'سلام، بغيت نحجز سيارة ' + car.name : 'Bonjour, je veux réserver ' + car.name)}" target="_blank" class="btn-modern-primary text-white px-4 py-2 rounded-xl text-xs font-semibold"><i class="fa-brands fa-whatsapp ml-1"></i> ${currentLang === 'ar' ? 'حجز' : 'Réserver'}</a>`}
                    </div>
                </div>
            </div>
        `;
    });
}

// Add Dynamic Tier Row
function addPricingTierRow(days = '', price = '') {
    const wrapper = document.getElementById('pricing-tiers-wrapper');
    const rowId = 'tier_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const rowHtml = `
        <div id="${rowId}" class="flex items-center gap-2 bg-gray-100 dark:bg-black/40 p-2.5 rounded-xl border border-purple-500/20">
            <input type="number" placeholder="عدد الأيام (مثلاً: 3)" value="${days}" class="tier-days w-1/2 bg-white dark:bg-black/60 border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-purple-500">
            <input type="text" placeholder="الثمن (مثلاً: 1100 MAD)" value="${price}" class="tier-price w-1/2 bg-white dark:bg-black/60 border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-purple-500">
            <button type="button" onclick="document.getElementById('${rowId}').remove()" class="text-rose-500 hover:text-rose-700 px-2 py-1 text-xs font-bold shrink-0"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;
    wrapper.insertAdjacentHTML('beforeend', rowHtml);
}

// Render Admin Cars List
function renderAdminCarsList() {
    const list = document.getElementById('admin-cars-list');
    if(!list) return;
    if(carsData.length === 0) {
        list.innerHTML = '<p class="text-xs text-gray-400 text-center py-2">لا توجد سيارات مضافة بعد.</p>';
        return;
    }
    list.innerHTML = '';
    carsData.forEach((car) => {
        list.innerHTML += `
            <div class="flex justify-between items-center p-2.5 bg-gray-100 dark:bg-black/40 rounded-xl text-xs border border-white/5">
                <div class="flex items-center gap-2.5">
                    <img src="${car.img_url || ''}" class="w-9 h-9 rounded-lg object-cover">
                    <div>
                        <p class="font-bold">${car.name}</p>
                        <p class="text-[10px] text-gray-500">${car.price_1day}</p>
                    </div>
                </div>
                <div class="flex gap-1.5">
                    <button type="button" onclick="editCar('${car.id}')" class="text-purple-600 font-bold px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500 hover:text-white transition">تعديل</button>
                    <button type="button" onclick="deleteCar('${car.id}')" class="text-rose-500 font-bold px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 hover:text-white transition">حذف</button>
                </div>
            </div>
        `;
    });
}

// Edit Car
function editCar(id) {
    const car = carsData.find(c => c.id === id);
    if (!car) return;

    document.getElementById('editing-car-id').value = car.id;
    document.getElementById('car-name').value = car.name;
    document.getElementById('car-price-1day').value = car.price_1day;
    document.getElementById('car-status').value = car.status || 'available';
    document.getElementById('admin-modal-title').textContent = 'تعديل سيارة: ' + car.name;
    document.getElementById('submit-btn').textContent = 'تحديث التغييرات';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    document.getElementById('pricing-tiers-wrapper').innerHTML = '';
    if (car.pricing_tiers && car.pricing_tiers.length > 0) {
        car.pricing_tiers.forEach(tier => {
            addPricingTierRow(tier.days, tier.price);
        });
    }
}

// Reset Form
function resetCarForm() {
    document.getElementById('add-car-form').reset();
    document.getElementById('editing-car-id').value = '';
    document.getElementById('pricing-tiers-wrapper').innerHTML = '';
    document.getElementById('admin-modal-title').textContent = 'لوحة تحكم الإدارة';
    document.getElementById('submit-btn').textContent = 'حفظ السيارة الجديدة';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// Safe Image Compression
const safeCompress = (file) => new Promise((resolve) => {
    if (!file) {
        resolve('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80');
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.45));
            } catch (e) {
                resolve('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80');
            }
        };
        img.onerror = () => resolve('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80');
    };
    reader.onerror = () => resolve('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80');
});

// Save / Update Car in Firebase with instant release and success alerts
async function saveCarToFirebase(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const editingId = document.getElementById('editing-car-id').value;
    
    submitBtn.textContent = 'جاري الحفظ...';
    submitBtn.disabled = true;

    try {
        const pricingTiers = [];
        document.querySelectorAll('#pricing-tiers-wrapper > div').forEach(row => {
            const days = row.querySelector('.tier-days').value;
            const price = row.querySelector('.tier-price').value;
            if(days && price) {
                pricingTiers.push({ days: Number(days), price: price });
            }
        });

        const fileInput = document.getElementById('car-img-file');
        
        let carDataObj = {
            name: document.getElementById('car-name').value,
            price_1day: document.getElementById('car-price-1day').value,
            pricing_tiers: pricingTiers,
            status: document.getElementById('car-status').value,
            updated_at: new Date().toISOString()
        };

        if (fileInput.files.length > 0) {
            carDataObj.img_url = await safeCompress(fileInput.files[0]);
        } else if (!editingId) {
            carDataObj.img_url = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80';
        }

        if (editingId) {
            await updateDoc(doc(db, "cars", editingId), carDataObj);
            submitBtn.textContent = 'حفظ السيارة الجديدة';
            submitBtn.disabled = false;
            resetCarForm();
            await fetchCars();
            alert('تم التعديل بنجاح!');
        } else {
            carDataObj.created_at = new Date().toISOString();
            await addDoc(collection(db, "cars"), carDataObj);
            submitBtn.textContent = 'حفظ السيارة الجديدة';
            submitBtn.disabled = false;
            resetCarForm();
            await fetchCars();
            alert('تم الحفظ بنجاح!');
        }

    } catch (error) {
        console.error("Firebase Error Details:", error);
        alert('خطأ أثناء الحفظ: ' + error.message);
        submitBtn.textContent = editingId ? 'تحديث التغييرات' : 'حفظ السيارة الجديدة';
        submitBtn.disabled = false;
    }
}

// Delete Car
async function deleteCar(id) {
    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
        try {
            await deleteDoc(doc(db, "cars", id));
            await fetchCars();
            alert('تم الحذف بنجاح!');
        } catch (error) {
            alert('خطأ في الحذف: ' + error.message);
        }
    }
}

// Slider logic
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
function changeSlide(direction) {
    if(slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}
setInterval(() => { changeSlide(1); }, 4000);

// Language toggle logic
let currentLang = 'fr';
let phraseIndex = 0;
const phrases = {
    fr: [
        "Voyagez en toute liberté avec Soteria Car",
        "Votre partenaire idéal pour la location de voitures",
        "Des véhicules récents et confortables pour vos trajets"
    ],
    ar: [
        "سافر بكل حرية وثقة مع وكالة Soteria Car",
        "شريكك الأمثل لكراء السيارات بأفضل الشروط",
        "سيارات حديثة ومريحة لجميع تنقلاتكم بالمغرب"
    ]
};
const dynamicTextEl = document.getElementById('dynamic-text');

function rotatePhrases() {
    if(!dynamicTextEl) return;
    const list = phrases[currentLang];
    phraseIndex = (phraseIndex + 1) % list.length;
    dynamicTextEl.style.opacity = 0;
    setTimeout(() => {
        dynamicTextEl.textContent = list[phraseIndex];
        dynamicTextEl.style.opacity = 1;
    }, 300);
}
setInterval(rotatePhrases, 3500);

const translations = {
    fr: {
        logoSub: "Location de voitures",
        heroDesc: "Découvrez notre flotte de véhicules récents, confortables et entretenus pour tous vos deplacements à des prix imbattables.",
        btnFleet: "Voir les Voitures",
        btnContact: "Contactez-nous",
        fleetBadge: "Catalogue & Offres",
        fleetTitle1: "Notre",
        fleetTitle2: "Flotte de Véhicules",
        fleetDesc: "Choisissez le véhicule qui s'adapte parfaitement à vos besoins et profitez d'un confort absolu.",
        hoursTitle: "Horaires d'ouverture",
        openStatus: "Ouvert • Fermé à 21:00",
        addrTitle: "Adresse de l'Agence",
        phoneTitle: "Téléphone / WhatsApp",
        footer: "© 2026 Soteria Car. Tous droits réservés."
    },
    ar: {
        logoSub: "كراء السيارات",
        heroDesc: "اكتشف أسطول سياراتنا الحديثة، المريحة والمجهزة بعناية لجميع تنقلاتكم بأفضل الأسعار.",
        btnFleet: "عرض السيارات",
        btnContact: "اتصل بنا",
        fleetBadge: "كتالوج العروض",
        fleetTitle1: "أسطول",
        fleetTitle2: "سياراتنا المتميزة",
        fleetDesc: "اختر السيارة التي تناسب احتياجات رحلتك بدقة واستمتع بتجربة قيادة مريحة وآمنة.",
        hoursTitle: "أوقات العمل",
        openStatus: "مفتوح • يغلق على الساعة 21:00",
        addrTitle: "عنوان الوكالة",
        phoneTitle: "الهاتف / واتساب",
        footer: "© 2026 Soteria Car. جميع الحقوق محفوظة."
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'ar' : 'fr';
    const t = translations[currentLang];
    const langBtn = document.getElementById('langToggleBtn');

    if(currentLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        langBtn.textContent = 'FR';
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        langBtn.textContent = 'AR';
    }

    document.getElementById('logo-sub').textContent = t.logoSub;
    document.getElementById('hero-desc').textContent = t.heroDesc;
    document.getElementById('btn-fleet').innerHTML = `<i class="fa-solid fa-car mr-2"></i> ${t.btnFleet}`;
    document.getElementById('btn-contact').innerHTML = `<i class="fa-solid fa-headset mr-2 text-purple-500"></i> ${t.btnContact}`;
    document.getElementById('fleet-badge').textContent = t.fleetBadge;
    document.getElementById('fleet-title-1').textContent = t.fleetTitle1;
    document.getElementById('fleet-title-2').textContent = t.fleetTitle2;
    document.getElementById('fleet-desc').textContent = t.fleetDesc;
    document.getElementById('hours-title').textContent = t.hoursTitle;
    document.getElementById('open-status').textContent = t.openStatus;
    document.getElementById('addr-title').textContent = t.addrTitle;
    document.getElementById('phone-title').textContent = t.phoneTitle;
    document.getElementById('footer-text').textContent = t.footer;

    phraseIndex = 0;
    dynamicTextEl.textContent = phrases[currentLang][0];
    renderFleet();
}

// Theme & Admin UI
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    body.classList.toggle('light-mode');
    if(body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function openLoginModal() { document.getElementById('login-modal').classList.remove('hidden'); }
function closeLoginModal() { document.getElementById('login-modal').classList.add('hidden'); }
function checkAdminLogin() {
    if(document.getElementById('admin-user').value === 'admin' && document.getElementById('admin-pass').value === '123') {
        closeLoginModal();
        document.getElementById('admin-modal').classList.remove('hidden');
        fetchCars();
    } else { alert('خطأ في معلومات الدخول (استعمل admin / 123)'); }
}
function toggleAdminModal() { document.getElementById('admin-modal').classList.toggle('hidden'); }

// Global Bindings
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.checkAdminLogin = checkAdminLogin;
window.toggleAdminModal = toggleAdminModal;
window.saveCarToFirebase = saveCarToFirebase;
window.addPricingTierRow = addPricingTierRow;
window.editCar = editCar;
window.deleteCar = deleteCar;
window.resetCarForm = resetCarForm;

// Initial Load on Page Open
fetchCars();
