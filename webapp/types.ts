
export type Category = 'gold' | 'silver' | 'home' | 'cart' | 'wishlist' | 'store';

export interface Product {
  id: number;
  cat: 'gold' | 'silver';
  type: string;
  title: {
    uz: string;
    ru: string;
    en: string;
  };
  price: number;
  gram: string;
  gramValue: number;
  proba: string;
  karat: string;
  desc: {
    uz: string;
    ru: string;
    en: string;
  };
  store: string;
  location: string;
  logo: string;
  img: string;
}

export interface StoreOwner {
  username: string;
  storeName: string;
  token: string;
}

export interface CartItem {
  product: Product;
  status: 'pending' | 'ordered';
  orderDate?: string;
}

export interface UserAccount {
  name: string;
  username: string;
  phone: string;
  avatar?: string;
  isOwner?: boolean;
  storeName?: string;
}

export type Language = 'uz' | 'ru' | 'en';

export type SortOption = 'none' | 'price-asc' | 'price-desc';

export interface UIStrings {
  home: string;
  gold: string;
  silver: string;
  cart: string;
  sellTitle: string;
  sellPrompt: string;
  sellQuestion: string;
  sellStoreOnly: string;
  inviteFriends: string;
  inviteText: string;
  copyLink: string;
  linkCopied: string;
  share: string;
  checkout: string;
  total: string;
  emptyCart: string;
  emptyWishlist: string;
  settings: string;
  theme: string;
  language: string;
  adminContact: string;
  favorites: string;
  save: string;
  cancel: string;
  edit: string;
  send: string;
  sentToAdmin: string;
  allProducts: string;
  storeProducts: string;
  uploadImg: string;
  uploaded: string;
  close: string;
  filter: string;
  sortBy: string;
  priceLow: string;
  priceHigh: string;
  allRegions: string;
  selectPayment: string;
  cash: string;
  installment: string;
  orderAccepted: string;
  statusOrdered: string;
  top: string;
  new: string;
  showAll: string;
  weight: string;
  purity: string;
  location: string;
  aboutProduct: string;
  inStore: string;
  addToCart: string;
  profile: string;
  items: string;
  cashSuccess: string;
  promocode: string;
  enterPromo: string;
  promoOnlyCash: string;
  promoApplied: string;
  cashDescription: string;
  installmentDescription: string;
  addProduct: string;
  productTitle: string;
  productPrice: string;
  productWeight: string;
  productPurity: string;
  productDesc: string;
  selectCat: string;
  selectReg: string;
  specialOffer: string;
  login: string;
  password: string;
  loginAsStore: string;
  wrongCreds: string;
  logout: string;
  fullNameLabel: string;
  phoneLabel: string;
  telegramLabel: string;
  profilePictureLabel: string;
}
