import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Question {
  id: string;
  category: string;
  type: 'truth' | 'dare';
  text: string;
  isCustom: boolean;
  text_formal: string;
  text_casual: string;
  subCategory?: string;
  status?: string;
}

const newQuestions: Question[] = [
  // ==========================================
  // SUB-CATEGORY: CIRCLE (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "pertemanan-circle-t1",
    category: "pertemanan",
    type: "truth",
    text: "Siapa di antara anggota lingkaran pertemanan ini yang paling kamu percayai untuk menyimpan rahasia terdalammu?",
    isCustom: false,
    text_formal: "Siapa di antara anggota lingkaran pertemanan ini yang paling kamu percayai untuk menyimpan rahasia terdalammu?",
    text_casual: "Siapa di tongkrongan/circle ini yang paling aman lo titipin rahasia super deep tanpa takut bocor?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t2",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah merasa tersisih atau cemburu ketika sahabat dekatmu memiliki lingkaran pertemanan baru?",
    isCustom: false,
    text_formal: "Apakah kamu pernah merasa tersisih atau cemburu ketika sahabat dekatmu memiliki lingkaran pertemanan baru?",
    text_casual: "Pernah gak lo ngerasa fomo atau *separation anxiety* pas bestie lo punya circle baru yang asyik juga?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t3",
    category: "pertemanan",
    type: "truth",
    text: "Apakah ada rahasia salah satu teman di sini yang kamu ketahui tetapi pura-pura tidak tahu?",
    isCustom: false,
    text_formal: "Apakah ada rahasia salah satu teman di sini yang kamu ketahui tetapi pura-pura tidak tahu?",
    text_casual: "Ada gak rahasia salah satu anak di sini yang lo tahu diem-diem, tapi lo pura-pura culun gak tahu apa-apa?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t4",
    category: "pertemanan",
    type: "truth",
    text: "Sebutkan satu kebiasaan sahabatmu saat sedang bercerita sedih atau berkeluh kesah yang sebenarnya membuatmu bosan.",
    isCustom: false,
    text_formal: "Sebutkan satu kebiasaan sahabatmu saat sedang bercerita sedih atau berkeluh kesah yang sebenarnya membuatmu bosan.",
    text_casual: "Spill habit bestie lo pas lagi curhat colongan semaleman yang sebenarnya bikin lo ngantuk banget!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t5",
    category: "pertemanan",
    type: "truth",
    text: "Siapa orang pertama yang akan kamu hubungi di lingkaran pertemanan ini jika kamu mengalami situasi darurat di tengah malam?",
    isCustom: false,
    text_formal: "Siapa orang pertama yang akan kamu hubungi di lingkaran pertemanan ini jika kamu mengalami situasi darurat di tengah malam?",
    text_casual: "Siapa orang pertama di circle ini yang bakal lo telpon buat nge-back up lo pas lagi ada masalah darurat jam 2 pagi?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t6",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah berbohong kepada temanmu demi melindunginya dari masalah dengan orang lain?",
    isCustom: false,
    text_formal: "Apakah kamu pernah berbohong kepada temanmu demi melindunginya dari masalah dengan orang lain?",
    text_casual: "Pernah gak lo terpaksa bohong demi nge-cover atau masang badan buat temen lo biar gak kena masalah?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t7",
    category: "pertemanan",
    type: "truth",
    text: "Sebutkan inside joke paling konyol di antara kamu dan sahabatmu yang tidak akan dipahami oleh orang lain.",
    isCustom: false,
    text_formal: "Sebutkan inside joke paling konyol di antara kamu dan sahabatmu yang tidak akan dipahami oleh orang lain.",
    text_casual: "Apa sih jokes internal paling absurd di circle lo yang kalau diceritain ke orang luar malah dikira aneh?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t8",
    category: "pertemanan",
    type: "truth",
    text: "Bagaimana perasaanmu yang sebenarnya ketika sahabat dekatmu mulai mengabaikanmu sejak ia memiliki pacar baru?",
    isCustom: false,
    text_formal: "Bagaimana perasaanmu yang sebenarnya ketika sahabat dekatmu mulai mengabaikanmu sejak ia memiliki pacar baru?",
    text_casual: "Jujur, lo ngerasa kesel atau hampa gak pas sahabat lo mulai ilang-ilangan sejak dia bucin sama pacar barunya?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t9",
    category: "pertemanan",
    type: "truth",
    text: "Siapa di antara kita yang menurutmu paling sering menolongmu dengan tulus tanpa mengharapkan imbalan apa pun?",
    isCustom: false,
    text_formal: "Siapa di antara kita yang menurutmu paling sering menolongmu dengan tulus tanpa mengharapkan imbalan apa pun?",
    text_casual: "Di antara anak-anak di sini, siapa yang menurut lo paling tulus dan siap sedia nolongin lo pas lagi susah?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-t10",
    category: "pertemanan",
    type: "truth",
    text: "Pernahkah kamu merasa canggung saat harus menjadi pihak ketiga di antara sahabatmu dan kekasihnya saat bepergian?",
    isCustom: false,
    text_formal: "Pernahkah kamu merasa canggung saat harus menjadi pihak ketiga di antara sahabatmu dan kekasihnya saat bepergian?",
    text_casual: "Pernah gak lo ngerasa mati gaya pas terpaksa jadi nyamuk alias *third-wheeling* pas bestie lo lagi pacaran?",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d1",
    category: "pertemanan",
    type: "dare",
    text: "Kirimkan pesan suara berdurasi 10 detik ke sahabat karibmu dan katakan betapa berharganya dia bagi hidupmu.",
    isCustom: false,
    text_formal: "Kirimkan pesan suara berdurasi 10 detik ke sahabat karibmu dan katakan betapa berharganya dia bagi hidupmu.",
    text_casual: "Kirim VN 10 detik ke bestie lo, bilang: 'Meskipun lo ngeselin, tapi makasih ya udah mau jadi temen gue yang paling sabar.'!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d2",
    category: "pertemanan",
    type: "dare",
    text: "Tunjukkan foto kebersamaan paling konyol bersama sahabatmu di galeri ponselmu kepada semua pemain.",
    isCustom: false,
    text_formal: "Tunjukkan foto kebersamaan paling konyol bersama sahabatmu di galeri ponselmu kepada semua pemain.",
    text_casual: "Tunjukin foto aib paling kocak bareng bestie lo yang ada di galeri hp sekarang ke semuanya!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d3",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan panggilan telepon kepada teman dekatmu dan mintalah dia menjelaskan satu keistimewaan dirimu dalam 30 detik.",
    isCustom: false,
    text_formal: "Lakukan panggilan telepon kepada teman dekatmu dan mintalah dia menjelaskan satu keistimewaan dirimu dalam 30 detik.",
    text_casual: "Telpon sahabat lo, suruh dia nyebutin 3 sifat baik lo dalam waktu 30 detik. Gak boleh mikir lama!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d4",
    category: "pertemanan",
    type: "dare",
    text: "Posisikan kedua tanganmu di pundak teman di sebelah kirimu lalu tatap matanya dengan ekspresi penuh kasih sayang selama 15 detik.",
    isCustom: false,
    text_formal: "Posisikan kedua tanganmu di pundak teman di sebelah kirimu lalu tatap matanya dengan ekspresi penuh kasih sayang selama 15 detik.",
    text_casual: "Pegang pundak temen sebelah kiri lo, tatap matanya dalam-dalam, terus bilang 'Lo emang bestie terbaik gue' tanpa ketawa!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d5",
    category: "pertemanan",
    type: "dare",
    text: "Ceritakan satu momen kebohongan kecil demi menutupi kesalahan sahabatmu yang belum diketahui siapapun di ruangan ini.",
    isCustom: false,
    text_formal: "Ceritakan satu momen kebohongan kecil demi menutupi kesalahan sahabatmu yang belum diketahui siapapun di ruangan ini.",
    text_casual: "Spill satu momen di mana lo pernah sekongkol bohong demi nge-selametin muka atau kesalahan sahabat lo!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d6",
    category: "pertemanan",
    type: "dare",
    text: "Tuliskan pesan apresiasi singkat dan tulus di kolom komentar unggahan terbaru Instagram sahabatmu saat ini.",
    isCustom: false,
    text_formal: "Tuliskan pesan apresiasi singkat dan tulus di kolom komentar unggahan terbaru Instagram sahabatmu saat ini.",
    text_casual: "Tulis komen penuh apresiasi yang tulus dan manis di postingan IG terbaru bestie lo sekarang juga!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d7",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan tos rahasia atau jabat tangan unik bersama sahabatmu yang paling sering kalian lakukan di tempat umum.",
    isCustom: false,
    text_formal: "Lakukan tos rahasia atau jabat tangan unik bersama sahabatmu yang paling sering kalian lakukan di tempat umum.",
    text_casual: "Peragain jabat tangan/tos rahasia *circle* lo yang paling ikonik di depan anak-anak sekarang!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d8",
    category: "pertemanan",
    type: "dare",
    text: "Pinjam salah satu barang milik teman di kananmu lalu gunakan barang tersebut dengan cara yang sangat aneh.",
    isCustom: false,
    text_formal: "Pinjam salah satu barang milik teman di kananmu lalu gunakan barang tersebut dengan cara yang sangat aneh.",
    text_casual: "Pinjem kacamata/topi/barang temen sebelah kanan lo, terus pake dengan gaya paling alay selama dua putaran ke depan.",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d9",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan imitasi singkat gaya bicara atau ekspresi khas dari sahabat terdekatmu ketika ia sedang mengomel.",
    isCustom: false,
    text_formal: "Lakukan imitasi singkat gaya bicara atau ekspresi khas dari sahabat terdekatmu ketika ia sedang mengomel.",
    text_casual: "Peragain gaya bestie lo pas lagi ngomel-ngomel manja atau panik. Harus mirip dan totalitas!",
    subCategory: "circle",
    status: "approved"
  },
  {
    id: "pertemanan-circle-d10",
    category: "pertemanan",
    type: "dare",
    text: "Kirimkan stiker pelukan hangat di obrolan WhatsApp sahabat dekatmu sekarang tanpa memberikan penjelasan apa pun.",
    isCustom: false,
    text_formal: "Kirimkan stiker pelukan hangat di obrolan WhatsApp sahabat dekatmu sekarang tanpa memberikan penjelasan apa pun.",
    text_casual: "Kirim sticker pelukan paling gemas ke chat WhatsApp sahabat lo tanpa teks apa-apa!",
    subCategory: "circle",
    status: "approved"
  },

  // ===============================================
  // SUB-CATEGORY: TONGKRONGAN (10 Truths, 10 Dares)
  // ===============================================
  {
    id: "pertemanan-tongkrongan-t1",
    category: "pertemanan",
    type: "truth",
    text: "Pernahkah kamu sengaja berbohong menghindari ajakan berkumpul dengan alasan sibuk, padahal kamu hanya malas pergi?",
    isCustom: false,
    text_formal: "Pernahkah kamu sengaja berbohong menghindari ajakan berkumpul dengan alasan sibuk, padahal kamu hanya malas pergi?",
    text_casual: "Jujur, pernah gak lo bikin alasan bohong kayak 'lagi sibuk/ada acara' biar gak ikut ngumpul padahal aslinya cuma mager?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t2",
    category: "pertemanan",
    type: "truth",
    text: "Bagaimana tanggapanmu terhadap teman di tongkrongan yang selalu diam saat pembayaran patungan tetapi sangat aktif saat memesan makanan?",
    isCustom: false,
    text_formal: "Bagaimana tanggapanmu terhadap teman di tongkrongan yang selalu diam saat pembayaran patungan tetapi sangat aktif saat memesan makanan?",
    text_casual: "Menurut lo, gimana tipe temen yang pas pesen makan paling heboh tapi pas giliran patungan mendadak ilang atau pura-pura lupa?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t3",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah merasa terpaksa mengikuti tren berpakaian atau gaya hidup tertentu agar dinilai keren oleh tongkronganmu?",
    isCustom: false,
    text_formal: "Apakah kamu pernah merasa terpaksa mengikuti tren berpakaian atau gaya hidup tertentu agar dinilai keren oleh tongkronganmu?",
    text_casual: "Pernah gak lo ngerasa fomo atau terpaksa ikut-ikutan tren outfit skena biar diakui keren pas nongkrong?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t4",
    category: "pertemanan",
    type: "truth",
    text: "Pernahkah kamu membaca pesan di grup obrolan tongkrongan tanpa berniat membalasnya sama sekali karena topik yang membosankan?",
    isCustom: false,
    text_formal: "Pernahkah kamu membaca pesan di grup obrolan tongkrongan tanpa berniat membalasnya sama sekali karena topik yang membosankan?",
    text_casual: "Pernah gak lo nge-read doang chat di grup tongkrongan tanpa kepikiran bales karena topiknya gak masuk di lo?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t5",
    category: "pertemanan",
    type: "truth",
    text: "Siapa di antara teman di sini yang menurutmu paling sering membuat janji wacana tetapi selalu membatalkannya di menit-menit terakhir?",
    isCustom: false,
    text_formal: "Siapa di antara teman di sini yang menurutmu paling sering membuat janji wacana tetapi selalu membatalkannya di menit-menit terakhir?",
    text_casual: "Siapa di antara anak-anak di sini yang dapet gelar 'Duta Wacana' gara-gara sering banget nge-cancel janji ngumpul H-1 jam?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t6",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah mengunggah momen berkumpul di media sosial hanya agar dinilai sebagai orang yang populer dan memiliki banyak teman?",
    isCustom: false,
    text_formal: "Apakah kamu pernah mengunggah momen berkumpul di media sosial hanya agar dinilai sebagai orang yang populer dan memiliki banyak teman?",
    text_casual: "Pernah gak lo sengaja post foto rame-rame pas nongkrong cuma demi kelihatan hits dan punya banyak relasi di medsos?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t7",
    category: "pertemanan",
    type: "truth",
    text: "Siapa orang di tongkrongan ini yang menurutmu paling sering bertindak hanya untuk mencari perhatian di media sosial?",
    isCustom: false,
    text_formal: "Siapa orang di tongkrongan ini yang menurutmu paling sering bertindak hanya untuk mencari perhatian di media sosial?",
    text_casual: "Siapa anak di circle ini yang diam-diam menurut lo paling hobi pencitraan atau *clout chasing* di sosmed?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t8",
    category: "pertemanan",
    type: "truth",
    text: "Apa hal yang paling membuatmu merasa tidak nyaman saat sedang berkumpul bersama teman-teman barumu?",
    isCustom: false,
    text_formal: "Apa hal yang paling membuatmu merasa tidak nyaman saat sedang berkumpul bersama teman-teman barumu?",
    text_casual: "Hal paling canggung apa yang sering bikin lo pengen pulang cepet saat lagi ngumpul sama temen barunya temen lo?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t9",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah secara tidak sengaja mengabaikan temanmu saat berkumpul karena kamu terlalu asyik bermain gim atau media sosial di ponselmu?",
    isCustom: false,
    text_formal: "Apakah kamu pernah secara tidak sengaja mengabaikan temanmu saat berkumpul karena kamu terlalu asyik bermain gim atau media sosial di ponselmu?",
    text_casual: "Pernah gak lo dicap autis/anti-sosial pas nongkrong gara-gara mata lo nempel terus ke layar hp main game atau scrolling tiktok?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-t10",
    category: "pertemanan",
    type: "truth",
    text: "Apakah ada teman di lingkaran pertemanan ini yang menurutmu memiliki selera humor paling garing tetapi kamu tetap tertawa agar ia senang?",
    isCustom: false,
    text_formal: "Apakah ada teman di lingkaran pertemanan ini yang menurutmu memiliki selera humor paling garing tetapi kamu tetap tertawa agar ia senang?",
    text_casual: "Siapa di sini yang jokes-nya paling garing kriuk, tapi lo tetep maksain ketawa demi nge-hargain perasaannya?",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d1",
    category: "pertemanan",
    type: "dare",
    text: "Tunjukkan pesan langsung dari orang asing di akun Instagram kamu yang paling aneh kepada semua pemain.",
    isCustom: false,
    text_formal: "Tunjukkan pesan langsung dari orang asing di akun Instagram kamu yang paling aneh kepada semua pemain.",
    text_casual: "Buka DM request / spam di IG lo, tunjukin pesan paling random atau aneh dari orang gak dikenal ke semua orang!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d2",
    category: "pertemanan",
    type: "dare",
    text: "Tandai temanmu dalam unggahan meme yang sangat memalukan di akun media sosial umummu saat ini juga.",
    isCustom: false,
    text_formal: "Tandai temanmu dalam unggahan meme yang sangat memalukan di akun media sosial umummu saat ini juga.",
    text_casual: "Tag salah satu temen tongkrongan lo di meme kocak/aib di komentar IG atau TikTok secara random!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d3",
    category: "pertemanan",
    type: "dare",
    text: "Kirimkan pesan ke grup obrolan tongkronganmu yang berisi pernyataan bahwa kamu akan membayar semua tagihan makanan pertemuan berikutnya.",
    isCustom: false,
    text_formal: "Kirimkan pesan ke grup obrolan tongkronganmu yang berisi pernyataan bahwa kamu akan membayar semua tagihan makanan pertemuan berikutnya.",
    text_casual: "Kirim chat ke grup tongkrongan lo: 'Tenang, besok kalau kita ngumpul lagi, semua gue yang traktir!' terus liat reaksinya!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d4",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan tantangan menirukan gaya foto ala remaja skena kekinian dengan pose yang sangat berlebihan di depan pemain lain.",
    isCustom: false,
    text_formal: "Lakukan tantangan menirukan gaya foto ala remaja skena kekinian dengan pose yang sangat berlebihan di depan pemain lain.",
    text_casual: "Tunjukin pose foto ala anak skena paling estetik tapi lebay (pose megang kopi senja, tatapan kosong, bungkuk dikit). Harus totalitas!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d5",
    category: "pertemanan",
    type: "dare",
    text: "Kirimkan pesan teks ke nomor acak dari riwayat obrolan WhatsApp kamu berisi kalimat 'Aku tahu rahasiamu' dan jangan dibalas.",
    isCustom: false,
    text_formal: "Kirimkan pesan teks ke nomor acak dari riwayat obrolan WhatsApp kamu berisi kalimat 'Aku tahu rahasiamu' dan jangan dibalas.",
    text_casual: "Kirim chat 'Gue tahu rahasia lo...' ke salah satu temen lo di WA secara acak, terus langsung di-archive chat-nya!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d6",
    category: "pertemanan",
    type: "dare",
    text: "Nyanyikan sepenggal lagu pop indie bertema senja dan kopi dengan suara paling merdu dan penuh penghayatan.",
    isCustom: false,
    text_formal: "Nyanyikan sepenggal lagu pop indie bertema senja dan kopi dengan suara paling merdu dan penuh penghayatan.",
    text_casual: "Nyanyiin lagu indie senja-kopi paling syahdu dengan suara mendayu-dayu seolah lo adalah anak skena sejati!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d7",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan siaran langsung singkat di Instagram atau TikTok selama satu menit lalu sapa semua penonton dengan gaya pembawa acara televisi.",
    isCustom: false,
    text_formal: "Lakukan siaran langsung singkat di Instagram atau TikTok selama satu menit lalu sapa semua penonton dengan gaya pembawa acara televisi.",
    text_casual: "Live IG atau TikTok selama 1 menit sekarang juga, terus sapa penonton pake gaya MC kondangan super heboh!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d8",
    category: "pertemanan",
    type: "dare",
    text: "Perlihatkan waktu pemakaian layar (screen time) harian di ponselmu untuk membuktikan seberapa tinggi tingkat kecanduanmu terhadap media sosial.",
    isCustom: false,
    text_formal: "Perlihatkan waktu pemakaian layar (screen time) harian di ponselmu untuk membuktikan seberapa tinggi tingkat kecanduanmu terhadap media sosial.",
    text_casual: "Spill screen time HP lo hari ini! Biar ketahuan seberapa akut tingkat kecanduan lo nge-scroll TikTok atau IG.",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d9",
    category: "pertemanan",
    type: "dare",
    text: "Pilihlah salah satu daftar putar lagu favoritmu di platform musik lalu putar lagu yang paling memalukan dengan volume keras.",
    isCustom: false,
    text_formal: "Pilihlah salah satu daftar putar lagu favoritmu di platform musik lalu putar lagu yang paling memalukan dengan volume keras.",
    text_casual: "Buka Spotify/Youtube, putar lagu paling alay atau meme song yang paling sering lo dengerin kenceng-kenceng selama 20 detik!",
    subCategory: "tongkrongan",
    status: "approved"
  },
  {
    id: "pertemanan-tongkrongan-d10",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan tantangan tidak menyentuh ponsel pribadimu sama sekali hingga permainan ini selesai sepenuhnya.",
    isCustom: false,
    text_formal: "Lakukan tantangan tidak menyentuh ponsel pribadimu sama sekali hingga permainan ini selesai sepenuhnya.",
    text_casual: "Taruh HP lo di tengah meja. Gak boleh disentuh atau dilihat sama sekali sampai game ini bener-bener kelar!",
    subCategory: "tongkrongan",
    status: "approved"
  },

  // ==========================================
  // SUB-CATEGORY: DRAMA (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "pertemanan-drama-t1",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah membicarakan keburukan salah satu teman di ruangan ini di belakangnya bersama orang lain?",
    isCustom: false,
    text_formal: "Apakah kamu pernah membicarakan keburukan salah satu teman di ruangan ini di belakangnya bersama orang lain?",
    text_casual: "Jujur no debat, pernah gak lo diem-diem nggosipin atau ngomongin kejelekan salah satu anak di ruangan ini bareng temen lain?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t2",
    category: "pertemanan",
    type: "truth",
    text: "Sebutkan satu nama teman yang pernah meminjam uang kepadamu tetapi sangat sulit dihubungi saat tiba waktu penagihan.",
    isCustom: false,
    text_formal: "Sebutkan satu nama teman yang pernah meminjam uang kepadamu tetapi sangat sulit dihubungi saat tiba waktu penagihan.",
    text_casual: "Spill inisial temen yang pernah ngutang ke lo, tapi pas ditagih malah dia yang lebih galak atau mendem pura-pura amnesia!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t3",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah merasa dikhianati atau dilaporkan kesalahannya kepada otoritas tertentu oleh seseorang yang kamu anggap teman?",
    isCustom: false,
    text_formal: "Apakah kamu pernah merasa dikhianati atau dilaporkan kesalahannya kepada otoritas tertentu oleh seseorang yang kamu anggap teman?",
    text_casual: "Pernah gak lo ngerasa ditusuk dari belakang atau di-cepuin sama temen sendiri demi cari muka ke atasan atau guru?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t4",
    category: "pertemanan",
    type: "truth",
    text: "Siapa di antara teman di lingkaran ini yang menurutmu menderita sindrom ingin selalu diperhatikan atau bertindak berlebihan?",
    isCustom: false,
    text_formal: "Siapa di antara teman di lingkaran ini yang menurutmu menderita sindrom ingin selalu diperhatikan atau bertindak berlebihan?",
    text_casual: "Siapa di tongkrongan lo yang diam-diam menurut lo punya sifat *pick me* atau suka cari perhatian berlebihan?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t5",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah melakukan tindakan diam membisu kepada temanmu tanpa pernah menjelaskan letak kesalahannya?",
    isCustom: false,
    text_formal: "Apakah kamu pernah melakukan tindakan diam membisu kepada temanmu tanpa pernah menjelaskan letak kesalahannya?",
    text_casual: "Pernah gak lo ngasih *silent treatment* berhari-hari ke temen lo tanpa ngasih tahu salah dia ada di mana?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t6",
    category: "pertemanan",
    type: "truth",
    text: "Berapa jumlah teman yang terpaksa kamu batasi interaksinya atau bahkan kamu blokir di media sosial karena perilakunya yang meracuni pikiranmu?",
    isCustom: false,
    text_formal: "Berapa jumlah teman yang terpaksa kamu batasi interaksinya atau bahkan kamu blokir di media sosial karena perilakunya yang meracuni pikiranmu?",
    text_casual: "Ada berapa temen yang udah lo block atau mute di sosmed karena kelakuannya toxic banget dan bikin emosi?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t7",
    category: "pertemanan",
    type: "truth",
    text: "Apakah ada momen di mana kamu merasa bersaing ketat atau iri atas pencapaian karier atau akademis sahabat dekatmu sendiri?",
    isCustom: false,
    text_formal: "Apakah ada momen di mana kamu merasa bersaing ketat atau iri atas pencapaian karier atau akademis sahabat dekatmu sendiri?",
    text_casual: "Pernah gak lo diem-diem ngerasa tersaingin atau iri pas ngeliat pencapaian karier atau kehidupan temen deket lo?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t8",
    category: "pertemanan",
    type: "truth",
    text: "Apa sifat buruk paling menonjol dari dirimu sendiri yang sering membuat teman-temanmu perlahan-lahan menjauhimu?",
    isCustom: false,
    text_formal: "Apa sifat buruk paling menonjol dari dirimu sendiri yang sering membuat teman-temanmu perlahan-lahan menjauhimu?",
    text_casual: "Apa sih kebiasaan toxic lo sendiri yang lo sadar sering bikin orang lain males temenan lama-lama sama lo?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t9",
    category: "pertemanan",
    type: "truth",
    text: "Pernahkah kamu menyebarkan rahasia atau gosip yang belum terbukti kebenarannya mengenai temanmu hanya demi suasana obrolan yang seru?",
    isCustom: false,
    text_formal: "Pernahkah kamu menyebarkan rahasia atau gosip yang belum terbukti kebenarannya mengenai temanmu hanya demi suasana obrolan yang seru?",
    text_casual: "Pernah gak lo ikut-ikutan nyebarin gosip panas (*spill the tea*) tentang temen lo sendiri biar obrolan tongkrongan makin seru?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-t10",
    category: "pertemanan",
    type: "truth",
    text: "Apakah kamu pernah menyesali keputusan berteman erat dengan seseorang karena pada akhirnya kalian terasing satu sama lain?",
    isCustom: false,
    text_formal: "Apakah kamu pernah menyesali keputusan berteman erat dengan seseorang karena pada akhirnya kalian terasing satu sama lain?",
    text_casual: "Pernah gak lo ngerasa nyesel banget pernah deket sama seseorang karena ujung-ujungnya malah jadi asing dan canggung?",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d1",
    category: "pertemanan",
    type: "dare",
    text: "Kirimkan pesan teks singkat ke kontak teman yang sudah lama tidak saling berbicara berisi kalimat 'Bagaimana kabarmu saat ini?'.",
    isCustom: false,
    text_formal: "Kirimkan pesan teks singkat ke kontak teman yang sudah lama tidak saling berbicara berisi kalimat 'Bagaimana kabarmu saat ini?'.",
    text_casual: "Chat mantan temen deket lo (orang yang udah lama *lost contact*) bilang: 'Halo, apa kabar? Semoga sehat selalu ya.'!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d2",
    category: "pertemanan",
    type: "dare",
    text: "Tunjukkan daftar kontak ponsel yang telah kamu blokir di aplikasi WhatsApp kepada seluruh pemain di ruangan ini.",
    isCustom: false,
    text_formal: "Tunjukkan daftar kontak ponsel yang telah kamu blokir di aplikasi WhatsApp kepada seluruh pemain di ruangan ini.",
    text_casual: "Buka daftar kontak yang di-block di WA lo sekarang, tunjukin ke kita semua siapa aja isinya!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d3",
    category: "pertemanan",
    type: "dare",
    text: "Ucapkan satu permintaan maaf yang paling tulus kepada salah satu teman di ruangan ini atas kesalahan di masa lampau yang belum terselesaikan.",
    isCustom: false,
    text_formal: "Ucapkan satu permintaan maaf yang paling tulus kepada salah satu teman di ruangan ini atas kesalahan di masa lampau yang belum terselesaikan.",
    text_casual: "Minta maaf secara tulus dan tatap mata salah satu anak di sini atas kesalahan masa lalu yang belum pernah lo sebutin!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d4",
    category: "pertemanan",
    type: "dare",
    text: "Tunjukkan kepada kami bagian pesan langsung terlama di media sosialmu yang berisi perdebatan sengit dengan seseorang.",
    isCustom: false,
    text_formal: "Tunjukkan kepada kami bagian pesan langsung terlama di media sosialmu yang berisi perdebatan sengit dengan seseorang.",
    text_casual: "Buka isi DM/chat perdebatan terpanas atau dramatis yang pernah lo alamin sama orang lain, bacain dikit teksnya!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d5",
    category: "pertemanan",
    type: "dare",
    text: "Lakukan panggilan telepon kepada temanmu lalu tanyakan secara langsung mengenai rumor kurang menyenangkan tentang dirimu yang pernah ia dengar.",
    isCustom: false,
    text_formal: "Lakukan panggilan telepon kepada temanmu lalu tanyakan secara langsung mengenai rumor kurang menyenangkan tentang dirimu yang pernah ia dengar.",
    text_casual: "Telpon temen lo di luar circle ini, tanya: 'Eh, lo pernah denger gosip miring atau aneh apa sih tentang gue?'!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d6",
    category: "pertemanan",
    type: "dare",
    text: "Katakan satu sifat yang paling tidak kamu sukai dari masing-masing pemain di ruangan ini secara jujur tetapi tetap sopan.",
    isCustom: false,
    text_formal: "Katakan satu sifat yang paling tidak kamu sukai dari masing-masing pemain di ruangan ini secara jujur tetapi tetap sopan.",
    text_casual: "Sebutin satu sifat/kebiasaan dari masing-masing orang di ruangan ini yang menurut lo agak mengganggu, harus jujur tapi sopan!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d7",
    category: "pertemanan",
    type: "dare",
    text: "Tuliskan satu tanggapan singkat di akun media sosial kamu mengenai pendapatmu tentang fenomena teman sejati dan palsu.",
    isCustom: false,
    text_formal: "Tuliskan satu tanggapan singkat di akun media sosial kamu mengenai pendapatmu tentang fenomena teman sejati dan palsu.",
    text_casual: "Post kata-kata bijak tentang 'fake friends' di status WhatsApp lo sekarang tanpa penjelasan apa-apa!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d8",
    category: "pertemanan",
    type: "dare",
    text: "Biarkan teman di kirimu memilih satu kontak di ponselmu lalu kirimkan pesan suara tertawa kencang seperti tokoh antagonis.",
    isCustom: false,
    text_formal: "Biarkan teman di kirimu memilih satu kontak di ponselmu lalu kirimkan pesan suara tertawa kencang seperti tokoh antagonis.",
    text_casual: "Biarkan temen sebelah kiri milih kontak WA acak di HP lo, terus kirim VN ketawa jahat ala villain sinteron ke kontak itu!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d9",
    category: "pertemanan",
    type: "dare",
    text: "Peragakan kembali adegan paling dramatis saat kamu bertengkar karena masalah kecil dengan seseorang hingga meluapkan kekesalan.",
    isCustom: false,
    text_formal: "Peragakan kembali adegan paling dramatis saat kamu bertengkar karena masalah kecil dengan seseorang hingga meluapkan kekesalan.",
    text_casual: "Akting 20 detik meragain gaya lo pas lagi ngelabrak atau marah besar ke orang yang bikin lo dongkol setengah mati!",
    subCategory: "drama",
    status: "approved"
  },
  {
    id: "pertemanan-drama-d10",
    category: "pertemanan",
    type: "dare",
    text: "Kirimkan pesan teks berisi 'Aku merindukan kebersamaan kita dahulu' kepada kawan lamamu yang kini sudah menjauh.",
    isCustom: false,
    text_formal: "Kirimkan pesan teks berisi 'Aku merindukan kebersamaan kita dahulu' kepada kawan lamamu yang kini sudah menjauh.",
    text_casual: "Chat kawan lama lo yang udah renggang hubungannya, tulis: 'Kangen deh masa-masa kita dulu pas sering main bareng.'!",
    subCategory: "drama",
    status: "approved"
  }
];

function main() {
  console.log('=== LOADING DATABASE TO APPEND 60 NEW PERTEMANAN QUESTIONS ===');
  if (!fs.existsSync(DB_FILE)) {
    console.error('Error: db.json file not found.');
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  let db: any;
  try {
    db = JSON.parse(raw);
  } catch (err: any) {
    console.error('Error parsing db.json:', err.message);
    process.exit(1);
  }

  if (!db.questions || !Array.isArray(db.questions)) {
    console.error('Error: questions is not an array.');
    process.exit(1);
  }

  if (!db.subCategories || !Array.isArray(db.subCategories)) {
    db.subCategories = [];
  }

  console.log(`Currently there are ${db.questions.length} questions in the database.`);

  // 1. Ensure target subCategories exist
  const targetSubCats = [
    { key: "circle", label: "Circle & Bestie", parentKey: "pertemanan" },
    { key: "tongkrongan", label: "Tongkrongan & Sosmed", parentKey: "pertemanan" },
    { key: "drama", label: "Drama & Konflik", parentKey: "pertemanan" }
  ];

  for (const sc of targetSubCats) {
    const exists = db.subCategories.some((existing: any) => existing.key === sc.key);
    if (!exists) {
      db.subCategories.push(sc);
      console.log(`Registered subcategory: ${sc.key} -> parent: ${sc.parentKey}`);
    }
  }

  // 2. Append new questions safely
  let addedCount = 0;
  for (const q of newQuestions) {
    const exists = db.questions.some((existing: any) => existing.id === q.id);
    if (!exists) {
      db.questions.push(q);
      addedCount++;
    }
  }

  if (addedCount > 0 || db.subCategories.length > 0) {
    console.log(`Successfully appended ${addedCount} new highly interactive Gen-Z Pertemanan questions!`);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('Database updated successfully!');
  } else {
    console.log('All 60 questions already exist in the database.');
  }
}

main();
