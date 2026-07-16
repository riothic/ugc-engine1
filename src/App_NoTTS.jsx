import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Video, Copy, CheckCircle, AlertCircle, Loader2, Sparkles, Wand2, Tag, ShoppingBag, Link2, Code, Trash2, Music, Clock } from 'lucide-react';

const STYLES = [
  { id: 'storytelling', name: 'Story Telling', desc: 'Aktivitas sehari-hari, produk sebagai solusi.' },
  { id: 'hardselling', name: 'Hard Selling', desc: 'Close-up produk & wajah, kontras, dinamis.' },
  { id: 'softselling', name: 'Soft Selling', desc: 'Aesthetic, menenangkan, tidak agresif.' },
  { id: 'unboxing', name: 'Unboxing', desc: 'Top-down, fokus pada tangan membuka kemasan.' },
  { id: 'review', name: 'Review', desc: 'Karakter memegang produk menghadap kamera.' },
  { id: 'tutorial', name: 'Tutorial', desc: 'Langkah demi langkah penggunaan produk.' },
  { id: 'lifestyle', name: 'Lifestyle', desc: 'Luar ruangan, gaya hidup kelas atas.' },
  { id: 'provokatif', name: 'Provokatif', desc: 'Kamera ekstrem, ekspresi terkejut/menantang.' },
  { id: 'confrontment', name: 'Confrontment', desc: 'Split screen, kontras sebelum/sesudah.' },
  { id: 'discount', name: 'Discount', desc: 'Heboh, menunjuk ruang kosong untuk teks.' },
  { id: 'replay', name: 'Replay', desc: 'Slow motion pada momen terbaik produk.' },
  { id: 'warehouse', name: 'Warehouse', desc: 'Latar gudang/kardus, memegang banyak produk.' },
  { id: 'handscene', name: 'Hand Scene', desc: 'Fokus murni pada tangan yang estetik.' },
  { id: 'grwm', name: 'GRWM', desc: 'Get Ready With Me, produk terintegrasi ke rutinitas.' },
  { id: 'asmr', name: 'ASMR / Sensory', desc: 'Suara & tekstur produk, gerakan lambat sensorik.' },
  { id: 'comparison', name: 'Comparison', desc: 'Bandingkan produk vs alternatif/kompetitor.' },
  { id: 'problemsolution', name: 'Problem - Solution', desc: 'Tunjukkan masalah nyata dulu, lalu produk sebagai solusi instan.' },
  { id: 'fomo', name: 'FOMO / Urgency', desc: 'Stok terbatas, promo mendesak, dorongan beli sekarang.' }
];

const CATEGORIES = [
  'Fashion & Pakaian', 'Kecantikan & Skincare', 'Elektronik & Gadget',
  'Perlengkapan Rumah', 'Makanan & Minuman', 'Kesehatan', 'Aksesoris & Perhiasan',
  'Ibu & Anak', 'Otomotif & Aksesoris', 'Hobi, Mainan & Koleksi',
  'Peralatan Kantor & Sekolah', 'Peliharaan (Pet Supplies)', 'Lainnya'
];

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type });
    reader.onerror = (error) => reject(error);
  });
};

export default function App() {
  const [characterFile, setCharacterFile] = useState(null);
  const [characterPreview, setCharacterPreview] = useState('');
  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState('');

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [marketplaceLink, setMarketplaceLink] = useState('');
  const [videoDuration, setVideoDuration] = useState('15');

  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState(null);
  const [rawJsonString, setRawJsonString] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showApiKeyText, setShowApiKeyText] = useState(false);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    if (!trimmed) return;
    localStorage.setItem('gemini_api_key', trimmed);
    setApiKey(trimmed);
    setTempApiKey('');
    setShowApiModal(false);
  };

  const handleImageChange = (e, setterFile, setterPreview) => {
    const file = e.target.files[0];
    if (file) {
      setterFile(file);
      setterPreview(URL.createObjectURL(file));
    }
  };

  const handleClearAll = () => {
    setCharacterFile(null); setCharacterPreview('');
    setProductFile(null); setProductPreview('');
    setProductName(''); setProductCategory(''); setMarketplaceLink('');
    setVideoDuration('15');
    setSelectedStyle(''); setJsonResult(null); setRawJsonString(''); setError('');
  };

  const handleGenerateJSON = async () => {
    if (!characterFile || !productFile || !selectedStyle) {
      setError('Lengkapi gambar karakter, referensi produk, dan pilih gaya video.');
      return;
    }
    if (!apiKey) { setShowApiModal(true); return; }
    setError(''); setLoading(true); setJsonResult(null); setRawJsonString('');

    try {
      const charData = await fileToBase64(characterFile);
      const prodData = await fileToBase64(productFile);
      const styleObj = STYLES.find(s => s.id === selectedStyle);

      const promptText = `You are an expert AI Video Generation Prompt Engineer, Affiliate Marketer, and Technical Copywriter.
Analyze the images: 1. Character/Model, 2. Product Reference.
Product Context:
Name: ${productName || 'Unknown Product'}
Category: ${productCategory || 'General'}
Marketplace: ${marketplaceLink || 'N/A'}
Target Video Duration: ${videoDuration} seconds

Video Style: "${styleObj.name}" - ${styleObj.desc}.

CRITICAL RULES:
1. WEARABLE/FASHION OVERRIDE: If the product is clothing, hijab, or accessory, FORCE the character to wear the product EXACTLY as it appears in Image 2. Completely IGNORE their original clothes from Image 1.
2. MICROSCOPIC PRODUCT DETAIL: You MUST analyze Image 2 and describe the product with extreme precision. Describe the EXACT colors, fabric texture (e.g., ribbed knit, smooth silk), specific textile patterns/prints, visible stitching lines, exact button placements, collar type, sleeve style, folds, and how it perfectly drapes on the body. The product in the prompt MUST be 100% identical to Image 2.
3. NO AUDIO/MUSIC DESCRIPTIONS: Absolutely DO NOT include any words related to background music, BGM, upbeat tracks, sound effects, or soundtracks. Audio is handled in post-production.
4. NO TEXT OVERLAYS: Strictly visual actions.

Output a valid JSON containing exactly:
1. "visual_prompt": A highly detailed paragraph (6-8 sentences) in ENGLISH optimized for AI Video models (Google Veo, Sora). Dedicate at least 3 sentences purely to describing the microscopic details of the product (fabric, stitches, precise colors, button/zipper placement). Combine this with camera, lighting, and character action. NO AUDIO NOTES.
2. "voice_over_script": A high-converting spoken voice-over script in INDONESIAN language. CRITICAL: The script MUST be strictly tailored for exactly a ${videoDuration}-second video (approx. ${parseInt(videoDuration) * 2.5} words). If ${videoDuration} is 10, make the script extremely punchy, fast-paced, and concise. If 20, add slightly more persuasive detail. Must match style tone, start with a hook, and end with a CTA.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          role: "user",
          parts: [
            { text: promptText },
            { inlineData: { mimeType: charData.mimeType, data: charData.base64 } },
            { inlineData: { mimeType: prodData.mimeType, data: prodData.base64 } }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              visual_prompt: { type: "STRING", description: "English visual description for the AI video generator." },
              voice_over_script: { type: "STRING", description: "Indonesian VO text." }
            },
            required: ["visual_prompt", "voice_over_script"]
          }
        }
      };

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const generatedJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedJsonText) {
        setRawJsonString(generatedJsonText);
        setJsonResult(JSON.parse(generatedJsonText));
      } else { throw new Error('Format invalid.'); }
    } catch (err) {
      console.error(err); setError('Gagal menghasilkan JSON. Cek koneksi atau kuota API.');
    } finally { setLoading(false); }
  };

  const copyToClipboard = (text) => {
    if (!text) return;

    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Gagal menyalin teks", err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header - Gold Theme */}
        <div className="text-center space-y-2 mb-10 mt-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex justify-center items-center text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-600 drop-shadow-sm">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mr-3 animate-pulse" /> UGC Affiliate Engine
          </h1>
          <p className="text-amber-500/80 text-sm md:text-base font-semibold tracking-[0.2em] uppercase">
            by Chevun
          </p>
          <button
            onClick={() => { setTempApiKey(apiKey); setShowApiModal(true); }}
            className={`mx-auto mt-3 flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${apiKey ? 'text-emerald-400 border-emerald-900/40 bg-emerald-950/30 hover:bg-emerald-950/50' : 'text-red-400 border-red-900/40 bg-red-950/30 hover:bg-red-950/50'}`}
          >
            {apiKey ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <AlertCircle className="w-3.5 h-3.5 mr-1.5" />}
            {apiKey ? 'API Key tersimpan' : 'API Key belum diisi — klik di sini untuk mengatur'}
          </button>
        </div>

        {showApiModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowApiModal(false)}>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-amber-400 mb-2">🔑 Gemini API Key</h3>
              <p className="text-xs text-gray-400 mb-4">
                Dapatkan key gratis di:{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-amber-500 underline">aistudio.google.com/apikey</a>
              </p>
              <div className="relative mb-4">
                <input
                  type={showApiKeyText ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  placeholder="Tempel API key di sini..."
                  className="w-full bg-[#0a0a0a] border border-[#333] text-gray-200 rounded-lg p-3 pr-10 text-sm outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
                <button onClick={() => setShowApiKeyText(s => !s)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 text-xs">
                  👁
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mb-5">💾 Key tersimpan di browser kamu (localStorage), tidak dikirim ke server manapun selain Google.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowApiModal(false)} className="flex-1 py-2.5 rounded-lg border border-[#333] text-gray-400 text-sm font-semibold hover:bg-[#1a1a1a]">Batal</button>
                <button onClick={handleSaveApiKey} className="flex-1 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-bold hover:bg-amber-400">✔ Simpan API Key</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="flex justify-end">
            <button onClick={handleClearAll} className="text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all">
              <Trash2 className="w-4 h-4 mr-1.5" /> Bersihkan Data
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#141414] p-6 rounded-2xl shadow-2xl border border-[#2a2a2a] hover:border-amber-900/50 transition-colors">
              <h2 className="text-lg font-bold mb-4 flex items-center text-gray-100"><ImageIcon className="w-5 h-5 mr-2 text-amber-500" />1. Karakter Utama (Kreator)</h2>
              <input type="file" onChange={(e) => handleImageChange(e, setCharacterFile, setCharacterPreview)} className="w-full text-sm mb-3 border border-[#333] bg-[#0a0a0a] text-gray-300 p-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer" />
              <div className={`border-2 border-dashed rounded-xl h-48 flex items-center justify-center overflow-hidden transition-colors ${characterPreview ? 'border-amber-500 bg-amber-500/5' : 'bg-[#0a0a0a] border-[#333]'}`}>
                {characterPreview ? <img src={characterPreview} className="h-full object-contain p-2 drop-shadow-lg" /> : <p className="text-xs text-gray-600">Belum ada gambar</p>}
              </div>
            </div>

            <div className="bg-[#141414] p-6 rounded-2xl shadow-2xl border border-[#2a2a2a] hover:border-amber-900/50 transition-colors">
              <h2 className="text-lg font-bold mb-4 flex items-center text-gray-100"><ImageIcon className="w-5 h-5 mr-2 text-yellow-500" />2. Referensi Produk / Katalog</h2>
              <input type="file" onChange={(e) => handleImageChange(e, setProductFile, setProductPreview)} className="w-full text-sm mb-3 border border-[#333] bg-[#0a0a0a] text-gray-300 p-2 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/10 file:text-yellow-500 hover:file:bg-yellow-500/20 cursor-pointer" />
              <div className={`border-2 border-dashed rounded-xl h-48 flex items-center justify-center overflow-hidden transition-colors ${productPreview ? 'border-yellow-500 bg-yellow-500/5' : 'bg-[#0a0a0a] border-[#333]'}`}>
                {productPreview ? <img src={productPreview} className="h-full object-contain p-2 drop-shadow-lg" /> : <p className="text-xs text-gray-600">Belum ada gambar</p>}
              </div>
            </div>
          </div>

          <div className="bg-[#141414] p-6 rounded-2xl shadow-2xl border border-[#2a2a2a] hover:border-amber-900/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold flex items-center text-gray-100"><Tag className="w-5 h-5 mr-2 text-amber-500" /> 3. Data Spesifik Produk</h2>
              <span className="text-xs font-mono bg-[#2a1111] text-red-400 border border-red-900/30 px-2.5 py-1 rounded-md flex items-center shadow-sm"><Music className="w-3 h-3 mr-1" /> Aturan Tanpa BGM Aktif</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="Nama Produk..." value={productName} onChange={e => setProductName(e.target.value)} className="bg-[#0a0a0a] border border-[#333] text-gray-200 placeholder-gray-600 rounded-lg p-3 text-sm w-full outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all" />
              <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="bg-[#0a0a0a] border border-[#333] text-gray-200 rounded-lg p-3 text-sm w-full outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all">
                <option value="" className="text-gray-500">Pilih Kategori...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="url" placeholder="Link (Opsional)..." value={marketplaceLink} onChange={e => setMarketplaceLink(e.target.value)} className="bg-[#0a0a0a] border border-[#333] text-gray-200 placeholder-gray-600 rounded-lg p-3 text-sm w-full outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all" />

              <div className="relative">
                <Clock className="w-5 h-5 text-amber-600/50 absolute left-3 top-3.5" />
                <select value={videoDuration} onChange={e => setVideoDuration(e.target.value)} className="bg-[#0a0a0a] border border-[#333] text-amber-500 rounded-lg p-3 pl-10 text-sm w-full outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer appearance-none transition-all font-medium">
                  <option value="10">Durasi: 10 Detik (Singkat)</option>
                  <option value="15">Durasi: 15 Detik (Standar)</option>
                  <option value="20">Durasi: 20 Detik (Panjang)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] p-6 rounded-2xl shadow-2xl border border-[#2a2a2a] hover:border-amber-900/50 transition-colors">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-100"><Video className="w-5 h-5 mr-2 text-amber-500" /> 4. Gaya Eksekusi Video</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STYLES.map((style) => (
                <div key={style.id} onClick={() => setSelectedStyle(style.id)} className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${selectedStyle === style.id ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] transform scale-[1.02]' : 'bg-[#0a0a0a] border-[#2a2a2a] hover:border-[#444]'}`}>
                  <h3 className={`font-bold text-sm ${selectedStyle === style.id ? 'text-amber-400' : 'text-gray-300'}`}>{style.name}</h3>
                  <p className="text-[10px] text-gray-500 leading-tight mt-1.5">{style.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center pt-6">
            {error && <div className="text-red-400 bg-red-950/50 border border-red-900/50 px-4 py-3 rounded-lg text-sm mb-6 w-full max-w-xl text-center flex items-center justify-center backdrop-blur-sm"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{error}</div>}
            <button onClick={handleGenerateJSON} disabled={loading} className={`w-full max-w-md py-4 px-8 rounded-full font-extrabold text-black shadow-xl shadow-amber-900/20 flex items-center justify-center transition-all duration-300 text-lg ${loading ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500 hover:scale-105 hover:shadow-amber-500/25'}`}>
              {loading ? <><Loader2 className="w-6 h-6 mr-2 animate-spin text-amber-500" /> Memproses Data...</> : <><Wand2 className="w-6 h-6 mr-2" /> Generate JSON Payload</>}
            </button>
          </div>

          {/* Results Area */}
          {jsonResult && (
            <div className="grid lg:grid-cols-5 gap-6 mt-12 pb-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="lg:col-span-3 bg-[#141414] rounded-2xl p-6 md:p-8 border border-[#2a2a2a] shadow-2xl space-y-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 flex items-center"><Video className="w-4 h-4 mr-2"/> AI Visual Prompt</h3>
                  <div className="p-5 bg-[#0a0a0a] rounded-xl border border-[#333] text-[15px] text-gray-300 font-serif italic leading-relaxed shadow-inner">
                    {jsonResult.visual_prompt}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-3 flex items-center"><Music className="w-4 h-4 mr-2"/> Voice Over Script</h3>
                  <div className="p-5 bg-amber-500/5 rounded-xl border border-amber-900/30 text-[15px] text-amber-100 font-medium leading-relaxed shadow-inner">
                    "{jsonResult.voice_over_script}"
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-black rounded-2xl p-6 shadow-2xl flex flex-col min-h-[350px] border border-[#2a2a2a]">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#333]">
                  <span className="text-sm font-mono text-emerald-400 flex items-center"><Code className="w-4 h-4 mr-2"/> payload.json</span>
                  <button onClick={() => copyToClipboard(rawJsonString)} className={`text-xs font-bold flex items-center px-4 py-2 rounded-lg transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-300 border border-[#333]'}`}>
                    {copied ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5 text-amber-500" />} {copied ? 'Tersalin!' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="text-[11px] md:text-xs font-mono p-4 rounded-xl bg-[#0a0a0a] border border-[#222] overflow-auto text-yellow-500/80 flex-1 whitespace-pre-wrap leading-relaxed shadow-inner selection:bg-amber-900/50 selection:text-amber-100">
                  {rawJsonString}
                </pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
