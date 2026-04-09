import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc,
} from 'firebase/firestore';
import { 
  Package, 
  Mail, 
  LayoutGrid, 
  Send, 
  Star, 
  ArrowLeft, 
  Check,
  Gift,
  Copy, 
  Loader2,
  Inbox,
  Search, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Type,
  Pencil,
  RotateCw,
  Palette,
  Eraser,
  Trash2,
  Image as ImageIcon,
  BookOpen,
  Info,
  Award,
  Users,
  History,
  UserPlus,
  Save,
  Plus,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { getAnalytics } from "firebase/analytics";

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyBsxlwWv94mGTRvyppnNTm-fZGuge_yTMw",
  authDomain: "stamped-639ab.firebaseapp.com",
  projectId: "stamped-639ab",
  storageBucket: "stamped-639ab.firebasestorage.app",
  messagingSenderId: "768212689460",
  appId: "1:768212689460:web:0a28bebe8fb6520b96a061",
  measurementId: "G-XB38BLDDYB"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "stamped-v1";

// --- DATA & CONFIG ---
const RARITIES = {
  COMMON: { label: 'Common', color: '#94a3b8', chance: 0.7 },
  RARE: { label: 'Rare', color: '#3b82f6', chance: 0.23 },
  LEGENDARY: { label: 'Legendary', color: '#eab308', chance: 0.07 },
};

const CONDITION_TIERS = [
  { label: 'Mint', min: 0.95, color: 'text-emerald-500' },
  { label: 'Near Mint', min: 0.80, color: 'text-blue-400' },
  { label: 'Used', min: 0.40, color: 'text-slate-400' },
  { label: 'Distressed', min: 0.15, color: 'text-orange-400' },
  { label: 'Ragged', min: 0.00, color: 'text-red-500' },
];

const ADDRESS_TEMPLATES = {
  locations: ["102 Gumdrop Ave", "The Third Cloud", "Bag End", "A Cabin in the Woods", "Neo Tokyo Sector 7", "The Quietest Corner", "A Bench by the River", "221B Baker St", "The Far Side of the Moon", "A Sun-Drenched Terrace"],
  states: ["Candy Land", "A State of Mind", "The Shire", "Total Bliss", "Deep Thought", "Under the Radar", "Head In The Clouds", "Somewhere Near You", "The Great Unknown", "Absolute Silence"],
  postcodes: ["ST-4MP", "H0-P3", "W1-SH", "LU-CKY", "RE-TR0", "FL-0AT", "M1-NT", "GL-1NT"]
};

const STAMP_TEMPLATES = [
  { id: 'jp_wave', name: 'Great Wave', country: 'Japan', year: 1888, emoji: '🌊', set: 'Iconic Landmarks' },
  { id: 'eg_pyramid', name: 'Giza Necropolis', country: 'Egypt', year: 1905, emoji: '🔺', set: 'Iconic Landmarks' },
  { id: 'fr_tower', name: 'Iron Lattice', country: 'France', year: 1889, emoji: '🗼', set: 'Iconic Landmarks' },
  { id: 'us_eagle', name: 'Silver Eagle', country: 'USA', year: 1944, emoji: '🦅', set: 'Wild Wonders' },
  { id: 'br_macaw', name: 'Jungle Macaw', country: 'Brazil', year: 1972, emoji: '🦜', set: 'Wild Wonders' },
  { id: 'au_roo', name: 'Outback Red', country: 'Australia', year: 1930, emoji: '🦘', set: 'Wild Wonders' },
  { id: 'ca_maple', name: 'Autumn Leaf', country: 'Canada', year: 1960, emoji: '🍁', set: 'Botanical Gems' },
  { id: 'nl_tulip', name: 'Dutch Petal', country: 'Netherlands', year: 1952, emoji: '🌷', set: 'Botanical Gems' },
  { id: 'jp_sakura', name: 'Cherry Spirit', country: 'Japan', year: 1920, emoji: '🌸', set: 'Botanical Gems' },
  { id: 'uk_crown', name: 'Imperial Crown', country: 'United Kingdom', year: 1912, emoji: '👑', set: 'Royal History' },
  { id: 'eg_pharaoh', name: 'Eternal King', country: 'Egypt', year: 1922, emoji: '☥', set: 'Royal History' },
  { id: 'cn_dragon', name: 'Jade Dragon', country: 'China', year: 1895, emoji: '🐉', set: 'Royal History' },
];

const PAPER_TYPES = [
  { id: 'classic', label: 'Classic', class: 'bg-white' },
  { id: 'parchment', label: 'Parchment', class: 'bg-[#f4e4bc] shadow-inner', style: { backgroundImage: 'radial-gradient(#dcc28a 1px, transparent 0)', backgroundSize: '20px 20px' } },
  { id: 'notebook', label: 'Notebook', class: 'bg-white', style: { backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 24px' } },
  { id: 'blueprint', label: 'Blueprint', class: 'bg-blue-900', style: { backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' } },
];

const INK_COLORS = [
  { id: 'black', color: '#1a1a1a' },
  { id: 'blue', color: '#2563eb' },
  { id: 'red', color: '#dc2626' },
  { id: 'gold', color: '#ca8a04' },
];

const POSTCARD_ART_OPTIONS = [
  { id: 'alps', label: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'tokyo', label: 'Tokyo Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'maldives', label: 'Maldives', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'paris', label: 'Parisian Morning', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'desert', label: 'Sahara Sands', url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'forest', label: 'Misty Woods', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'retro', label: 'Vintage Highway', url: 'https://plus.unsplash.com/premium_photo-1726610747306-56a3460f9989?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'aurora', label: 'Northern Lights', url: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'space', label: 'Deep Space', url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'vintage', label: 'Retro Vinyl', url: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'flora', label: 'Cherry Blossoms', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=600&h=400&q=80' },
  { id: 'nyc', label: 'New York City', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&h=400&q=80' },
];

// --- SOUND MANAGER ---
const SoundManager = {
  ctx: null,
  init() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* Audio fallback */ }
  },
  playThud() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.2);
  },
  playCrinkle() {
    this.init(); if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 5000;
    const gain = this.ctx.createGain(); gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
    noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    noise.start();
  },
  playWhoosh() {
    this.init(); if (!this.ctx) return;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'triangle'; filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0, this.ctx.currentTime); gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
    osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.4);
  }
};

// --- STAMP CARD COMPONENT ---
const StampCard = ({ stamp, onClick, size = "md", isPostmarked = false, delay = 0, isSilhouette = false }) => {
  const condition = !isSilhouette && stamp ? CONDITION_TIERS.find(t => stamp.float >= t.min) : null;
  const containerClass = size === "lg" ? "w-64 h-80 text-xl" : size === "xl" ? "w-72 h-96 text-2xl" : size === "sm" ? "w-24 h-32 text-[10px]" : "w-32 h-40 text-xs";
  const rarityKey = !isSilhouette && stamp ? stamp.rarity : null;
  const rarityInfo = rarityKey && RARITIES[rarityKey] ? RARITIES[rarityKey] : { color: '#e2e8f0' };
  const isHolo = !isSilhouette && stamp && (stamp.rarity === 'LEGENDARY' || condition?.label === 'Mint');

  return (
    <div onClick={!isSilhouette ? onClick : undefined} style={{ animationDelay: `${delay}ms` }} className={`${containerClass} relative transition-all transform ${onClick && !isSilhouette ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} ${!isSilhouette ? 'animate-stamp-reveal' : 'opacity-40'} fill-mode-both z-10`}>
      <div className={`absolute inset-0 bg-white shadow-lg border-2 border-dashed border-slate-200 rounded-sm overflow-hidden flex flex-col p-2 ${!isSilhouette && stamp?.rarity === 'LEGENDARY' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
        <div className={`flex-1 flex flex-col items-center justify-center border border-slate-100 rounded bg-slate-50 relative ${isSilhouette ? 'bg-slate-200' : ''}`}>
          {isHolo && <div className="absolute inset-0 z-30 pointer-events-none holo-glint opacity-40 mix-blend-soft-light" />}
          {!isSilhouette && isPostmarked && (
            <div className="absolute inset-0 z-20 pointer-events-none opacity-20 flex items-center justify-center">
              <div className="border-4 border-black rounded-full w-24 h-24 flex items-center justify-center -rotate-12">
                <span className="text-black font-black text-[10px] text-center leading-none uppercase">Postage<br/>Paid</span>
              </div>
            </div>
          )}
          {!isSilhouette && <div className="absolute top-1 right-1 z-10"><Star size={size === "lg" || size === "xl" ? 24 : 12} fill={rarityInfo.color} stroke="none" /></div>}
          <span className={`${size === "lg" || size === "xl" ? "text-7xl" : size === "sm" ? "text-2xl" : "text-4xl"} filter drop-shadow-md select-none ${isSilhouette ? 'brightness-0 opacity-20' : ''}`}>{stamp?.emoji || '✉️'}</span>
          {!isSilhouette && <div className="absolute bottom-1 left-1 font-serif opacity-30 select-none tracking-tighter">{stamp?.year ? String(stamp.year) : ''}</div>}
        </div>
        <div className="mt-2 text-center">
          <p className="font-bold truncate text-slate-800 leading-tight">{isSilhouette ? '???' : String(stamp?.name || '')}</p>
          {!isSilhouette && <p className={`font-medium ${condition ? condition.color : 'text-slate-400'}`}>{condition ? String(condition.label) : 'Unknown'}</p>}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); 
  const [packs, setPacks] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [lastBonus, setLastBonus] = useState(null);
  const [inspecting, setInspecting] = useState(null);
  const [openingResult, setOpeningResult] = useState([]);
  const [packState, setPackState] = useState('idle');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareId, setShareId] = useState('');
  const [receivedLetter, setReceivedLetter] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Address & UI Logic
  const [postcardAddress, setPostcardAddress] = useState({ line1: '', line2: '', line3: '' });
  const [isNamingContact, setIsNamingContact] = useState(false);
  const [newContactNickname, setNewContactNickname] = useState('');

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [composeMode, setComposeMode] = useState('text'); 
  const [drawTool, setDrawTool] = useState('pen'); 
  const [selectedPaper, setSelectedPaper] = useState(PAPER_TYPES[0]);
  const [selectedInk, setSelectedInk] = useState(INK_COLORS[0]);
  const [selectedArt, setSelectedArt] = useState(POSTCARD_ART_OPTIONS[0]);
  const [showArtGallery, setShowArtGallery] = useState(false);
  const [isFlipped, setIsFlipped] = useState(true); 

  // --- HELPERS ---
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.beginPath(); ctx.moveTo(coords.x, coords.y);
    if (drawTool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 40; }
    else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = selectedInk.color; ctx.lineWidth = 3; }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    if (e.touches) e.preventDefault();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generateAddress = () => {
    const l = ADDRESS_TEMPLATES.locations;
    const s = ADDRESS_TEMPLATES.states;
    const p = ADDRESS_TEMPLATES.postcodes;
    setPostcardAddress({
      line1: l[Math.floor(Math.random() * l.length)],
      line2: s[Math.floor(Math.random() * s.length)],
      line3: p[Math.floor(Math.random() * p.length)]
    });
    SoundManager.playCrinkle();
  };

  const fetchLetter = async (id) => {
    if (!id) return;
    setIsSearching(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'letters', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReceivedLetter(data);
        setIsFlipped(false); 
        setView('view-letter');
        const inboxDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'inbox', id);
        await setDoc(inboxDoc, data);
      } else { 
        setManualCode(''); 
      }
    } catch (err) { 
      console.error(err); 
      setView('dashboard'); 
    } finally { 
      setIsSearching(false); 
    }
  };

  const startPackOpening = () => { if (packs <= 0) return; setPackState('idle'); setView('opening-pack'); };

  const handleOpenPack = async () => {
    if (packs <= 0 || !user || packState !== 'idle') return;
    setPackState('shaking'); SoundManager.playCrinkle();
    const newStamps = Array(3).fill(null).map(() => {
      const template = STAMP_TEMPLATES[Math.floor(Math.random() * STAMP_TEMPLATES.length)];
      const rarityRoll = Math.random();
      let rarity = 'COMMON';
      if (rarityRoll < RARITIES.LEGENDARY.chance) rarity = 'LEGENDARY';
      else if (rarityRoll < RARITIES.RARE.chance + RARITIES.LEGENDARY.chance) rarity = 'RARE';
      return { ...template, instanceId: Math.random().toString(36).substr(2, 9), float: Math.random(), rarity, dateAcquired: new Date().toISOString() };
    });
    setTimeout(async () => {
      setPackState('burst');
      const updatedInventory = [...inventory, ...newStamps];
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'state');
      await setDoc(profileRef, { packs: packs - 1, inventory: updatedInventory }, { merge: true });
      setOpeningResult(newStamps);
      setTimeout(() => { setPackState('revealed'); SoundManager.playThud(); }, 500); 
    }, 1000);
  };

  const handleSendLetter = async () => {
    if (!inspecting || !user || isSending) return;
    setIsSending(true); SoundManager.playWhoosh();
    try {
      let drawingData = null;
      if (composeMode === 'draw' && canvasRef.current) drawingData = canvasRef.current.toDataURL('image/png');
      const letterData = { senderId: user.uid, message: composeMode === 'text' ? message : null, drawing: drawingData, stamp: inspecting, artUrl: selectedArt.url, artLabel: selectedArt.label, address: postcardAddress, paper: selectedPaper, ink: selectedInk, timestamp: new Date().toISOString() };
      const lettersColl = collection(db, 'artifacts', appId, 'public', 'data', 'letters');
      const docRef = await addDoc(lettersColl, letterData);
      const updatedInventory = inventory.filter(s => s.instanceId !== inspecting.instanceId);
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'state');
      await setDoc(profileRef, { packs: packs + 1, inventory: updatedInventory }, { merge: true });
      setShareLink(new URL(window.location.origin + window.location.pathname + '?letterId=' + docRef.id).toString());
      setShareId(docRef.id);
      setTimeout(() => { setIsSending(false); setSentSuccess(true); }, 800);
    } catch (error) { console.error(error); setIsSending(false); }
  };

  const saveContact = async () => {
    if (!shareId || !user || !newContactNickname.trim()) return;
    const isAlreadySaved = contacts.some(c => c.uid === shareId);
    if (isAlreadySaved) return;
    const newContacts = [...contacts, { uid: shareId, name: newContactNickname, addedAt: new Date().getTime() }];
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'state');
    await setDoc(profileRef, { contacts: newContacts }, { merge: true });
    setIsNamingContact(false); setNewContactNickname(''); SoundManager.playThud();
  };

  const startInspecting = (stamp) => { SoundManager.playThud(); setSentSuccess(false); setInspecting(stamp); setView('inspect-item'); };
  const startComposing = (stamp = null) => { setSentSuccess(false); setInspecting(stamp); setMessage(''); generateAddress(); setIsFlipped(true); setView('compose'); };
  const closeSentView = () => { setSentSuccess(false); setInspecting(null); setMessage(''); setIsFlipped(false); setIsNamingContact(false); setView('dashboard'); };
  const getStampsInSet = (setName) => { const owned = inventory.filter(s => s.set === setName); const templates = STAMP_TEMPLATES.filter(t => t.set === setName); return { owned, templates }; };
  const claimDailyBonus = async () => { if (!user) return; const now = new Date().getTime(); const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'state'); await setDoc(profileRef, { packs: packs + 1, lastBonus: now }, { merge: true }); SoundManager.playCrinkle(); };
  const canClaimBonus = !lastBonus || (new Date().getTime() - lastBonus > 86400000);

  // --- LIFECYCLE ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } 
        else { await signInAnonymously(auth); }
      } catch (err) { console.error("Auth failed:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); if (!u) setView('loading'); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const urlParams = new URLSearchParams(window.location.search);
    const letterId = urlParams.get('letterId');
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'state');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPacks(data.packs ?? 0); setInventory(data.inventory ?? []); setLastBonus(data.lastBonus ?? null); setContacts(data.contacts ?? []);
      } else { setDoc(profileRef, { packs: 3, inventory: [], lastBonus: null, contacts: [] }); }
    }, (err) => console.error(err));
    
    const inboxRef = collection(db, 'artifacts', appId, 'users', user.uid, 'inbox');
    const unsubInbox = onSnapshot(inboxRef, (snap) => { 
      setInbox(snap.docs.map(d => ({ id: d.id, ...d.data() }))); 
    }, (err) => console.error(err));
    
    if (letterId) { fetchLetter(letterId); } 
    else { setView(current => current === 'loading' ? 'dashboard' : current); }
    
    return () => { unsubProfile(); unsubInbox(); };
  }, [user]);

  if (view === 'loading') return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-sm">Opening Post Office...</div>;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 pb-24 overflow-x-hidden ${view === 'compose' && composeMode === 'draw' ? (drawTool === 'pen' ? 'cursor-pen-mode' : 'cursor-eraser-mode') : ''}`} onClick={() => SoundManager.init()}>
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-blue-600 cursor-pointer" onClick={() => setView('dashboard')}><Mail className="fill-blue-600" size={24} /><span>STAMPED</span></div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full font-bold text-slate-700 text-sm"><Package size={16} className="text-blue-500" />{packs} Packs</div>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-5xl mx-auto">
        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {canClaimBonus && (
              <div className="bg-yellow-400 p-1 rounded-2xl animate-bounce">
                <button onClick={claimDailyBonus} className="w-full bg-white p-4 rounded-xl flex items-center justify-between border-2 border-yellow-500 group shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Gift size={24} /></div>
                    <div className="text-left"><h4 className="font-black text-slate-900">Daily Gift is Here!</h4><p className="text-xs text-slate-500">Claim your free pack for today.</p></div>
                  </div>
                  <ChevronRight className="text-yellow-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
            <header className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Mail size={200} /></div>
              <div className="relative z-10 space-y-6">
                <div><h1 className="text-3xl font-bold mb-2 tracking-tight">The Collector's Desk</h1><p className="opacity-80 text-sm">Welcome back. You have {inventory.length} stamps collected.</p></div>
                <div className="flex gap-3">
                  <button onClick={startPackOpening} disabled={packs === 0} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-lg active:scale-95"><Package size={20} /> Open Pack</button>
                  <button onClick={() => setView('album')} className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-400 transition-all shadow-lg active:scale-95 border border-white/20"><BookOpen size={20} /> Album</button>
                </div>
              </div>
            </header>
            <section className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Search size={16} /> Track a Shipment</h3>
               <div className="flex gap-2">
                 <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Enter Letter Code..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono outline-none" />
                 <button onClick={() => fetchLetter(manualCode)} disabled={!manualCode || isSearching} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">{isSearching ? <Loader2 className="animate-spin" size={16} /> : <ChevronRight size={18} />} View</button>
               </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold flex items-center gap-2 text-slate-500"><LayoutGrid size={18} /> New Arrivals</h2></div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {inventory.length > 0 ? inventory.slice().reverse().slice(0, 6).map(stamp => (<StampCard key={stamp.instanceId} stamp={stamp} onClick={() => startInspecting(stamp)} />)) : <div className="col-span-full py-12 text-center text-slate-300 italic border-2 border-dashed rounded-2xl">Find your first stamp!</div>}
              </div>
            </section>
          </div>
        )}

        {view === 'album' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-12 pb-12">
            <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase mb-2"><ArrowLeft size={16} /> Home</button><h1 className="text-4xl font-black tracking-tight">The Album</h1></div>
            {Array.from(new Set(STAMP_TEMPLATES.map(t => t.set))).map(setName => {
              const { owned, templates } = getStampsInSet(setName);
              const progress = Math.round((new Set(owned.map(s=>s.id)).size / templates.length) * 100);
              return (
                <section key={setName} className="space-y-4">
                  <div className="flex items-end justify-between border-b pb-2 border-slate-200"><div><h3 className="text-xl font-bold text-slate-800">{setName}</h3><p className="text-xs text-slate-400 font-medium">{progress}% Complete</p></div>{progress === 100 && <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg text-[10px] font-black border border-yellow-200 shadow-sm"><Award size={14}/> Mastered</div>}</div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                    {templates.map(template => {
                      const instances = inventory.filter(s => s.id === template.id);
                      return instances.length > 0 ? (<div key={template.id} className="relative group"><StampCard stamp={instances[0]} onClick={() => startInspecting(instances[0])} />{instances.length > 1 && <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md z-20">x{instances.length}</div>}</div>) : (<div key={template.id} className="flex flex-col items-center gap-2"><StampCard stamp={template} isSilhouette={true} /><span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Unknown</span></div>);
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {view === 'select-stamp' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div><button onClick={() => setView('compose')} className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase mb-2"><ArrowLeft size={16} /> Back to Draft</button><h1 className="text-4xl font-black tracking-tight">Select Postage</h1></div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {inventory.length > 0 ? inventory.slice().reverse().map(stamp => (<StampCard key={stamp.instanceId} stamp={stamp} onClick={() => { setInspecting(stamp); setView('compose'); SoundManager.playThud(); }} />)) : <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border-2 border-dashed"><p className="font-bold">No stamps available.</p></div>}
            </div>
          </div>
        )}

        {view === 'inbox' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase mb-2"><ArrowLeft size={16} /> Home</button><h1 className="text-4xl font-black tracking-tight">The Inbox</h1></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {inbox.length > 0 ? inbox.map(letter => (
                <div key={letter.id} onClick={() => { setReceivedLetter(letter); setIsFlipped(false); setView('view-letter'); }} className="cursor-pointer group">
                  <div className="aspect-[1.5/1] rounded-xl overflow-hidden shadow-md border-4 border-white group-hover:shadow-xl transition-all group-hover:-translate-y-1 relative">
                    <img src={letter.artUrl} className="w-full h-full object-cover" alt="Art" />
                    <div className="absolute top-2 right-2 rotate-6"><StampCard stamp={letter.stamp} size="sm" isPostmarked={true} /></div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-3"><p className="text-white text-[10px] font-bold uppercase truncate">From {String(letter.senderId || 'Unknown').slice(0, 8)}...</p></div>
                  </div>
                </div>
              )) : <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed rounded-3xl bg-white"><Inbox size={48} className="mx-auto mb-4 opacity-20" /><p className="font-bold">No mail yet.</p></div>}
            </div>
          </div>
        )}

        {view === 'contacts' && (
          <div className="animate-in fade-in duration-500 space-y-8 max-w-2xl mx-auto">
            <div><button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase mb-2"><ArrowLeft size={16} /> Home</button><h1 className="text-4xl font-black tracking-tight">Address Book</h1></div>
            <div className="bg-white rounded-3xl border shadow-sm divide-y">
              {contacts.length > 0 ? contacts.map(contact => (
                <div key={contact.uid} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Users size={24} /></div><div><h4 className="font-bold text-slate-900">{contact.name}</h4><p className="text-xs text-slate-400 font-mono">ID: ...{String(contact.uid).slice(-8)}</p></div></div>
                  <button onClick={() => startComposing()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-blue-700 transition-all">Write Letter</button>
                </div>
              )) : <div className="p-12 text-center text-slate-400"><p className="font-bold">Your book is empty.</p></div>}
            </div>
          </div>
        )}

        {view === 'inspect-item' && inspecting && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
             <button onClick={() => setView('album')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider"><ArrowLeft size={16} /> Back</button>
             <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl grid md:grid-cols-2 gap-12 items-center">
                <div className="flex justify-center"><StampCard stamp={inspecting} size="xl" /></div>
                <div className="space-y-8">
                   <div><span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">{inspecting.set}</span><h1 className="text-5xl font-black text-slate-900 tracking-tight">{inspecting.name}</h1><p className="text-slate-400 font-medium italic mt-2">Issued {inspecting.year} • {inspecting.country}</p></div>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border"> <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Condition</p><p className={`font-bold text-lg ${CONDITION_TIERS.find(t => inspecting.float >= t.min) ? CONDITION_TIERS.find(t => inspecting.float >= t.min).color : 'text-slate-400'}`}>{CONDITION_TIERS.find(t => inspecting.float >= t.min)?.label || 'Unknown'}</p></div>
                    <div className="bg-slate-50 p-4 rounded-2xl border"> <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rarity</p><p className="font-bold text-lg text-slate-700 flex items-center gap-2"><Star size={18} fill={RARITIES[inspecting.rarity]?.color || '#cbd5e1'} stroke="none" />{inspecting.rarity}</p></div>
                   </div>
                   <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100"><button onClick={() => startComposing(inspecting)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95">Write Letter with Stamp</button></div>
                </div>
             </div>
          </div>
        )}

{view === 'compose' && (
          <div className="animate-in fade-in duration-300">
            <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider">
              <ArrowLeft size={16} /> Cancel
            </button>
            
            {!sentSuccess ? (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Sidebar: Controls */}
                <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-3xl border shadow-sm order-2 lg:order-1 relative z-50 overflow-y-auto max-h-[85vh] custom-scrollbar">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Message Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setComposeMode('text')} className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${composeMode === 'text' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Type size={18}/> Type</button>
                      <button onClick={() => setComposeMode('draw')} className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${composeMode === 'draw' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Pencil size={18}/> Draw</button>
                    </div>
                  </div>
                  
                  {composeMode === 'draw' && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Drawing Tools</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setDrawTool('pen')} className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${drawTool === 'pen' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Pencil size={18}/> Pen</button>
                        <button onClick={() => setDrawTool('eraser')} className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${drawTool === 'eraser' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Eraser size={18}/> Eraser</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Paper</label>
                      <div className="flex flex-wrap gap-2">
                        {PAPER_TYPES.map(p => (<button key={p.id} onClick={() => setSelectedPaper(p)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedPaper.id === p.id ? 'border-blue-500 scale-110 shadow' : 'border-transparent'}`} style={{...p.style, backgroundColor: p.id === 'parchment' ? '#f4e4bc' : p.id === 'blueprint' ? '#1e3a8a' : '#fff'}} />))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Ink</label>
                      <div className="flex flex-wrap gap-2">
                        {INK_COLORS.map(c => (<button key={c.id} onClick={() => setSelectedInk(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedInk.id === c.id ? 'border-slate-800 scale-110 shadow' : 'border-transparent'}`} style={{ backgroundColor: c.color }} />))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <button onClick={() => setShowArtGallery(!showArtGallery)} className="w-full flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cover bg-center border border-white shadow-sm" style={{ backgroundImage: `url(${selectedArt.url})` }} />
                        <div className="text-left"><label className="text-[10px] font-black uppercase text-slate-400 block">Postcard Art</label><span className="text-sm font-bold text-slate-700">{selectedArt.label}</span></div>
                      </div>
                      <div className={`transition-transform duration-300 ${showArtGallery ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-slate-400" /></div>
                    </button>
                    {showArtGallery && (
                      <div className="mt-4 grid grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-300">
                        {POSTCARD_ART_OPTIONS.map(art => (<button key={art.id} onClick={() => { setSelectedArt(art); setIsFlipped(false); }} className={`aspect-video rounded-md bg-cover bg-center transition-all ${selectedArt.id === art.id ? 'ring-2 ring-blue-500 scale-95 shadow-inner' : 'opacity-70 hover:opacity-100 hover:scale-105'}`} style={{ backgroundImage: `url(${art.url})` }} />))}
                      </div>
                    )}
                  </div>

                  <button onClick={handleSendLetter} disabled={isSending || (composeMode === 'text' && !message.trim()) || !inspecting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xl active:scale-95">
                    {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} Send Letter
                  </button>
                </div>

                {/* Right Area: Card Preview */}
                <div className="lg:col-span-8 flex flex-col items-center gap-6 order-1 lg:order-2">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className={!isFlipped ? "text-blue-600 font-black" : ""}>FRONT</span>
                    <button onClick={() => setIsFlipped(!isFlipped)} className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 shadow-sm"><RotateCw size={16} /></button>
                    <span className={isFlipped ? "text-blue-600 font-black" : ""}>BACK</span>
                  </div>

                  <div className="perspective-1000 w-full max-w-[500px] aspect-[1.5/1]">
                    <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                      
                      {/* FRONT FACE */}
                      <div 
                        className={`absolute inset-0 backface-hidden rounded-xl shadow-2xl overflow-hidden border-4 border-white flex items-center justify-center ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                        style={{ transform: 'translateZ(1px)' }}
                      >
                        <img src={selectedArt.url} className="absolute inset-0 w-full h-full object-cover" alt="Art" />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 bg-black/20 backdrop-blur-[2px] p-4 rounded-lg border border-white/20">
                          <div className="text-white text-4xl font-black italic tracking-tighter opacity-90 drop-shadow-lg uppercase">Greetings</div>
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div 
                        className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl ${selectedPaper.class} shadow-2xl border-2 border-slate-100 flex p-6 ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`} 
                        style={{ ...selectedPaper.style, transform: 'rotateY(180deg) translateZ(1px)' }}
                      >
                        <div className="flex-1 pr-4 border-r border-slate-200 flex flex-col relative z-0">
                          {composeMode === 'text' ? (
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here..." className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-xl leading-relaxed italic placeholder:text-slate-300" style={{ color: selectedInk.color }} />
                          ) : (
                            <div className={`relative w-full h-full rounded overflow-hidden touch-none border-2 border-dashed transition-colors ${['classic', 'notebook'].includes(selectedPaper.id) ? 'bg-slate-50/50 border-slate-200' : 'bg-transparent border-slate-400/40'}`}>
                               <canvas ref={canvasRef} width={600} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full rounded block relative z-10" />
                               <button onClick={(e) => { e.stopPropagation(); clearCanvas(); }} className="absolute bottom-2 right-2 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 z-20 border border-red-100 pointer-events-auto"><Trash2 size={16}/></button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-none w-36 pl-4 flex flex-col items-center justify-start gap-1 pt-1 relative z-50 overflow-hidden pointer-events-none">
                          <div className="flex flex-col items-center gap-1 scale-90 origin-top pointer-events-auto">
                            {inspecting ? (
                              <div className="relative group cursor-pointer" onClick={() => setView('select-stamp')}>
                                <StampCard stamp={inspecting} size="md" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-sm transition-opacity"><RotateCw className="text-white" size={20} /></div>
                              </div>
                            ) : (
                              <button onClick={() => setView('select-stamp')} className="w-32 h-40 border-2 border-dashed border-slate-300 rounded-sm bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-blue-400 transition-all group pointer-events-auto"><Plus size={24} className="mb-2 group-hover:scale-110" /><span className="text-[10px] font-black uppercase text-center px-1">Attach Stamp</span></button>
                            )}
                          </div>
                          <div className="w-full mt-2 space-y-1 pt-1 border-t border-slate-200/50 pointer-events-auto">
                            <div className="flex items-center justify-between px-1"><span className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><MapPin size={7}/> To:</span><button onClick={generateAddress} className="p-0.5 hover:bg-slate-200 rounded-full"><RefreshCw size={8} className="text-blue-500"/></button></div>
                            <div className="space-y-0 relative">
                              <input value={postcardAddress.line1} onChange={(e) => setPostcardAddress({...postcardAddress, line1: e.target.value})} className="w-full text-[8px] bg-transparent border-b border-slate-200 outline-none font-serif italic py-0.5" placeholder="Address Line 1"/>
                              <input value={postcardAddress.line2} onChange={(e) => setPostcardAddress({...postcardAddress, line2: e.target.value})} className="w-full text-[8px] bg-transparent border-b border-slate-200 outline-none font-serif italic py-0.5" placeholder="City, State"/>
                              <input value={postcardAddress.line3} onChange={(e) => setPostcardAddress({...postcardAddress, line3: e.target.value})} className="w-full text-[8px] bg-transparent border-b border-slate-200 outline-none font-serif italic py-0.5" placeholder="Postcode"/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Success Screen */
              <div className="max-w-md mx-auto bg-white p-10 rounded-3xl border shadow-xl text-center space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><Check size={40} strokeWidth={3} /></div>
                <h2 className="text-3xl font-black">Postcard Sent!</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase ml-1">Letter Code (ID)</p>
                    <div className="flex gap-2">
                       <div className="flex-1 bg-slate-100 p-3 rounded-xl border font-mono text-sm font-bold text-slate-800 text-center select-all">{shareId}</div>
                       <button onClick={() => { const t = document.createElement("textarea"); t.value = shareId; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }} className="p-3 bg-white border rounded-xl hover:bg-slate-50 transition-colors"><Copy size={18} className="text-slate-500"/></button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-black uppercase text-left ml-1">Share Link</p>
                    <div className="bg-slate-50 p-4 rounded-xl border text-xs font-mono truncate">{shareLink}</div>
                    <button onClick={() => { const t = document.createElement("textarea"); t.value = shareLink; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg">Copy Link</button>
                  </div>
                  
                  {!isNamingContact && !contacts.some(c => c.uid === shareId) ? (
                    <button onClick={() => setIsNamingContact(true)} className="w-full bg-blue-50 text-blue-600 p-4 rounded-xl border border-blue-100 flex items-center justify-between group hover:bg-blue-100 transition-all"><span className="font-bold text-sm">Save Recipient?</span><UserPlus size={20} /></button>
                  ) : !contacts.some(c => c.uid === shareId) ? (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-3"><div className="flex gap-2"><input autoFocus type="text" value={newContactNickname} onChange={(e) => setNewContactNickname(e.target.value)} placeholder="e.g. Grandma" className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm outline-none" /><button onClick={saveContact} disabled={!newContactNickname.trim()} className="bg-blue-600 text-white p-2 rounded-lg"><Save size={20} /></button></div></div>
                  ) : ( 
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 font-bold text-sm"><Check size={18} /> Address Saved</div> 
                  )}
                </div>
                <button onClick={closeSentView} className="w-full py-4 text-slate-500 font-bold uppercase text-xs hover:text-slate-800">Back to Desk</button>
              </div>
            )}
          </div>
        )}

        {view === 'view-letter' && receivedLetter && (
          <div className="animate-in slide-in-from-top-12 duration-700 flex flex-col items-center gap-10 py-10">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className={!isFlipped ? "text-blue-600 font-black" : ""}>FRONT</span>
              <button onClick={() => setIsFlipped(!isFlipped)} className="bg-slate-200 p-2 rounded-full shadow-sm">
                <RotateCw size={16} />
              </button>
              <span className={isFlipped ? "text-blue-600 font-black" : ""}>BACK</span>
            </div>

            <div className="perspective-1000 w-full max-w-[600px] aspect-[1.5/1]">
              <div className={`relative w-full h-full transition-transform duration-1000 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT FACE - Pushed forward 1px to prevent ghosting */}
                <div 
                  className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white flex items-center justify-center" 
                  style={{ transform: 'translateZ(1px)' }}
                >
                  <img src={receivedLetter.artUrl || POSTCARD_ART_OPTIONS[0].url} className="absolute inset-0 w-full h-full object-cover" alt="Art" />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10 bg-black/20 backdrop-blur-[2px] p-4 sm:p-6 rounded-lg border border-white/20">
                    <div className="text-white text-3xl sm:text-5xl font-black italic tracking-tighter opacity-90 drop-shadow-xl uppercase">Greetings</div>
                  </div>
                </div>

                {/* BACK FACE - Flipped and pushed forward 1px on its own plane */}
                <div 
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl ${receivedLetter.paper?.class || 'bg-white'} shadow-2xl border-2 border-slate-100 flex p-4 sm:p-8`} 
                  style={{ ...receivedLetter.paper?.style, transform: 'rotateY(180deg) translateZ(1px)' }}
                >
                  {/* Message Area */}
                  <div className="flex-1 pr-3 sm:pr-6 border-r border-slate-200 flex flex-col justify-center overflow-hidden">
                    {receivedLetter.drawing ? ( 
                      <img src={receivedLetter.drawing} className="max-h-full w-full object-contain drop-shadow-sm" alt="Drawing" /> 
                    ) : ( 
                      <div className="text-xl sm:text-3xl font-serif italic leading-relaxed" style={{ color: receivedLetter.ink?.color }}> 
                        "{receivedLetter.message}" 
                      </div> 
                    )}
                  </div>

                  {/* Stamp & Address Area */}
                  <div className="w-32 sm:w-48 pl-3 sm:pl-6 flex flex-col items-center justify-between">
                    <div className="self-end scale-75 sm:scale-100 origin-top-right">
                      <StampCard stamp={receivedLetter.stamp} size="md" isPostmarked={true} />
                    </div>
                    
                    <div className="w-full mt-auto mb-2 sm:mb-4 border-t border-slate-300 pt-2 sm:pt-3 opacity-60">
                       <p className="text-[7px] sm:text-[10px] font-serif italic leading-tight text-slate-800">{receivedLetter.address?.line1 || ''}</p>
                       <p className="text-[7px] sm:text-[10px] font-serif italic leading-tight text-slate-800">{receivedLetter.address?.line2 || ''}</p>
                       <p className="text-[7px] sm:text-[10px] font-serif italic leading-tight text-slate-800">{receivedLetter.address?.line3 || ''}</p>
                    </div>

                    <div className="text-[8px] sm:text-[10px] font-mono text-slate-300 uppercase tracking-widest text-center leading-tight">
                      Sent via Stamped<br/>{new Date(receivedLetter.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="text-center space-y-6 max-w-xs">
              <h3 className="font-black text-xl text-slate-800">Mail Saved to Inbox</h3>
              <button 
                onClick={() => { window.history.pushState({}, '', window.location.pathname); setView('dashboard'); }} 
                className="w-full bg-blue-600 text-white px-8 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:translate-y-1 transition-all"
              > 
                <Gift size={24} /> Get Packs 
              </button>
            </div>
          </div>
        )}

        {view === 'opening-pack' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
            {packState === 'burst' && <div className="absolute inset-0 z-50 bg-white animate-screen-flash pointer-events-none" />}
            {packState !== 'revealed' ? (
              <div className={`text-center space-y-8 transition-opacity duration-300 ${packState === 'burst' ? 'opacity-0' : 'opacity-100'}`}>
                <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest animate-pulse">Unseal Pack</h2>
                <div onClick={handleOpenPack} className={`w-48 h-64 relative cursor-pointer select-none ${packState === 'shaking' ? 'animate-pack-shake' : 'hover:scale-105 active:scale-95 transition-transform'} ${packState === 'burst' ? 'animate-pack-pop' : ''}`}>
                  <div className="absolute inset-0 bg-blue-600 rounded-xl shadow-2xl border-4 border-blue-400 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-4 bg-blue-700 border-b border-blue-400" />
                    <div className="h-full flex flex-col items-center justify-center p-4"><Mail className="text-white mb-2" size={32} /><h3 className="text-white font-black text-xl tracking-tighter uppercase leading-none text-center">Stamped<br/><span className="text-[10px] text-blue-200">SERIES 1</span></h3></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center w-full animate-in zoom-in-95">
                <div className="flex justify-center mb-8"><div className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-full font-black text-xs flex items-center gap-2 shadow-lg animate-bounce"><Sparkles size={16} /> REVEALED</div></div>
                <div className="flex flex-wrap justify-center gap-6 mb-12">{openingResult.map((stamp, idx) => (<StampCard key={idx} stamp={stamp} size="lg" delay={idx * 150} />))}</div>
                <button onClick={() => setView('dashboard')} className="bg-slate-900 text-white px-12 py-4 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition-all active:scale-95">Add to Book</button>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center py-4 px-6 z-40">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 transition-all ${view === 'dashboard' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}> <Inbox size={22} /><span className="text-[9px] font-black uppercase">Desk</span> </button>
        <button onClick={() => setView('inbox')} className={`flex flex-col items-center gap-1 transition-all ${view === 'inbox' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}> <History size={22} /><span className="text-[9px] font-black uppercase">Inbox</span> </button>
        <button onClick={() => startComposing()} className={`flex flex-col items-center gap-1 transition-all ${view === 'compose' || view === 'select-stamp' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}> <Pencil size={22} /><span className="text-[9px] font-black uppercase">Write</span> </button>
        <button onClick={() => setView('album')} className={`flex flex-col items-center gap-1 transition-all ${view === 'album' || view === 'inspect-item' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}> <BookOpen size={22} /><span className="text-[9px] font-black uppercase">Album</span> </button>
        <button onClick={() => setView('contacts')} className={`flex flex-col items-center gap-1 transition-all ${view === 'contacts' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}> <Users size={22} /><span className="text-[9px] font-black uppercase">Friends</span> </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .perspective-1000 { perspective: 1000px; }
        .cursor-pen-mode { cursor: crosshair; }
        .cursor-eraser-mode { cursor: cell; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .holo-glint { background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%); background-size: 200% 200%; animation: holo-shimmer 3s infinite linear; }
        @keyframes holo-shimmer { 0% { background-position: -200% -200%; } 100% { background-position: 200% 200%; } }
        @keyframes packShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px) rotate(-1deg); } 75% { transform: translateX(4px) rotate(1deg); } }
        .animate-pack-shake { animation: packShake 0.1s infinite; }
        @keyframes packPop { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        .animate-pack-pop { animation: packPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes screenFlash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .animate-screen-flash { animation: screenFlash 0.7s ease-in-out forwards; }
        @keyframes stampReveal { 0% { opacity: 0; transform: scale(0.3) translateY(40px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-stamp-reveal { animation: stampReveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}