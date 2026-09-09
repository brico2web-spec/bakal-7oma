// script.js - Soteria Car Management & Dynamic Translation

// قاموس الترجمة للعناصر الديناميكية داخل الجافا سكريبت
const jsTranslations = {
    fr: {
        available: "Disponible",
        reserved: "Réservé",
        perDay: "/jour",
        packDays: (n) => `Pack ${n} jours`,
        bookBtn: "Réserver",
        loading: "Chargement des véhicules...",
        noCars: "Aucun véhicule disponible pour le moment."
    },
    ar: {
        available: "متوفرة",
        reserved: "محجوزة",
        perDay: "لليوم",
        packDays: (n) => `باقة ${n} أيام`,
        bookBtn: "حجز",
        loading: "جاري تحميل السيارات...",
        noCars: "لا توجد سيارات متاحة في الوقت الحالي."
    }
};

// بيانات تجريبية للسيارات (أو يمكن ربطها بـ Firebase حسب إعداداتك)
let carsData = [
    {
        id: 1,
        name: "HYUNDAI Santa Fe",
        price1Day: "600",
        status: "available",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            { days: 5, price: "1300 MAD" },
            { days: 10, price: "2100 MAD" }
        ]
    },
    {
        id: 2,
        name: "Dacia Logan",
        price1Day: "200",
        status: "available",
        image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c351?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            { days: 3, price: "550 MAD" }
        ]
    }
];

// دالة عرض السيارات في الكتالوج مع التحديث الفوري حسب اللغة
export function renderFleetCards(cars = carsData) {
    const container = document.getElementById('fleet-container');
    if (!container) return;

    const lang = window.currentLang || 'fr';
    const t = jsTranslations[lang];

    if (!cars || cars.length === 0) {
        container.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-400">${t.noCars}</div>`;
        return;
    }

    let html = '';
    cars.forEach(car => {
        const isReserved = car.status === 'reserved';
        const statusText = isReserved ? t.reserved : t.available;
        const statusClass = isReserved ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        const imgClass = isReserved ? 'car-reserved-img' : 'car-available-img';

        let tiersHtml = '';
        if (car.pricingTiers && Array.isArray(car.pricingTiers)) {
            car.pricingTiers.forEach(tier => {
                const packText = t.packDays(tier.days);
                tiersHtml += `
                    <div class="flex justify-between items-center bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-xl text-xs">
                        <span class="text-purple-300 font-bold"><i class="fa-solid fa-tag mr-1 ml-1 text-purple-400"></i> ${packText}</span>
                        <span class="font-black text-purple-200">${tier.price}</span>
                    </div>
                `;
            });
        }

        html += `
            <div class="glass-card rounded-2xl overflow-hidden p-4 space-y-4 flex flex-col justify-between border border-white/10 shadow-xl">
                <div class="relative h-48 rounded-xl overflow-hidden">
                    <img src="${car.image}" alt="${car.name}" class="w-full h-full object-cover ${imgClass}">
                    <div class="absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${statusClass} car-status-badge" data-status="${car.status}">
                        <i class="fa-solid ${isReserved ? 'fa-circle-xmark' : 'fa-circle-check'} mr-1 ml-1"></i> ${statusText}
                    </div>
                </div>

                <div class="space-y-2">
                    <h3 class="text-lg font-black tracking-wide">${car.name}</h3>
                    <div class="flex justify-between items-center text-sm font-bold">
                        <span class="text-gray-400 text-xs">${lang === 'ar' ? 'للكل يوم' : 'Prix par jour'}</span>
                        <span class="text-amber-400 text-base font-black">${car.price1Day} <span class="text-xs text-white font-bold">${t.perDay}</span></span>
                    </div>
                    <div class="space-y-1.5 pt-1">
                        ${tiersHtml}
                    </div>
                </div>

                <button onclick="openReservationModal('${car.name}')" class="w-full btn-modern-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-lg cursor-pointer car-book-btn">
                    ${t.bookBtn} <i class="fa-solid fa-arrow-right ml-1 mr-1"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;

    // تحديث السلايدر وعرض أرخص سيارة تلقائياً إذا كانت الدوال موجودة
    if (typeof window.initDynamicSlider === 'function') window.initDynamicSlider();
    if (typeof window.updateCheapestCarOffer === 'function') window.updateCheapestCarOffer();
}

// إدارة أسطر الأسعار في لوحة التحكم (Admin)
window.addPricingTierRow = function(days = '', price = '') {
    const wrapper = document.getElementById('pricing-tiers-wrapper');
    if (!wrapper) return;
    const row = document.createElement('div');
    const lang = window.currentLang || 'fr';
    row.className = 'flex gap-2 items-center';
    row.innerHTML = `
        <input type="number" placeholder="${lang === 'ar' ? 'عدد الأيام (مثال: 5)' : 'Nombre de jours (ex: 5)'}" value="${days}" class="tier-days w-1/2 bg-gray-100 dark:bg-black/40 border rounded-xl px-3 py-1.5 text-xs">
        <input type="text" placeholder="${lang === 'ar' ? 'السعر (مثال: 1300 MAD)' : 'Prix (ex: 1300 MAD)'}" value="${price}" class="tier-price w-1/2 bg-gray-100 dark:bg-black/40 border rounded-xl px-3 py-1.5 text-xs">
        <button type="button" onclick="this.parentElement.remove()" class="text-rose-500 hover:text-rose-700 px-2 py-1 text-xs"><i class="fa-solid fa-trash"></i></button>
    `;
    wrapper.appendChild(row);
};

// دوال المصادقة ولوحة التحكم
window.checkAdminLogin = function() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('admin-modal').classList.remove('hidden');
        if (typeof window.showSuccessMessage === 'function') {
            window.showSuccessMessage(window.currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Connexion réussie');
        }
    } else {
        alert(window.currentLang === 'ar' ? 'معلومات الدخول غير صحيحة' : 'Identifiants incorrects');
    }
};

window.toggleAdminModal = function() {
    document.getElementById('admin-modal').classList.toggle('hidden');
};

window.closeLoginModal = function() {
    document.getElementById('login-modal').classList.add('hidden');
};

window.openLoginModal = function() {
    document.getElementById('login-modal').classList.remove('hidden');
};

window.resetCarForm = function() {
    document.getElementById('add-car-form').reset();
    document.getElementById('editing-car-id').value = '';
    document.getElementById('pricing-tiers-wrapper').innerHTML = '';
    document.getElementById('submit-btn').innerText = window.currentLang === 'ar' ? 'حفظ السيارة' : 'Enregistrer le véhicule';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
};

// تشغيل عرض السيارات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderFleetCards();
});
