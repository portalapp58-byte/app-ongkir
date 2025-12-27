import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Truck, Lock, X, Save, ChevronDown, ChevronRight, Navigation, Users, Trash2, Plus, Flower, CheckCircle, AlertCircle, ExternalLink, Globe, LogOut, Search, Cloud, CloudOff, RefreshCw, Home, Settings, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- BAGIAN 1: IMPOR FIREBASE ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration (TIDAK DIUBAH)
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

// --- DATA MENTAH WILAYAH (DATA STANDAR) ---
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
            // alert("Gagal mengambil data dari Cloud. Pastikan koneksi internet stabil.");
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

  // --- RENDER COMPONENT (RE-DESIGNED) ---
  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      
      {/* --- BACKGROUND EFFECT --- */}
      <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto h-[100dvh] flex flex-col bg-slate-900/40 backdrop-blur-sm border-x border-white/5 overflow-hidden shadow-2xl">
        
        {/* --- HEADER --- */}
        <header className="pt-8 pb-6 px-6 text-center shrink-0">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Flower className="text-white w-8 h-8" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white tracking-tight leading-none"
          >
            MFG <span className="text-emerald-400">CEK ONGKIR</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} delay={0.2}
            className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mt-2"
          >
            Malang Florist Group System
          </motion.p>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 px-6 overflow-y-auto custom-scrollbar flex flex-col justify-center gap-6 pb-24 relative z-0">
          
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4 flex-1">
                 <RefreshCw className="animate-spin text-emerald-500 w-10 h-10" />
                 <p className="text-xs text-slate-400 animate-pulse font-medium tracking-wide">Menghubungkan Database...</p>
             </div>
          ) : (
            <>
                {/* CARD CEK ONGKIR */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Truck className="w-20 h-20 text-white transform rotate-[-15deg] translate-x-4 -translate-y-4" /></div>
                    
                    <div className="relative z-10 space-y-5">
                        {/* INPUT KECAMATAN */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><Navigation size={12} /> Area Kecamatan</label>
                            <div className="relative group">
                                <select
                                    value={selectedKecamatanId}
                                    onChange={handleKecamatanChange}
                                    className="w-full bg-slate-900/80 border border-slate-700 text-sm text-white rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                >
                                    <option value="">Pilih Kecamatan...</option>
                                    <optgroup label="KOTA MALANG" className="bg-slate-800 font-bold">
                                        {data.filter(d => d.type === 'Kota Malang').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </optgroup>
                                    <optgroup label="KABUPATEN MALANG" className="bg-slate-800 font-bold">
                                        {data.filter(d => d.type === 'Kab. Malang').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </optgroup>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* INPUT DESA */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><MapPin size={12} /> Desa / Kelurahan</label>
                            <div className="relative group">
                                <select
                                    value={selectedVillageName}
                                    onChange={handleVillageChange}
                                    disabled={!selectedKecamatanData}
                                    className={`w-full bg-slate-900/80 border text-sm text-white rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium ${!selectedKecamatanData ? 'border-slate-800 opacity-50 cursor-not-allowed' : 'border-slate-700'}`}
                                >
                                    <option value="">{selectedKecamatanData ? "Pilih Tujuan..." : "Menunggu Kecamatan..."}</option>
                                    {selectedKecamatanData?.villages.sort((a,b) => a.name.localeCompare(b.name)).map((v, idx) => <option key={idx} value={v.name}>{v.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* BUTTON CEK */}
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleCheckOngkir}
                            disabled={!selectedVillageName}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${selectedVillageName ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                        >
                           <Search size={16} /> Hitung Ongkir
                        </motion.button>
                    </div>
                </motion.div>

                {/* INFO PROMO */}
                <AnimatePresence>
                    {globalFreeShipping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-pink-900/20">
                            <div className="bg-white/20 p-2.5 rounded-full"><Truck size={18} /></div>
                            <div>
                                <p className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Promo Spesial</p>
                                <p className="text-sm font-bold">GRATIS ONGKIR DIAKTIFKAN!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* DESCRIPTION (NEW) */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center px-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Info size={14} className="text-emerald-500" />
                        <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Tentang Layanan MFG</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                        Sistem Cek Ongkir Malang Florist Group (MFG) didesain khusus untuk memastikan akurasi biaya pengiriman bunga Anda. 
                        Mencakup 5 Kecamatan di Kota Malang (Free Ongkir) dan 30+ Kecamatan di Kabupaten Malang dengan tarif yang disesuaikan secara real-time berdasarkan jarak tempuh dan medan lokasi.
                    </p>
                </motion.div>
            </>
          )}
        </main>

        {/* --- POPUP RESULT (MODERN SHEET) --- */}
        <AnimatePresence>
          {showPopup && selectedVillageData && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                 onClick={() => setShowPopup(false)}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t border-white/10 pointer-events-auto relative overflow-hidden shadow-2xl"
              >
                 <div className="p-8 pb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimasi Biaya Kirim</p>
                        <div className="flex items-start justify-center gap-1 text-white">
                            <span className="text-lg font-medium text-emerald-500 mt-2">Rp</span>
                            <span className="text-6xl font-black tracking-tighter">{getFinalPrice().toLocaleString('id-ID')}</span>
                        </div>
                        {getFinalPrice() === 0 && <span className="inline-block mt-3 px-3 py-1 bg-pink-500/10 border border-pink-500/50 text-pink-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Free Ongkir</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Jarak</p>
                            <div className="flex items-center gap-2 text-white font-bold"><Navigation size={14} className="text-emerald-500" /> {selectedKecamatanData.distance}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tujuan</p>
                            <div className="flex items-center gap-2 text-white font-bold truncate"><MapPin size={14} className="text-emerald-500" /> {selectedVillageName}</div>
                        </div>
                    </div>

                    <div className={`p-5 rounded-2xl border flex gap-4 ${getFinalPrice() === 0 ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700'}`}>
                        {getFinalPrice() > 0 ? <AlertCircle className="text-amber-400 shrink-0" /> : <CheckCircle className="text-emerald-400 shrink-0" />}
                        <div>
                            <h4 className={`text-xs font-bold uppercase mb-1 ${getFinalPrice() > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>Status Wilayah</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {getFinalPrice() > 0 ? 'Area Kabupaten Malang dikenakan biaya tambahan sesuai jarak.' : 'Wilayah ini tercover area FREE ONGKIR Malang Kota.'}
                            </p>
                        </div>
                    </div>

                    <button onClick={() => setShowPopup(false)} className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all">Tutup</button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- FOOTER --- */}
        <footer className="shrink-0 p-4 pb-10 bg-slate-900/60 backdrop-blur-md border-t border-white/5 relative z-20">
           <div className="flex justify-between items-center px-2">
             <div className="flex items-center gap-2">
                <button onClick={() => setIsAdminOpen(true)} className="p-2 text-slate-500 hover:text-emerald-500 transition-colors"><Settings size={18} /></button>
                <div className="h-4 w-[1px] bg-slate-700"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300">MFG SYSTEM v2.5</span>
                    <span className="text-[8px] text-slate-500">{isFirebaseReady ? 'Online Mode' : 'Offline Mode'}</span>
                </div>
             </div>
             <div>
                {isFirebaseReady ? <Cloud size={16} className="text-emerald-500" /> : <CloudOff size={16} className="text-slate-600" />}
             </div>
           </div>
        </footer>

      </div>

      {/* --- ADMIN MODAL (KEPT FUNCTIONAL, REDESIGNED) --- */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 w-full max-w-sm max-h-[90vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* ADMIN HEADER */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse"></div>
                      <div>
                          <h2 className="text-sm font-bold text-white tracking-widest">ADMIN PANEL</h2>
                          {isAuthenticated && loggedInUser && <span className="text-[10px] text-emerald-500">Hi, {loggedInUser.name}</span>}
                      </div>
                  </div>
                  <button onClick={handleCloseAdmin} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>

              {/* ADMIN CONTENT */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-slate-900 relative">
                {!isAuthenticated ? (
                  <div className="p-8 flex flex-col items-center justify-center h-full space-y-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-emerald-500 shadow-inner"><Lock size={32} /></div>
                    <div className="w-full space-y-4">
                        <input type="password" placeholder="Passcode" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-white font-bold tracking-[0.5em] focus:border-emerald-500 focus:outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                        <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold tracking-widest shadow-lg shadow-emerald-900/50">ACCESS</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* TABS */}
                    <div className="flex p-2 bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
                        {['dashboard', 'list', 'users'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}>
                                {tab === 'list' ? 'Harga' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 pb-24 space-y-6">
                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-4">
                                <div className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center border border-slate-700">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Gratis Ongkir Global</h4>
                                        <p className="text-[10px] text-slate-400">Aktifkan untuk semua user</p>
                                    </div>
                                    <button onClick={handleToggleFreeShipping} className={`w-12 h-7 rounded-full p-1 transition-all ${globalFreeShipping ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${globalFreeShipping ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Wilayah</p>
                                        <p className="text-2xl font-bold text-white">{data.length}</p>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Desa</p>
                                        <p className="text-2xl font-bold text-white">{data.reduce((acc, curr) => acc + curr.villages.length, 0)}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/30 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs mt-4"><LogOut size={14} /> LOGOUT</button>
                            </div>
                        )}

                        {/* LIST HARGA TAB */}
                        {activeTab === 'list' && (
                            <div className="space-y-3">
                                {data.map((item) => (
                                    <div key={item.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                                        <button onClick={() => toggleKecamatan(item.id)} className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-700 transition-colors">
                                            <span className="font-bold text-xs uppercase text-white">{item.name} <span className="text-[9px] text-slate-500 font-normal ml-1">({item.villages.length} desa)</span></span>
                                            <ChevronRight size={14} className={`text-slate-500 transition-transform ${expandedKecamatan === item.id ? 'rotate-90 text-emerald-500' : ''}`} />
                                        </button>
                                        {expandedKecamatan === item.id && (
                                            <div className="bg-slate-900 border-t border-slate-700 p-2 space-y-1">
                                                {item.villages.sort((a,b) => a.name.localeCompare(b.name)).map((village, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-2 rounded hover:bg-white/5">
                                                        <span className="text-[10px] text-slate-300 w-1/2 truncate">{village.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-500">Rp</span>
                                                            <input type="number" className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-right text-[10px] text-white focus:border-emerald-500 focus:outline-none" value={village.price} onChange={(e) => handleUpdateVillagePrice(item.id, village.name, e.target.value)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                             <div className="space-y-6">
                                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Plus size={12} className="text-emerald-500" /> Tambah User</h5>
                                    <div className="space-y-2">
                                        <input type="text" placeholder="Username" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                                            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"><option>Staff</option><option>Admin</option></select>
                                        </div>
                                        <button onClick={handleAddUser} className="w-full bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg">Simpan</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {adminUsers.map(user => (
                                        <div key={user.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-xl border border-slate-700">
                                            <div>
                                                <p className="text-xs font-bold text-white">{user.name}</p>
                                                <p className="text-[10px] text-emerald-500">{user.role}</p>
                                            </div>
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-slate-500 hover:text-rose-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                    
                    {/* SAVE BUTTON FLOATING */}
                    <AnimatePresence>
                        {hasChanges && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-5 left-5 right-5">
                                <button onClick={handleSaveChanges} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"><Save size={16} /> SIMPAN PERUBAHAN</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}
