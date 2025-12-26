import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Truck, Lock, X, Save, ChevronDown, ChevronRight, Navigation, Users, Trash2, Plus, Flower, CheckCircle, AlertCircle, ExternalLink, Globe, LogOut, Search, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- BAGIAN 1: IMPOR FIREBASE ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0sfhxT8cmISmM9llIL8xzm4Uw0v8Uue0",
  authDomain: "ongkir-mfg.firebaseapp.com",
  projectId: "ongkir-mfg",
  storageBucket: "ongkir-mfg.firebasestorage.app",
  messagingSenderId: "688469956664",
  appId: "1:688469956664:web:c9d9325894469fae01aecd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- DATA MENTAH WILAYAH (DATA STANDAR SEBELUM KONEK DATABASE) ---
const RAW_DATA = [
  // ================= KOTA MALANG (5 KECAMATAN) =================
  {
    id: 'kota_klojen',
    name: 'Klojen (Kota)',
    type: 'Kota Malang',
    basePrice: 10000,
    distance: '1-3 km',
    villages: ['Bareng', 'Gading Kasri', 'Kasin', 'Kauman', 'Kiduldalem', 'Klojen', 'Oro-oro Dowo', 'Penanggungan', 'Rampal Celaket', 'Samaan', 'Sukoharjo']
  },
  {
    id: 'kota_blimbing',
    name: 'Blimbing (Kota)',
    type: 'Kota Malang',
    basePrice: 15000,
    distance: '3-6 km',
    villages: ['Arjosari', 'Balearjosari', 'Blimbing', 'Bunulrejo', 'Jodipan', 'Kesatrian', 'Pandanwangi', 'Polehan', 'Polowijen', 'Purwantoro', 'Purwodadi']
  },
  {
    id: 'kota_lowokwaru',
    name: 'Lowokwaru (Kota)',
    type: 'Kota Malang',
    basePrice: 15000,
    distance: '3-6 km',
    villages: ['Dinoyo', 'Jatimulyo', 'Ketawanggede', 'Lowokwaru', 'Merjosari', 'Mojolangu', 'Sumbersari', 'Tasikmadu', 'Tlogomas', 'Tulusrejo', 'Tunggulwulung', 'Tunjungsekar']
  },
  {
    id: 'kota_sukun',
    name: 'Sukun (Kota)',
    type: 'Kota Malang',
    basePrice: 15000,
    distance: '4-7 km',
    villages: ['Bakalan Krajan', 'Bandulan', 'Bandungrejosari', 'Ciptomulyo', 'Gadang', 'Karangbesuki', 'Kebonsari', 'Mulyorejo', 'Pisangcandi', 'Sukun', 'Tanjungrejo']
  },
  {
    id: 'kota_kedungkandang',
    name: 'Kedungkandang (Kota)',
    type: 'Kota Malang',
    basePrice: 18000,
    distance: '5-9 km',
    villages: ['Arjowinangun', 'Bumiayu', 'Buring', 'Cemorokandang', 'Kedungkandang', 'Kotalama', 'Lesanpuro', 'Madyopuro', 'Mergosono', 'Sawojajar', 'Tlogowaru', 'Wonokoyo']
  },

  // ================= KABUPATEN MALANG =================
  {
    id: 'kab_singosari',
    name: 'Singosari',
    type: 'Kab. Malang',
    basePrice: 25000,
    distance: '10-15 km',
    villages: ['Ardimulyo', 'Banjararum', 'Baturetno', 'Candirenggo', 'Dengkol', 'Gunungrejo', 'Klampok', 'Langlang', 'Losari', 'Pagentan', 'Purwoasri', 'Randuagung', 'Tamanharjo', 'Toyomarto', 'Tunjungtirto', 'Watugede', 'Wonorejo']
  },
  {
    id: 'kab_lawang',
    name: 'Lawang',
    type: 'Kab. Malang',
    basePrice: 35000,
    distance: '18-22 km',
    villages: ['Bedali', 'Kalirejo', 'Ketindan', 'Lawang', 'Mulyoarjo', 'Sidodadi', 'Sidoluhur', 'Srigading', 'Sumber Ngepoh', 'Sumber Porong', 'Turirejo', 'Wonorejo']
  },
  {
    id: 'kab_karangploso',
    name: 'Karangploso',
    type: 'Kab. Malang',
    basePrice: 20000,
    distance: '8-12 km',
    villages: ['Ampeldento', 'Bocek', 'Donowarih', 'Girimoyo', 'Kepuharjo', 'Ngenep', 'Ngijo', 'Tawangargo', 'Tegalgondo']
  },
  {
    id: 'kab_dau',
    name: 'Dau',
    type: 'Kab. Malang',
    basePrice: 20000,
    distance: '8-12 km',
    villages: ['Gadingkulon', 'Kalisongo', 'Karangwidoro', 'Kucur', 'Landungsari', 'Mulyoagung', 'Petungsewu', 'Selorejo', 'Sumbersekar', 'Tegalweru']
  },
  {
    id: 'kab_wagir',
    name: 'Wagir',
    type: 'Kab. Malang',
    basePrice: 25000,
    distance: '10-15 km',
    villages: ['Dalisodo', 'Gondowangi', 'Jedong', 'Mendalanwangi', 'Pandanlandung', 'Pandanrejo', 'Parangargo', 'Petungsewu', 'Sidorahayu', 'Sitirejo', 'Sukodadi', 'Sumbersuko']
  },
  {
    id: 'kab_pujon',
    name: 'Pujon',
    type: 'Kab. Malang',
    basePrice: 50000,
    distance: '25-30 km',
    villages: ['Bendosari', 'Madiredo', 'Ngabab', 'Ngroto', 'Pandesari', 'Pujon Kidul', 'Pujon Lor', 'Sukomulyo', 'Tawangsari', 'Wiyurejo']
  },
  {
    id: 'kab_ngantang',
    name: 'Ngantang',
    type: 'Kab. Malang',
    basePrice: 60000,
    distance: '35-40 km',
    villages: ['Banturejo', 'Banjarejo', 'Jombok', 'Kaumrejo', 'Mulyorejo', 'Ngantru', 'Pageroto', 'Pandansari', 'Pagersari', 'Purworejo', 'Sidodadi', 'Sumberagung', 'Tulungrejo', 'Waturejo']
  },
  {
    id: 'kab_kasembon',
    name: 'Kasembon',
    type: 'Kab. Malang',
    basePrice: 70000,
    distance: '45-50 km',
    villages: ['Bayem', 'Kasembon', 'Klangon', 'Pait', 'Pondokagung', 'Sukosari']
  },
  {
    id: 'kab_pakis',
    name: 'Pakis',
    type: 'Kab. Malang',
    basePrice: 30000,
    distance: '12-18 km',
    villages: ['Ampeldento', 'Asrikaton', 'Banjarejo', 'Bunutwetan', 'Kedungrejo', 'Mangliawan', 'Pakisjajar', 'Pakiskembar', 'Pucangsongo', 'Saptorenggo', 'Sekarpuro', 'Sukoanyar', 'Sumberkradenan', 'Sumberpasir', 'Tirtomoyo']
  },
  {
    id: 'kab_jabung',
    name: 'Jabung',
    type: 'Kab. Malang',
    basePrice: 35000,
    distance: '15-20 km',
    villages: ['Argosari', 'Gadingkembar', 'Gunung Jati', 'Jabung', 'Kemantren', 'Kenongo', 'Ngadirejo', 'Pandansari Lor', 'Sidomulyo', 'Sidorejo', 'Slamparejo', 'Sukolilo', 'Sukopuro', 'Taji']
  },
  {
    id: 'kab_tumpang',
    name: 'Tumpang',
    type: 'Kab. Malang',
    basePrice: 35000,
    distance: '15-20 km',
    villages: ['Benjor', 'Bokor', 'Duwet', 'Jeru', 'Kambingan', 'Kidal', 'Malangsuko', 'Ngingit', 'Pandanajeng', 'Pulungdowo', 'Slamet', 'Tulusbesar', 'Tumpang', 'Wringinsongo']
  },
  {
    id: 'kab_poncokusumo',
    name: 'Poncokusumo',
    type: 'Kab. Malang',
    basePrice: 45000,
    distance: '20-25 km',
    villages: ['Argosuko', 'Belung', 'Dawuhan', 'Gubugklakah', 'Jambesari', 'Karanganyar', 'Karangnongko', 'Ngadireso', 'Ngebruk', 'Pajaran', 'Pandansari', 'Poncokusumo', 'Sumberejo', 'Wonomulyo', 'Wringinanom', 'Wringinsongo']
  },
  {
    id: 'kab_wajak',
    name: 'Wajak',
    type: 'Kab. Malang',
    basePrice: 40000,
    distance: '20-25 km',
    villages: ['Bambang', 'Blayu', 'Bringin', 'Codo', 'Dadapan', 'Kidangbang', 'Ngembal', 'Patokpicis', 'Sukoanyar', 'Sukolilo', 'Sumberputih', 'Wajak', 'Wonoayu']
  },
  {
    id: 'kab_tajinan',
    name: 'Tajinan',
    type: 'Kab. Malang',
    basePrice: 30000,
    distance: '15-18 km',
    villages: ['Gunungronggo', 'Gunungsari', 'Jambearjo', 'Jatisari', 'Ngawonggo', 'Pandanmulyo', 'Purwosekar', 'Randugading', 'Sumbersuko', 'Tajinan', 'Tambakasri', 'Tangkilsari']
  },
  {
    id: 'kab_bululawang',
    name: 'Bululawang',
    type: 'Kab. Malang',
    basePrice: 30000,
    distance: '15-20 km',
    villages: ['Bakalan', 'Bululawang', 'Gading', 'Kasembon', 'Kasri', 'Krebet', 'Krebet Senggrong', 'Kuwolu', 'Lumbangsari', 'Pringu', 'Sempalwadak', 'Sudimoro', 'Sukonolo', 'Wandanpuro']
  },
  {
    id: 'kab_gondanglegi',
    name: 'Gondanglegi',
    type: 'Kab. Malang',
    basePrice: 35000,
    distance: '20-25 km',
    villages: ['Bulupitu', 'Ganjaran', 'Gondanglegi Kulon', 'Gondanglegi Wetan', 'Ketawang', 'Panggungrejo', 'Putat Kidul', 'Putat Lor', 'Putukrejo', 'Sepanjang', 'Sukorejo', 'Sukosari', 'Sumberjaya', 'Urek-urek']
  },
  {
    id: 'kab_pagelaran',
    name: 'Pagelaran',
    type: 'Kab. Malang',
    basePrice: 40000,
    distance: '25-30 km',
    villages: ['Balearjo', 'Banjarejo', 'Brongkal', 'Clumprit', 'Kademangan', 'Kanigoro', 'Karangsuko', 'Pagelaran', 'Sidorejo', 'Suwaru']
  },
  {
    id: 'kab_bantur',
    name: 'Bantur',
    type: 'Kab. Malang',
    basePrice: 50000,
    distance: '35-45 km',
    villages: ['Bandungrejo', 'Bantur', 'Karangsari', 'Pringgodani', 'Rejosari', 'Rejoyoso', 'Srigonco', 'Sumberbening', 'Wonokerto', 'Wonorejo']
  },
  {
    id: 'kab_gedangan',
    name: 'Gedangan',
    type: 'Kab. Malang',
    basePrice: 50000,
    distance: '40-50 km',
    villages: ['Gajahrejo', 'Gedangan', 'Girimulyo', 'Segaran', 'Sidodadi', 'Sindurejo', 'Sumberejo', 'Tumpakrejo']
  },
  {
    id: 'kab_kepanjen',
    name: 'Kepanjen (Ibukota)',
    type: 'Kab. Malang',
    basePrice: 40000,
    distance: '20-25 km',
    villages: ['Ardirejo', 'Cepokomulyo', 'Curungrejo', 'Dilem', 'Jatirejoyoso', 'Jenggolo', 'Kedungpedering', 'Kemiri', 'Kepanjen', 'Mangunrejo', 'Mojosari', 'Ngadilangkung', 'Panggungrejo', 'Sengguruh', 'Sukoraharjo', 'Talangagung', 'Tegalsari']
  },
  {
    id: 'kab_pakisaji',
    name: 'Pakisaji',
    type: 'Kab. Malang',
    basePrice: 30000,
    distance: '15-20 km',
    villages: ['Genengan', 'Glanggang', 'Jatisari', 'Karangduren', 'Karangpandan', 'Kebonagung', 'Kendalkerep', 'Pakisaji', 'Permanu', 'Sutojayan', 'Wadung', 'Wonokerso']
  },
  {
    id: 'kab_ngajum',
    name: 'Ngajum',
    type: 'Kab. Malang',
    basePrice: 40000,
    distance: '25-30 km',
    villages: ['Babadan', 'Balesari', 'Banjarsari', 'Kesamben', 'Kranggan', 'Maguan', 'Ngajum', 'Ngasem', 'Palaan']
  },
  {
    id: 'kab_wonosari',
    name: 'Wonosari',
    type: 'Kab. Malang',
    basePrice: 45000,
    distance: '30-35 km',
    villages: ['Bangsri', 'Kebobang', 'Kluwut', 'Plaosan', 'Pwonosari', 'Sumberdem', 'Sumbertempur', 'Tanahwulan']
  },
  {
    id: 'kab_kromengan',
    name: 'Kromengan',
    type: 'Kab. Malang',
    basePrice: 45000,
    distance: '30-35 km',
    villages: ['Jambuwer', 'Jatikerto', 'Karangrejo', 'Kromengan', 'Ngadirejo', 'Peniwen', 'Slorok']
  },
  {
    id: 'kab_sumberpucung',
    name: 'Sumberpucung',
    type: 'Kab. Malang',
    basePrice: 45000,
    distance: '30-35 km',
    villages: ['Jatiguwi', 'Karangkates', 'Ngebruk', 'Sambigede', 'Senggreng', 'Sumberpucung', 'Ternyang']
  },
  {
    id: 'kab_kalipare',
    name: 'Kalipare',
    type: 'Kab. Malang',
    basePrice: 55000,
    distance: '40-50 km',
    villages: ['Arjowilangun', 'Arjosari', 'Kalipare', 'Kaliasri', 'Putukrejo', 'Sukowilangun', 'Sumberpetung', 'Tumpakrejo']
  },
  {
    id: 'kab_donomulyo',
    name: 'Donomulyo',
    type: 'Kab. Malang',
    basePrice: 65000,
    distance: '50-60 km',
    villages: ['Banjarejo', 'Donomulyo', 'Kedungsalam', 'Mentaraman', 'Purwodadi', 'Purworejo', 'Sumberoto', 'Tempursari', 'Tlgu', 'Tulungrejo']
  },
  {
    id: 'kab_pagak',
    name: 'Pagak',
    type: 'Kab. Malang',
    basePrice: 55000,
    distance: '40-50 km',
    villages: ['Gampingan', 'Pagak', 'Pandanrejo', 'Sempol', 'Sumberkerto', 'Sumberejo', 'Sumbermanjing Kulon', 'Tlogorejo']
  },
  {
    id: 'kab_turen',
    name: 'Turen',
    type: 'Kab. Malang',
    basePrice: 40000,
    distance: '25-30 km',
    villages: ['Gedog Kulon', 'Gedog Wetan', 'Jeru', 'Kedok', 'Kemulan', 'Pagedangan', 'Sanankerto', 'Sanawetan', 'Sawahan', 'Sedayu', 'Talangsuko', 'Talok', 'Tanggung', 'Tawangrejeni', 'Tumpukrenteng', 'Turen', 'Undaan']
  },
  {
    id: 'kab_dampit',
    name: 'Dampit',
    type: 'Kab. Malang',
    basePrice: 45000,
    distance: '30-40 km',
    villages: ['Amadanom', 'Baturetno', 'Bumirejo', 'Dampit', 'Jambangan', 'Majangtengah', 'Pamotan', 'Pojok', 'Rembun', 'Srimulyo', 'Sukodono', 'Sumbersuko']
  },
  {
    id: 'kab_tirtoyudo',
    name: 'Tirtoyudo',
    type: 'Kab. Malang',
    basePrice: 60000,
    distance: '40-50 km',
    villages: ['Ampelgading', 'Gadungsari', 'Jogomulyan', 'Kepatihan', 'Pujiharjo', 'Purwodadi', 'Sukorejo', 'Sumbertangkil', 'Tamankuncaran', 'Tamansatriyan', 'Tirtoyudo', 'Tlogosari', 'Wonoagung']
  },
  {
    id: 'kab_ampelgading',
    name: 'Ampelgading',
    type: 'Kab. Malang',
    basePrice: 65000,
    distance: '50-60 km',
    villages: ['Argoyuwono', 'Lebakharjo', 'Mulyoasri', 'Purwoharjo', 'Sidorenggo', 'Simojayan', 'Sonowangi', 'Tamansari', 'Tawangagung', 'Tirtomarto', 'Tirtomoyo', 'Wirotaman']
  },
  {
    id: 'kab_sumawe',
    name: 'Sumbermanjing Wetan',
    type: 'Kab. Malang',
    basePrice: 60000,
    distance: '45-55 km',
    villages: ['Argotirto', 'Druju', 'Harjokuncaran', 'Kedungbanteng', 'Klepu', 'Ringinkembar', 'Ringinsari', 'Sekarbanyu', 'Sidoasri', 'Sitiarjo', 'Sumberagung', 'Sumbermanjing Wetan', 'Tambakasri', 'Tambakrejo', 'Tegalrejo']
  }
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState(() => {
    return RAW_DATA.map(kec => ({
      ...kec,
      villages: kec.villages.map(desaName => ({
        name: desaName,
        price: kec.basePrice
      }))
    }));
  });

  const [selectedKecamatanId, setSelectedKecamatanId] = useState('');
  const [selectedVillageName, setSelectedVillageName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  const [globalFreeShipping, setGlobalFreeShipping] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedKecamatan, setExpandedKecamatan] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // User Admin Management State (Default if offline/no config)
  const [adminUsers, setAdminUsers] = useState([
      { id: 1, name: 'Owner MFG', role: 'Super Admin', pass: 'admin123' },
      { id: 2, name: 'Admin Gudang', role: 'Staff', pass: 'gudang123' }
  ]);
  
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState('Staff');

  // Firebase Instances Ref
  const [db, setDb] = useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // --- FIREBASE INITIALIZATION & FULL SYNC ---
  useEffect(() => {
    const initFirebase = async () => {
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
        setIsLoading(true);
        try {
          const app = initializeApp(firebaseConfig);
          const auth = getAuth(app);
          const firestore = getFirestore(app);
          
          await signInAnonymously(auth);
          setDb(firestore);
          setIsFirebaseReady(true);
          console.log("🔥 Firebase Connected (Full Online Mode)!");

          // LOAD DATA FROM CLOUD
          try {
            // 1. Load Prices
            const pricesDoc = await getDoc(doc(firestore, "mfg_db", "prices"));
            if (pricesDoc.exists()) {
               setData(pricesDoc.data().data);
            } else {
               // First time setup: Upload RAW_DATA to cloud
               await setDoc(doc(firestore, "mfg_db", "prices"), { data: data });
            }

            // 2. Load Users
            const usersDoc = await getDoc(doc(firestore, "mfg_db", "users"));
            if (usersDoc.exists()) {
               setAdminUsers(usersDoc.data().list);
            } else {
               // First time setup
               await setDoc(doc(firestore, "mfg_db", "users"), { list: adminUsers });
            }

            // 3. Load Settings
            const settingsDoc = await getDoc(doc(firestore, "mfg_db", "settings"));
            if (settingsDoc.exists()) {
               setGlobalFreeShipping(settingsDoc.data().freeShipping);
            } else {
               await setDoc(doc(firestore, "mfg_db", "settings"), { freeShipping: false });
            }

          } catch (err) {
            console.error("Error fetching data from Firebase:", err);
            alert("Gagal mengambil data dari Cloud. Pastikan koneksi internet stabil.");
          }

        } catch (error) {
          console.error("Firebase Initialization Error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("⚠️ Firebase config not found. Running in basic mode.");
      }
    };
    initFirebase();
  }, []);

  // --- LOGIC ---
  const selectedKecamatanData = useMemo(() => 
    data.find(d => d.id === selectedKecamatanId), 
  [data, selectedKecamatanId]);

  const selectedVillageData = useMemo(() => {
    if (!selectedKecamatanData || !selectedVillageName) return null;
    return selectedKecamatanData.villages.find(v => v.name === selectedVillageName);
  }, [selectedKecamatanData, selectedVillageName]);

  const handleKecamatanChange = (e) => {
    setSelectedKecamatanId(e.target.value);
    setSelectedVillageName('');
    setShowPopup(false);
  };

  const handleVillageChange = (e) => {
    const val = e.target.value;
    setSelectedVillageName(val);
    setShowPopup(false); 
  };

  const handleCheckOngkir = () => {
    if (selectedVillageName) {
        setShowPopup(true);
    }
  };

  const getFinalPrice = () => {
    if (globalFreeShipping) return 0;
    if (selectedVillageData) return selectedVillageData.price;
    return 0;
  };

  // --- AUTH LOGIC ---
  const handleLogin = () => {
    const validUser = adminUsers.find(u => u.pass === passwordInput);
    
    if (validUser) { 
      setIsAuthenticated(true);
      setLoggedInUser(validUser);
      setPasswordInput('');
    } else {
      alert('Akses Ditolak: Password tidak dikenali sistem.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setPasswordInput('');
    setActiveTab('dashboard');
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setPasswordInput('');
    setActiveTab('dashboard');
  };

  // --- FULL ONLINE DATA OPERATIONS ---
  const handleUpdateVillagePrice = (kecId, villageName, newPrice) => {
    setHasChanges(true);
    setData(prevData => prevData.map(kec => {
      if (kec.id !== kecId) return kec;
      return {
        ...kec,
        villages: kec.villages.map(v => 
          v.name === villageName ? { ...v, price: parseInt(newPrice) || 0 } : v
        )
      };
    }));
  };

  const handleSaveChanges = async () => {
    setHasChanges(false);
    
    if (isFirebaseReady && db) {
        try {
            // SAVE ONLY TO CLOUD
            await setDoc(doc(db, "mfg_db", "prices"), { data: data });
            alert("Data BERHASIL disimpan ke Cloud Database!");
        } catch (e) {
            alert("Gagal menyimpan ke Cloud: " + e.message);
            setHasChanges(true); // Revert changes flag if failed
        }
    } else {
        alert("Konfigurasi Firebase belum dipasang! Data tidak tersimpan di server.");
    }
  };

  const handleToggleFreeShipping = async () => {
      const newVal = !globalFreeShipping;
      setGlobalFreeShipping(newVal);
      // Direct Sync
      if(isFirebaseReady && db) {
          try {
            await setDoc(doc(db, "mfg_db", "settings"), { freeShipping: newVal });
          } catch(e) { console.error("Sync error", e); }
      }
  }

  const toggleKecamatan = (id) => {
    if (expandedKecamatan === id) {
      setExpandedKecamatan(null);
    } else {
      setExpandedKecamatan(id);
    }
  };

  const handleAddUser = async () => {
    if (!newUser || !newPass) return alert("Isi username dan password!");
    if (adminUsers.some(u => u.name.toLowerCase() === newUser.toLowerCase())) {
        return alert("Username sudah terpakai!");
    }

    const newId = Date.now();
    const updatedUsers = [...adminUsers, { 
        id: newId, 
        name: newUser, 
        role: newRole, 
        pass: newPass 
    }];
    
    setAdminUsers(updatedUsers);
    setNewUser('');
    setNewPass('');
    setNewRole('Staff');

    // Direct Sync to Cloud
    if(isFirebaseReady && db) {
        try {
            await setDoc(doc(db, "mfg_db", "users"), { list: updatedUsers });
            alert(`User ${newUser} tersimpan di Cloud!`);
        } catch (e) {
            alert("Gagal simpan user ke cloud: " + e.message);
        }
    } else {
        alert("Mode Offline: User hanya tersimpan sementara.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (adminUsers.length <= 1) return alert("Tidak bisa menghapus user terakhir!");
    if (confirm("Yakin ingin menghapus akses user ini?")) {
        const updatedUsers = adminUsers.filter(u => u.id !== id);
        setAdminUsers(updatedUsers);
        
        if(isFirebaseReady && db) {
            await setDoc(doc(db, "mfg_db", "users"), { list: updatedUsers });
        }
    }
  };

  // --- RENDER COMPONENT ---
  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden bg-slate-900 text-white selection:bg-emerald-500 selection:text-white">
      
      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-800 to-slate-950"></div>

      <div className="relative z-10 max-w-md mx-auto h-[100dvh] flex flex-col shadow-2xl bg-white/5 backdrop-blur-md border-x border-white/10 overflow-hidden">
        
        {/* --- HEADER (COMPACT) --- */}
        <header className="pt-12 pb-1 px-6 text-center shrink-0">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} 
            className="w-14 h-14 mx-auto mb-1 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(16,185,129,0.3)] group hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all duration-500"
          >
            <Flower className="text-emerald-400 w-8 h-8 group-hover:scale-110 group-hover:rotate-180 transition-all duration-700 ease-in-out drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-xl font-black text-white tracking-tight drop-shadow-2xl"
            style={{ textShadow: '0 0 1px rgba(255,255,255,0.5)' }}
          >
            MFG <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 filter drop-shadow-sm">Integrated System</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} delay={0.2}
            className="text-[9px] font-bold tracking-[0.3em] text-emerald-300/80 uppercase mt-0.5 border-b border-white/10 pb-1 inline-block"
          >
            Digital Ecosystem v2.0
          </motion.p>
        </header>

        {/* --- MAIN FORM (COMPACT) --- */}
        <main className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar flex flex-col justify-center">
          
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-10 space-y-4">
                 <RefreshCw className="animate-spin text-emerald-500 w-8 h-8" />
                 <p className="text-xs text-slate-400 animate-pulse">Menghubungkan ke Cloud Database...</p>
             </div>
          ) : (
            <>
                {/* KOTAK 1: CEK ONGKIR */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden group shrink-0"
                >
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent rotate-45 pointer-events-none"></div>

                    <div className="relative z-10 mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Cek Tarif Pengiriman</h3>
                    </div>

                    <div className="mb-2 relative z-10">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5 ml-1 tracking-wider">Area Pengiriman</label>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Navigation className="h-4 w-4 text-emerald-400 group-focus-within/input:text-emerald-300 transition-colors shadow-emerald-500/50" />
                            </div>
                            <select
                                value={selectedKecamatanId}
                                onChange={handleKecamatanChange}
                                className="block w-full pl-9 pr-8 py-2.5 text-xs text-white bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-slate-800/80 transition-all appearance-none cursor-pointer font-medium tracking-wide shadow-inner"
                            >
                                <option value="" className="text-slate-500">Cari Lokasi Kecamatan...</option>
                                <optgroup label="KOTA MALANG" className="bg-slate-800 text-emerald-400 font-bold">
                                    {data.filter(d => d.type === 'Kota Malang').map(item => <option key={item.id} value={item.id} className="text-white">{item.name}</option>)}
                                </optgroup>
                                <optgroup label="KABUPATEN MALANG" className="bg-slate-800 text-teal-400 font-bold">
                                    {data.filter(d => d.type === 'Kab. Malang').map(item => <option key={item.id} value={item.id} className="text-white">{item.name}</option>)}
                                </optgroup>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-emerald-500/50"><ChevronDown className="h-4 w-4" /></div>
                        </div>
                    </div>

                    <div className="overflow-hidden relative z-10">
                        <div className="mb-1 pt-2 border-t border-white/10">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5 ml-1 tracking-wider">Titik Tujuan (Desa/Kel)</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className={`h-4 w-4 transition-colors ${selectedKecamatanData ? 'text-emerald-400' : 'text-slate-600'}`} />
                                </div>
                                <select
                                    value={selectedVillageName}
                                    onChange={handleVillageChange}
                                    disabled={!selectedKecamatanData}
                                    className={`block w-full pl-9 pr-8 py-2.5 text-xs text-white bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-slate-800/80 transition-all appearance-none font-medium tracking-wide shadow-inner ${!selectedKecamatanData ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                >
                                    <option value="" className="text-slate-500">{selectedKecamatanData ? "Pilih Kelurahan..." : "Pilih Area Pengiriman Terlebih Dahulu..."}</option>
                                    {selectedKecamatanData?.villages.sort((a,b) => a.name.localeCompare(b.name)).map((v, idx) => <option key={idx} value={v.name} className="text-white bg-slate-800">{v.name}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-emerald-500/50"><ChevronDown className="h-4 w-4" /></div>
                            </div>
                        </div>

                        <motion.button
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: selectedVillageName ? 1.02 : 1 }} whileTap={{ scale: selectedVillageName ? 0.98 : 1 }}
                            onClick={handleCheckOngkir} disabled={!selectedVillageName}
                            className={`w-full mt-2 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${selectedVillageName ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-900 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer' : 'bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
                        >
                            <Search size={14} className={selectedVillageName ? 'animate-pulse' : ''} /> CEK ONGKIR
                        </motion.button>
                    </div>
                </motion.div>
                
                {/* KOTAK 2: PORTAL MITRA */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden shrink-0"
                >
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent rotate-45 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Portal Mitra</h3>
                        </div>

                        <a href="https://mfg-portal.vercel.app/" target="_blank" rel="noopener noreferrer" className="block w-full group">
                            <button className="w-full relative overflow-hidden bg-slate-900/50 hover:bg-emerald-600 border border-emerald-500/30 text-white py-2.5 rounded-xl transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <span className="font-bold tracking-widest text-xs uppercase group-hover:scale-105 transition-transform">Integrated Mitra</span>
                                    <ExternalLink size={14} className="text-emerald-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            </button>
                        </a>
                        <p className="text-[9px] text-slate-400 mt-1.5 text-center italic leading-tight opacity-70">Akses khusus mitra untuk manajemen pesanan dan laporan.</p>
                    </div>
                </motion.div>

                {/* INFO PROMO */}
                <AnimatePresence>
                    {globalFreeShipping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-pink-600/90 to-rose-600/90 backdrop-blur-md border border-pink-400/30 text-white p-3 rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.4)] shrink-0">
                            <div className="bg-white/20 p-2 rounded-full shadow-inner"><Truck size={16} /></div>
                            <div className="flex-1">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-pink-200">Limited Time Offer</p>
                                <p className="text-xs font-bold">GRATIS ONGKIR DIAKTIFKAN!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
          )}
        </main>

        {/* --- POPUP RESULT --- */}
        <AnimatePresence>
          {showPopup && selectedVillageData && (
            <div className="fixed inset-x-0 bottom-0 z-40 max-w-md mx-auto pointer-events-none flex flex-col justify-end h-screen">
              <motion.div
                initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_60px_rgba(16,185,129,0.2)] border-t border-emerald-500/30 p-6 pb-10 relative overflow-hidden"
              >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] rounded-full mb-8"></div>
                <button onClick={() => setShowPopup(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white/5 text-slate-400 rounded-full hover:bg-rose-500/20 hover:text-rose-500 border border-white/5 hover:border-rose-500/50 transition-all"><X size={18} /></button>
                
                <div className="text-center mb-6 mt-4">
                  <span className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">BIAYA TAMBAHAN ONGKIR</span>
                  <div className="flex items-center justify-center gap-2 text-white">
                    <span className="text-xl font-medium text-slate-500 mt-2">Rp</span>
                    <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl">{getFinalPrice().toLocaleString('id-ID')}</span>
                  </div>
                  {getFinalPrice() === 0 && <span className="text-sm text-pink-500 font-bold mt-2 block animate-pulse tracking-widest border border-pink-500/30 px-3 py-1 rounded-lg bg-pink-500/10 inline-block">FREE ONGKIR</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Jarak Tempuh</p>
                    <div className="flex items-center gap-2">
                      <Navigation size={16} className="text-emerald-500 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all" />
                      <span className="font-bold text-lg text-white">{selectedKecamatanData.distance}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                     <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Lokasi</p>
                     <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-emerald-500 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all" />
                       <span className="font-bold text-lg text-white truncate">{selectedVillageName}</span>
                     </div>
                  </div>
                </div>

                <div className={`p-4 rounded-3xl border flex gap-4 items-start relative overflow-hidden transition-all ${getFinalPrice() === 0 ? 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30' : 'bg-slate-800/50 border-white/10'}`}>
                  {getFinalPrice() > 0 ? (<AlertCircle className="text-amber-400 w-6 h-6 flex-shrink-0 mt-0.5 shadow-amber-500/20" />) : (<div className="relative"><div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 animate-pulse"></div><CheckCircle className="text-emerald-400 w-6 h-6 flex-shrink-0 mt-0.5 relative z-10 animate-[pulse_2s_infinite]" /></div>)}
                  <div className="relative z-10">
                    <h4 className={`text-xs font-bold uppercase mb-1 tracking-wide ${getFinalPrice() > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>Informasi MFG</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {getFinalPrice() > 0 ? (<>Alamat Tersebut Sudah Memasuki Kawasan Kabupaten Malang dan dikenakan tambahan ongkir.<br/><span className="text-emerald-400 font-bold">Free ongkir Tercover Seluruh KOTA MALANG.</span></>) : (<span className="font-medium text-white flex flex-col gap-1">Area Ini Sudah Tercover Area Free Ongkir Pengiriman<span className="flex gap-1 mt-1"><span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-150"></span><span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-300"></span></span></span>)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- FOOTER (COMPACT) --- */}
        <footer className="shrink-0 p-3 text-center pb-10">
          <div className="space-y-0.5 mb-2 text-slate-400/60">
            <h3 className="font-bold text-slate-300 text-xs tracking-wide">Workshop Malang Florist Group</h3>
            <p className="text-[10px] font-light">Jl. Candi Bajangratu 1 Selatan No 16 B - Kota Malang</p>    
          </div>

          <div className="flex justify-between items-center px-4 border-t border-white/5 pt-2">
            <button onClick={() => setIsAdminOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300"><Lock size={14} /></button>
            <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-600 font-mono tracking-widest">v2.1.3 FUTURA</span>
                <span className="text-[7px] text-emerald-500/60 font-bold uppercase tracking-wider mt-0.5">Created By Malang Florist Group</span>
            </div>
            <div className="w-8 flex justify-center">
               {isFirebaseReady ? <Cloud size={12} className="text-emerald-500 animate-pulse" title="Cloud Connected" /> : <CloudOff size={12} className="text-slate-700" title="Local Mode" />}
            </div>
          </div>
        </footer>

      </div>

      {/* --- ADMIN MODAL --- */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 flex flex-col max-h-[85vh] transition-all duration-500 ${isAuthenticated ? 'h-[85vh]' : 'h-auto py-6'}`}>
              <div className="bg-slate-950 p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                    <div className="flex flex-col">
                        <h2 className="text-white font-bold text-sm tracking-[0.2em]">ADMIN CONSOLE</h2>
                        {isAuthenticated && loggedInUser && (<span className="text-[10px] text-emerald-500 font-medium">Hello, {loggedInUser.name}</span>)}
                    </div>
                </div>
                <button onClick={handleCloseAdmin} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden relative bg-slate-900">
                {!isAuthenticated ? (
                  <div className="space-y-6 px-4">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 shadow-inner"><Lock size={30} /></div>
                        <p className="text-sm text-slate-400 font-medium tracking-wide">Security Access Required</p>
                    </div>
                    <input type="password" className="w-full bg-slate-950 border border-slate-700 text-white p-4 rounded-xl text-center font-bold tracking-[0.5em] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:tracking-normal placeholder:text-slate-600" placeholder="••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                    <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold tracking-wider shadow-lg shadow-emerald-900/50 transition-all">UNLOCK SYSTEM</button>
                  </div>
                ) : (
                  <div className="flex flex-col h-full min-h-0">
                    <div className="flex p-1 bg-slate-800 rounded-xl mb-6 shrink-0">
                        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-slate-700 text-emerald-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Fitur Utama</button>
                        <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'list' ? 'bg-slate-700 text-emerald-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Data Harga</button>
                        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'users' ? 'bg-slate-700 text-emerald-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>User Admin</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 pb-20">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-4">
                                <div className="border border-slate-700 bg-slate-800/50 rounded-2xl p-5 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Gratis Ongkir Global</h4>
                                        <p className="text-[10px] text-slate-400 mt-1">Aktifkan untuk semua wilayah</p>
                                    </div>
                                    <button onClick={handleToggleFreeShipping} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${globalFreeShipping ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${globalFreeShipping ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                                <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/20">
                                    <h4 className="font-bold text-emerald-400 text-sm mb-2">System Metrics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/50 p-3 rounded-xl border border-emerald-500/10">
                                            <p className="text-[10px] text-emerald-600 uppercase">Kecamatan</p>
                                            <p className="text-xl font-bold text-emerald-400">{data.length}</p>
                                        </div>
                                        <div className="bg-slate-900/50 p-3 rounded-xl border border-emerald-500/10">
                                            <p className="text-[10px] text-emerald-600 uppercase">Desa/Kel</p>
                                            <p className="text-xl font-bold text-emerald-400">{data.reduce((acc, curr) => acc + curr.villages.length, 0)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/30 p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold">
                                    <LogOut size={16} /> LOGOUT SYSTEM
                                </button>
                            </div>
                        )}

                        {activeTab === 'list' && (
                            <div className="space-y-3">
                                {data.map((item, index) => (
                                    <div key={item.id} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30">
                                        <button onClick={() => toggleKecamatan(item.id)} className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-750 transition-colors border-b border-transparent hover:border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <span className="w-6 h-6 rounded bg-slate-700 text-emerald-400 text-[10px] flex items-center justify-center font-bold font-mono">{index + 1}</span>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-white uppercase tracking-wide">{item.name}</p>
                                                    <p className="text-[9px] text-slate-500 mt-0.5">{item.villages.length} Desa/Kelurahan</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`text-slate-500 transition-transform ${expandedKecamatan === item.id ? 'rotate-90 text-emerald-400' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {expandedKecamatan === item.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-700 bg-slate-900/50">
                                                    {item.villages.sort((a,b) => a.name.localeCompare(b.name)).map((village, vIdx) => (
                                                        <div key={vIdx} className="flex justify-between items-center px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-white/5 transition-colors group">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <span className="text-[10px] text-slate-600 font-mono w-4 group-hover:text-emerald-500">{vIdx + 1}.</span>
                                                                <span className="text-xs text-slate-300 truncate">{village.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className="text-[10px] text-slate-500">Rp</span>
                                                                <input type="number" value={village.price} onChange={(e) => handleUpdateVillagePrice(item.id, village.name, e.target.value)} className="w-20 text-right text-xs font-bold border border-slate-700 rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-slate-950 text-emerald-400 placeholder-slate-700" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 relative overflow-hidden">
                                     <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-wider relative z-10"><Plus size={14} className="text-emerald-500" /> Tambah Admin Baru</h4>
                                    <div className="space-y-3 relative z-10">
                                        <input type="text" placeholder="Username" className="w-full bg-slate-900 text-xs border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Password (Login Access)" className="flex-1 bg-slate-900 text-xs border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                                            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="bg-slate-900 text-xs border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 text-white w-24">
                                                <option value="Staff">Staff</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Manager">Manager</option>
                                            </select>
                                        </div>
                                        <button onClick={handleAddUser} className="w-full bg-slate-700 hover:bg-emerald-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-slate-900/20">Simpan Akses</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Daftar Admin Aktif ({adminUsers.length})</h4>
                                    {adminUsers.map((user) => (
                                        <div key={user.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-slate-600 transition-colors"><Users size={18} /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{user.name}</p>
                                                    <div className="flex gap-2 items-center mt-1">
                                                        <p className="text-[9px] text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">{user.role}</p>
                                                        <p className="text-[9px] text-slate-600 font-mono">Pass: ••••••</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteUser(user.id)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Hapus User"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <AnimatePresence>
                      {hasChanges && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-6 left-6 right-6 z-20">
                          <button onClick={handleSaveChanges} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 hover:bg-emerald-400 hover:scale-105 transition-all"><Save size={18} /> SIMPAN PERUBAHAN</button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
    </div>
  );
}
