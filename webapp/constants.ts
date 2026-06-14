
import { Product, UIStrings, Language } from './types';

export const REGIONS = [
  "Toshkent sh.", "Toshkent vil.", "Andijon", "Buxoro", "Fargʻona", 
  "Jizzax", "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", 
  "Samarqand", "Sirdaryo", "Surxondaryo", "Qoraqalpogʻiston"
];

export const STORE_ACCOUNTS = [
  { user: 'fonon_admin', pass: '1234', store: 'Fonon' },
  { user: 'zarb_owner', pass: '7777', store: 'Zarbazzar' },
  { user: 'LM_Gold', pass: 'Lazizbek', store: 'LM Gold' },
  { user: 'adham_z', pass: 'adham77', store: 'Adham Zargar' },
  { user: 'akzar_admin', pass: 'akzar99', store: 'Akzar' },
  { user: 'chorsu_gold', pass: 'center01', store: 'Chorsu Gold Center' },
  { user: 'jewellery_c', pass: 'jewel55', store: 'Jevellery Center' },
  { user: 'bob_bold', pass: 'bob88', store: 'Bob Bold' },
  { user: 'national', pass: 'nbuz', store: 'National Bank' }
];

export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    cat: 'gold', 
    type: 'chain', 
    title: {
      uz: "LM Gold Elegant Italiya Dizaynidagi Olmosli Shokila",
      ru: "Колье с бриллиантами LM Gold в элегантном итальянском дизайне",
      en: "LM Gold Elegant Italian Design Diamond Necklace"
    },
    price: 4500, 
    gram: "12.45g", 
    gramValue: 12.45, 
    proba: "750", 
    karat: "18K", 
    desc: {
      uz: "Italiyaning eng sara ustalari tomonidan tayyorlangan, 1.5 karatli olmoslar bilan bezatilgan maxsus shokila.",
      ru: "Эксклюзивное колье, изготовленное лучшими итальянскими мастерами, украшенное бриллиантами весом 1,5 карата.",
      en: "Exclusive necklace made by the best Italian craftsmen, adorned with 1.5 carats of diamonds."
    },
    store: "LM Gold", location: "Toshkent sh.", logo: "", 
    img: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    id: 2, 
    cat: 'gold', 
    type: 'ring', 
    title: {
      uz: "Adham Zargar - Qo'l Mehnati Bilan Tayyorlangan Milliy Uzuk",
      ru: "Adham Zargar - Национальное кольцо ручной работы",
      en: "Adham Zargar - Handcrafted National Ring"
    },
    price: 850, 
    gram: "6.2g", 
    gramValue: 6.2, 
    proba: "585", 
    karat: "14K", 
    desc: {
      uz: "O'zbek milliy zargarlik san'ati an'analarida qo'lda ishlangan, nafis naqshli oltin uzuk.",
      ru: "Золотое кольцо с изысканными узорами, выполненное вручную в традициях узбекского национального ювелирного искусства.",
      en: "Handcrafted gold ring with exquisite patterns, made in the traditions of Uzbek national jewelry art."
    },
    store: "Adham Zargar", location: "Buxoro", logo: "", 
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200" 
  },
  { 
    id: 3, 
    cat: 'silver', 
    type: 'bracelet', 
    title: {
      uz: "Akzar Minimalist Kumush Bilaguzuk - Zamonaviy Uslub",
      ru: "Минималистичный серебряный браслет Akzar - Современный стиль",
      en: "Akzar Minimalist Silver Bracelet - Modern Style"
    },
    price: 120, 
    gram: "15.8g", 
    gramValue: 15.8, 
    proba: "925", 
    karat: "S", 
    desc: {
      uz: "Akzardan zamonaviy va minimalist dizayn. Kundalik taqish uchun juda qulay.",
      ru: "Современный и минималистичный дизайн от Akzar. Очень удобен для повседневной носки.",
      en: "Modern and minimalist design from Akzar. Very comfortable for daily wear."
    },
    store: "Akzar", location: "Toshkent sh.", logo: "", 
    img: "https://images.unsplash.com/photo-1611085583191-a3b13b244813?auto=format&fit=crop&q=80&w=1200" 
  },
  {
    id: 4,
    cat: 'gold',
    type: 'earring',
    title: {
      uz: "Fonon Koroleva 585 Probada Nafis Oltin Zirak",
      ru: "Королевские золотые серьги Fonon 585 пробы",
      en: "Fonon Queen Elegant Gold Earrings 585 Purity"
    },
    price: 1100,
    gram: "8.40g",
    gramValue: 8.4,
    proba: "585",
    karat: "14K",
    desc: {
      uz: "Yorqin yoqut metallari va oq sirkon toshlari bilan bezatilgan klassik tilla ziraklar to'plami.",
      ru: "Классические золотые серьги, украшенные мелкими цирконами и изысканными вставками.",
      en: "Classic gold earrings decorated with brilliant white zircon stones and exquisite detailing."
    },
    store: "Fonon", location: "Andijon", logo: "",
    img: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 5,
    cat: 'gold',
    type: 'bracelet',
    title: {
      uz: "Zarbazzar Imperial Chiviqli Tilla Braslet",
      ru: "Императорский золотой браслет Zarbazzar",
      en: "Zarbazzar Imperial Woven Gold Bracelet"
    },
    price: 2400,
    gram: "21.60g",
    gramValue: 21.6,
    proba: "585",
    karat: "14K",
    desc: {
      uz: "Uch rangli haqiqiy oltindan qilingan mustahkam va dabdabali bilaguzuk. Maxsus tantanalar uchun.",
      ru: "Массивный и роскошный браслет из трехцветного золота. Идеально для особых вечеров.",
      en: "Robust and luxurious tri-color gold woven bracelet. Perfect for special formal celebrations."
    },
    store: "Zarbazzar", location: "Toshkent sh.", logo: "",
    img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 6,
    cat: 'gold',
    type: 'pendant',
    title: {
      uz: "Chorsu Gold - Baxt va Sevgi Oltin Kuloni",
      ru: "Chorsu Gold - Золотой кулон счастья и любви",
      en: "Chorsu Gold - Heart of Fortune Gold Pendant"
    },
    price: 490,
    gram: "3.50g",
    gramValue: 3.5,
    proba: "750",
    karat: "18K",
    desc: {
      uz: "Yurak va baxt keltiruvchi mo'jizakor belgilar o'yilgan nafis va jozibador tilla kulon.",
      ru: "Изящный золотой кулон в форме сердца со вставками кубического циркония.",
      en: "Exquisite heart-shaped gold pendant featuring micro pave cubic zirconia elements."
    },
    store: "Chorsu Gold Center", location: "Toshkent sh.", logo: "",
    img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 7,
    cat: 'gold',
    type: 'set',
    title: {
      uz: "Fonon Elite Premium Tilla Komplekt (Zirak, Uzuk, Kulon)",
      ru: "Премиальный золотой комплект Fonon Elite (серьги, кольцо, кулон)",
      en: "Fonon Elite Premium Gold Set (Earrings, Ring, Pendant)"
    },
    price: 5200,
    gram: "38.90g",
    gramValue: 38.9,
    proba: "750",
    karat: "18K",
    desc: {
      uz: "Dabdabali qirollik to'plami. 18 karatli oltin va eng yorqin silliqlangan yoqut toshlari bilan ishlangan.",
      ru: "Роскошный королевский гарнитур из золота 750 пробы с натуральными драгоценными камнями.",
      en: "Splendid royal jewelry suite crafted in solid 18K gold and set with certified natural gemstones."
    },
    store: "Fonon", location: "Toshkent sh.", logo: "",
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 8,
    cat: 'gold',
    type: 'watch',
    title: {
      uz: "Chorsu Gold - Prezidentlik Tilla Soati 750 Proba",
      ru: "Chorsu Gold - Президентские золотые часы 750 пробы",
      en: "Chorsu Gold - Presidential Luxury Gold Watch 18K"
    },
    price: 9500,
    gram: "115.00g",
    gramValue: 115,
    proba: "750",
    karat: "18K",
    desc: {
      uz: "O'zbekiston ramzlari tushirilgan yoki klassik shveysariya mexanizmiga ega toza tilladan yasalgan dabdabali mexanik soat.",
      ru: "Роскошные золотые автоматические часы классического швейцарского стиля из чистого золота.",
      en: "Magnificent automatic luxury mechanical watch crafted completely in solid 18K yellow gold."
    },
    store: "Chorsu Gold Center", location: "Samarqand", logo: "",
    img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 9,
    cat: 'silver',
    type: 'ring',
    title: {
      uz: "Akzar - Kumush Erkaklar Uzugi 'Sulton'",
      ru: "Akzar - Серебряное мужское кольцо 'Султан'",
      en: "Akzar - Sultan Sterling Silver Men's Ring"
    },
    price: 95,
    gram: "9.50g",
    gramValue: 9.5,
    proba: "925",
    karat: "S",
    desc: {
      uz: "Qora toshli, filigran naqshlar bilan bezatilgan shohona erkaklar kumush uzugi.",
      ru: "Мужское серебряное кольцо ручной работы с натуральным черным агатом и гравировкой.",
      en: "High-end sterling silver men's ring adorned with a bold black onxy stone and filigree carvings."
    },
    store: "Akzar", location: "Toshkent sh.", logo: "",
    img: "https://images.unsplash.com/photo-1627293021151-507e1577ff3c?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 10,
    cat: 'silver',
    type: 'earring',
    title: {
      uz: "Bob Bold - Elegant Osmondagi Yulduz Kumush Zirak",
      ru: "Bob Bold - Серебряные серьги 'Звездное небо'",
      en: "Bob Bold - Starry Sky Sterling Silver Earrings"
    },
    price: 75,
    gram: "5.40g",
    gramValue: 5.4,
    proba: "925",
    karat: "S",
    desc: {
      uz: "Yuzlab mitti olmos simulatorlari bilan porlovchi nafis va chiroyli kumush ziraklar.",
      ru: "Изящные серьги из стерлингового серебра 925 пробы с россыпью фианитов.",
      en: "Delightful silver drop earrings shining brightly with hundreds of brilliant cubic zirconia."
    },
    store: "Bob Bold", location: "Xorazm", logo: "",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 11,
    cat: 'silver',
    type: 'chain',
    title: {
      uz: "Jevellery Center - Rimskiy To'qilgan Erkaklar Kumush Sepochkasi",
      ru: "Jevellery Center - Серебряная цепочка римского плетения",
      en: "Jevellery Center - Roman Link Premium Silver Chain"
    },
    price: 180,
    gram: "32.00g",
    gramValue: 32,
    proba: "925",
    karat: "S",
    desc: {
      uz: "Qalin va baquvvat to'qilgan, haqiqiy aristokratik uslubdagi olijanob erkaklar bo'yin zanjiri.",
      ru: "Массивная серебряная цепочка прочного плетения. Подходит для стильных мужчин.",
      en: "Thick and masculine sterling silver link neck chain crafted for durability and prestige."
    },
    store: "Jevellery Center", location: "Fargʻona", logo: "",
    img: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 12,
    cat: 'silver',
    type: 'pendant',
    title: {
      uz: "Bob Bold - Moviy Topaz Toshli Kumush Kulon",
      ru: "Bob Bold - Серебряный кулон с голубым топазом",
      en: "Bob Bold - Blue Topaz Sterling Silver Pendant"
    },
    price: 85,
    gram: "4.80g",
    gramValue: 4.8,
    proba: "925",
    karat: "S",
    desc: {
      uz: "Haqiqiy moviy topaz toshi hoshiyalangan, quyosh nurlarida ajoyib tarzda tovlanuvchi kumush kulon.",
      ru: "Кулон из серебра 925 пробы с ярким натуральным голубым топазом высокой чистоты.",
      en: "Elegant silver pendant holding an eye-catching genuine faceted sky blue topaz stone."
    },
    store: "Bob Bold", location: "Navoiy", logo: "",
    img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 13,
    cat: 'silver',
    type: 'watch',
    title: {
      uz: "Luxury National - Retro Uslubdagi Kumush Soat",
      ru: "Luxury National - Серебряные часы в стиле ретро",
      en: "Luxury National - Silver Vintage Dial Watch"
    },
    price: 350,
    gram: "45.00g",
    gramValue: 45,
    proba: "925",
    karat: "S",
    desc: {
      uz: "Bilaguzugi to'liq kumushdan to'qilgan, antiqa ko'rinishga ega yapon kvars mexanizmli ayollar soati.",
      ru: "Изысканные женские часы с браслетом из чистого серебра и надежным кварцевым механизмом.",
      en: "Exquisite women's wristwatch featuring a bracelet intricately crafted in solid 925 silver."
    },
    store: "National Bank", location: "Toshkent sh.", logo: "",
    img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 14,
    cat: 'silver',
    type: 'set',
    title: {
      uz: "Jevellery Center - Zumrad Toshli Qirollik Kumush To'plami",
      ru: "Jevellery Center - Королевский серебряный комплект с изумрудом",
      en: "Jevellery Center - Royal Silver Emerald jewelry Set"
    },
    price: 420,
    gram: "22.50g",
    gramValue: 22.5,
    proba: "925",
    karat: "S",
    desc: {
      uz: "To'q yashil zumrad toshlari bilan qoplangan uzuk, zirak va shokiladan iborat to'liq kumush garnituri.",
      ru: "Потрясающий роскошный серебряный набор с глубоко зелеными изумрудами (серьги, кольцо, кулон).",
      en: "Breathtaking silver suite containing a ring, drop earrings, and necklace set with emeralds."
    },
    store: "Jevellery Center", location: "Namangan", logo: "",
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200"
  }
];

export const STRINGS: Record<Language, UIStrings> = {
  uz: {
    home: "Bosh", gold: "Tilla", silver: "Kumush", cart: "Savat", sellTitle: "Mahsulot joylash",
    sellPrompt: "Tilla sotmoqchiman", sellQuestion: "Mahsulot ma'lumotlarini to'ldiring",
    sellStoreOnly: "Faqat tasdiqlangan do'konlar uchun",
    inviteFriends: "Do'stlarni taklif qilish", inviteText: "Do'stlaringizni taklif qiling va imkoniyatlarni ulashing",
    copyLink: "Havolani nusxalash", linkCopied: "Nusxalandi!", share: "Ulashish",
    checkout: "Buyurtma berish", total: "Jami", emptyCart: "Savat bo'sh", emptyWishlist: "Sevimlilar bo'sh",
    settings: "Sozlamalar", theme: "Kun/Tun rejimi", language: "Til", adminContact: "Adminga yozish",
    favorites: "Sevimlilar", save: "Saqlash", cancel: "Bekor qilish", 
    edit: "Tahrirlash", send: "Joylashtirish", sentToAdmin: "Mahsulot tekshiruvga yuborildi!", 
    allProducts: "Barcha Mahsulotlar", storeProducts: "Mahsulotlari", uploadImg: "Asosiy rasm", 
    uploaded: "Rasm yuklandi", close: "Yopish", filter: "Saralash", sortBy: "Tartiblash", 
    priceLow: "Arzonidan qimmatiga", priceHigh: "Qimmatidan arzoniga", allRegions: "Barcha viloyatlar", 
    selectPayment: "To'lov usulini tanlang", cash: "Naqd pulda", installment: "Bo'lib to'lash", 
    orderAccepted: "Buyurtma qabul qilindi!", statusOrdered: "Buyurtma berildi",
    top: "TOP", new: "YANGI", showAll: "Barcha do'konlar mahsuloti", weight: "Vazni", purity: "Proba",
    location: "Hudud", aboutProduct: "Mahsulot haqida", inStore: "DO'KONIDA",
    addToCart: "SAVATGA QO'SHISH", profile: "Profil", items: "buyumlar",
    cashSuccess: "Buyurtmangiz qabul qilindi. Buyurtmani yetkazib berilgandan so'ng to'lovni amalga oshirasiz. Xaridingizdan minnatdormiz!",
    promocode: "Promokod", enterPromo: "Promokodni kiriting", 
    promoOnlyCash: "Promokod faqat naqd pulda to'lov qilishda amal qiladi.",
    promoApplied: "Promokod qabul qilindi! 🎉",
    cashDescription: "To'lov eshik oldida",
    installmentDescription: "Tez kunda: Uzum, Alif...",
    addProduct: "Mahsulot qo'shish", productTitle: "Nomi", productPrice: "Narxi ($)", 
    productWeight: "Vazni (gramm)", productPurity: "Sifati (Proba)", productDesc: "Tavsif",
    selectCat: "Kategoriya", selectReg: "Hududni tanlang",
    specialOffer: "MAXSUS TAKLIF", login: "Kirish", password: "Parol",
    loginAsStore: "Do'kon egasi sifatida kirish", wrongCreds: "Login yoki parol xato!",
    logout: "Chiqish",
    fullNameLabel: "To'liq ism", phoneLabel: "Telefon raqami", telegramLabel: "Telegram username",
    profilePictureLabel: "Profil rasmi"
  },
  ru: {
    home: "Главная", gold: "Золото", silver: "Серебро", cart: "Корзина", sellTitle: "Разместить товар",
    sellPrompt: "Хочу продать золото", sellQuestion: "Заполните данные о товаре",
    sellStoreOnly: "Только для проверенных магазинов",
    inviteFriends: "Пригласить друзей", inviteText: "Приглашайте друзей и делитесь возможностями",
    copyLink: "Копировать ссылку", linkCopied: "Скопировано!", share: "Поделиться",
    checkout: "Оформить заказ", total: "Итого", emptyCart: "Корзина пуста", emptyWishlist: "Избранное пусто",
    settings: "Настройки", theme: "День/Ночь", language: "Язык", adminContact: "Написать админу",
    favorites: "Избранное", save: "Сохранить", cancel: "Отмена", 
    edit: "Редактировать", send: "Разместить", sentToAdmin: "Товар отправлен на проверку!", 
    allProducts: "Все товары", storeProducts: "Товары", uploadImg: "Основное фото", 
    uploaded: "Фото загружено", close: "Закрыть", filter: "Фильтр", sortBy: "Сортировка", 
    priceLow: "Сначала дешевле", priceHigh: "Сначала дороже", allRegions: "Все регионы", 
    selectPayment: "Выберите способ оплаты", cash: "Наличными", installment: "Рассрочка", 
    orderAccepted: "Заказ принят!", statusOrdered: "Заказано",
    top: "ТОП", new: "НОВОЕ", showAll: "Все товары магазинов", weight: "Вес", purity: "Проба",
    location: "Регион", aboutProduct: "О товаре", inStore: "В МАГАЗИНЕ",
    addToCart: "В КОРЗИНУ", profile: "Профиль", items: "изделия",
    cashSuccess: "Ваш заказ принят. Вы произведете оплату после доставки заказа. Благодарим за покупку!",
    promocode: "Промокод", enterPromo: "Введите промокод",
    promoOnlyCash: "Промокод действует только при оплате наличными.",
    promoApplied: "Промокод принят! 🎉",
    cashDescription: "Оплата при доставке",
    installmentDescription: "Скоро: Uzum, Alif...",
    addProduct: "Добавить товар", productTitle: "Название", productPrice: "Цена ($)", 
    productWeight: "Вес (грамм)", productPurity: "Проба", productDesc: "Описание",
    selectCat: "Категория", selectReg: "Выберите регион",
    specialOffer: "СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ", login: "Войти", password: "Пароль",
    loginAsStore: "Войти как магазин", wrongCreds: "Неверный логин или пароль!",
    logout: "Выйти",
    fullNameLabel: "Полное имя", phoneLabel: "Номер телефона", telegramLabel: "Telegram username",
    profilePictureLabel: "Фото профиля"
  },
  en: {
    home: "Home", gold: "Gold", silver: "Silver", cart: "Cart", sellTitle: "List Product",
    sellPrompt: "I want to sell gold", sellQuestion: "Fill in the product details",
    sellStoreOnly: "Only for verified stores",
    inviteFriends: "Invite Friends", inviteText: "Invite your friends and share the experience",
    copyLink: "Copy Link", linkCopied: "Copied!", share: "Share",
    checkout: "Checkout", total: "Total", emptyCart: "Cart is empty", emptyWishlist: "Wishlist is empty",
    settings: "Settings", theme: "Light/Dark mode", language: "Language", adminContact: "Contact Admin",
    favorites: "Wishlist", save: "Save", cancel: "Cancel", 
    edit: "Edit", send: "List Product", sentToAdmin: "Product sent for approval!", 
    allProducts: "All Products", storeProducts: "Products", uploadImg: "Main Image", 
    uploaded: "Image uploaded", close: "Close", filter: "Filter", sortBy: "Sort by", 
    priceLow: "Price: Low to High", priceHigh: "Price: High to Low", allRegions: "All Regions", 
    selectPayment: "Select payment method", cash: "Cash", installment: "Installment", 
    orderAccepted: "Order accepted!", statusOrdered: "Ordered",
    top: "TOP", new: "NEW", showAll: "Show products from all stores", weight: "Weight", purity: "Purity",
    location: "Location", aboutProduct: "Product Info", inStore: "IN STORE",
    addToCart: "ADD TO CART", profile: "Profile", items: "items",
    cashSuccess: "Your order has been accepted. You will make the payment after the order is delivered. Thank you for your purchase!",
    promocode: "Promocode", enterPromo: "Enter promocode",
    promoOnlyCash: "Promocode only valid for cash payments.",
    promoApplied: "Promocode applied! 🎉",
    cashDescription: "Payment on delivery",
    installmentDescription: "Coming soon: Uzum, Alif...",
    addProduct: "Add Product", productTitle: "Title", productPrice: "Price ($)", 
    productWeight: "Weight (gram)", productPurity: "Purity (Probe)", productDesc: "Description",
    selectCat: "Category", selectReg: "Select Region",
    specialOffer: "SPECIAL OFFER", login: "Login", password: "Password",
    loginAsStore: "Login as Store Owner", wrongCreds: "Wrong login or password!",
    logout: "Logout",
    fullNameLabel: "Full Name", phoneLabel: "Phone Number", telegramLabel: "Telegram Username",
    profilePictureLabel: "Profile Picture"
  }
};

export const ADMIN_TELEGRAM = "https://t.me/Rich_Emirates";
export const IMG_API_KEY = ((import.meta as any)?.env?.VITE_IMG_API_KEY as string) || "6d207e02198a847aa98d0a2a901485a5";
export const UZUM_LINK = "https://uzum.uz/";
