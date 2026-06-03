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
  // SUB-CATEGORY: PDKT (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "asmara-pdkt-t1",
    category: "asmara",
    type: "truth",
    text: "Berapa lama waktu maksimal yang kamu butuhkan untuk membalas pesan orang yang kamu sukai sebelum kamu dianggap mengabaikannya?",
    isCustom: false,
    text_formal: "Berapa lama waktu maksimal yang kamu butuhkan untuk membalas pesan orang yang kamu sukai sebelum kamu dianggap mengabaikannya?",
    text_casual: "Berapa lama waktu maksimal yang lo butuhin buat bales chat *crush* sebelum lo dianggap *ghosting* atau sengaja jual mahal?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t2",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu pernah sengaja mengunggah cerita di Instagram hanya agar dilihat oleh satu orang tertentu saja?",
    isCustom: false,
    text_formal: "Apakah kamu pernah sengaja mengunggah cerita di Instagram hanya agar dilihat oleh satu orang tertentu saja?",
    text_casual: "Pernah gak sih lo sengaja bikin IG Story cuma demi di-view sama satu orang spesifik doang? Akui aja!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t3",
    category: "asmara",
    type: "truth",
    text: "Apa alasan konyol yang pernah kamu gunakan untuk memulai percakapan dengan seseorang yang kamu minati?",
    isCustom: false,
    text_formal: "Apa alasan konyol yang pernah kamu gunakan untuk memulai percakapan dengan seseorang yang kamu minati?",
    text_casual: "Apa alasan paling *cringe* yang pernah lo pake buat nge-chat atau nyari topik sama *crush* lo?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t4",
    category: "asmara",
    type: "truth",
    text: "Bagaimana reaksi kamu saat orang yang sedang dekat denganmu tiba-tiba membalas pesanmu dengan sangat singkat?",
    isCustom: false,
    text_formal: "Bagaimana reaksi kamu saat orang yang sedang dekat denganmu tiba-tiba membalas pesanmu dengan sangat singkat?",
    text_casual: "Gimana reaksi lo pas doi bales chat lo cuma 'Y' atau singkat banget? Langsung *overthinking* semaleman gak?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t5",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu masih sering mencari tahu kabar tentang mantan kekasihmu melalui akun palsu di media sosial?",
    isCustom: false,
    text_formal: "Apakah kamu masih sering mencari tahu kabar tentang mantan kekasihmu melalui akun palsu di media sosial?",
    text_casual: "Jujur, lo masih suka nge-stalk akun sosmed mantan atau gebetan pake *alternative account* (second account) gak?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t6",
    category: "asmara",
    type: "truth",
    text: "Apa sinyal membingungkan paling aneh yang pernah kamu terima selama menjalani hubungan tanpa status?",
    isCustom: false,
    text_formal: "Apa sinyal membingungkan paling aneh yang pernah kamu terima selama menjalani hubungan tanpa status?",
    text_casual: "Apa *mixed signal* paling absurd yang pernah lo dapet pas lagi terjebak di fase *situationship* alias HTS?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t7",
    category: "asmara",
    type: "truth",
    text: "Siapa orang terakhir yang kamu cari di kolom pencarian Instagram dan mengapa kamu mencari tahu tentang dirinya?",
    isCustom: false,
    text_formal: "Siapa orang terakhir yang kamu cari di kolom pencarian Instagram dan mengapa kamu mencari tahu tentang dirinya?",
    text_casual: "Siapa orang terakhir yang lo ketik di kolom *search* Instagram, dan jujur ngapain lo kepoin dia?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t8",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu pernah mengabaikan pesan seseorang hanya karena kamu sedang malas berbicara, meskipun kamu sedang aktif di media sosial?",
    isCustom: false,
    text_formal: "Apakah kamu pernah mengabaikan pesan seseorang hanya karena kamu sedang malas berbicara, meskipun kamu sedang aktif di media sosial?",
    text_casual: "Pernah gak lo sengaja nge-diemin chat orang padahal lo lagi asyik nge-scroll TikTok atau update story?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t9",
    category: "asmara",
    type: "truth",
    text: "Apa hal yang paling membuat kamu merasa malu saat sedang berusaha mendekati seseorang?",
    isCustom: false,
    text_formal: "Apa hal yang paling membuat kamu merasa malu saat sedang berusaha mendekati seseorang?",
    text_casual: "Momen PDKT paling bikin salting brutalll yang pernah lo alamin sampai pengen menghilang dari bumi apa nih?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-t10",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu lebih memilih menyatakan perasaanmu terlebih dahulu secara langsung atau menunggu orang tersebut yang memulainya?",
    isCustom: false,
    text_formal: "Apakah kamu lebih memilih menyatakan perasaanmu terlebih dahulu secara langsung atau menunggu orang tersebut yang memulainya?",
    text_casual: "Lebih milih confess duluan meskipun berisiko kena *friendzone*, atau mendem perasaan sampai dia diambil orang?",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d1",
    category: "asmara",
    type: "dare",
    text: "Kirimkan stiker lucu ke pesan langsung Instagram milik orang yang kamu sukai sekarang juga tanpa penjelasan apapun.",
    isCustom: false,
    text_formal: "Kirimkan stiker lucu ke pesan langsung Instagram milik orang yang kamu sukai sekarang juga tanpa penjelasan apapun.",
    text_casual: "Kirim stiker paling random atau meme kocak ke DM IG *crush* lo sekarang juga tanpa penjelasan apa-apa!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d2",
    category: "asmara",
    type: "dare",
    text: "Tunjukkan riwayat pencarian terbaru di akun Instagram atau TikTok kamu kepada semua pemain di sini.",
    isCustom: false,
    text_formal: "Tunjukkan riwayat pencarian terbaru di akun Instagram atau TikTok kamu kepada semua pemain di sini.",
    text_casual: "No sensor! Tunjukin riwayat pencarian (search history) IG atau TikTok lo ke semua orang di sini sekarang.",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d3",
    category: "asmara",
    type: "dare",
    text: "Ketuk dua kali (sukai) unggahan lama di akun Instagram milik orang yang sedang dekat denganmu, lalu biarkan selama lima menit.",
    isCustom: false,
    text_formal: "Ketuk dua kali (sukai) unggahan lama di akun Instagram milik orang yang sedang dekat denganmu, lalu biarkan selama lima menit.",
    text_casual: "Like postingan jadul (minimal 1 tahun lalu) di IG gebetan / *crush* lo, terus jangan di-unlike sampai spin berikutnya selesai!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d4",
    category: "asmara",
    type: "dare",
    text: "Kirimkan pesan suara ke nomor orang yang kamu sukai dan nyanyikan bagian reff dari lagu romantis selama 15 detik.",
    isCustom: false,
    text_formal: "Kirimkan pesan suara ke nomor orang yang kamu sukai dan nyanyikan bagian reff dari lagu romantis selama 15 detik.",
    text_casual: "Kirim VN suara nyanyiin reff lagu romantis selama 15 detik ke nomor doi atau *crush* lo sekarang!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d5",
    category: "asmara",
    type: "dare",
    text: "Biarkan teman di sebelah kananmu menulis dan mengirimkan satu twit atau status acak di media sosialmu.",
    isCustom: false,
    text_formal: "Biarkan teman di sebelah kananmu menulis dan mengirimkan satu twit atau status acak di media sosialmu.",
    text_casual: "Kasih HP lo ke orang sebelah kanan, biarkan dia nulis dan nge-post status random apa saja di Twitter (X) atau WhatsApp Story lo.",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d6",
    category: "asmara",
    type: "dare",
    text: "Ganti nama kontak orang yang sedang dekat denganmu di WhatsApp menjadi nama yang sangat unik atau aneh selama sisa permainan.",
    isCustom: false,
    text_formal: "Ganti nama kontak orang yang sedang dekat denganmu di WhatsApp menjadi nama yang sangat unik atau aneh selama sisa permainan.",
    text_casual: "Ganti nama kontak gebetan/pacar di WA pake nama super alay atau aneh pilihan temen-temen di sini sampai game selesai.",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d7",
    category: "asmara",
    type: "dare",
    text: "Sukai cerita Instagram teratas di baris pertama akun Instagram kamu tanpa ragu-ragu.",
    isCustom: false,
    text_formal: "Sukai cerita Instagram teratas di baris pertama akun Instagram kamu tanpa ragu-ragu.",
    text_casual: "Kasih 'Love' di IG Story urutan pertama di beranda lo sekarang juga, tanpa peduli itu story siapa!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d8",
    category: "asmara",
    type: "dare",
    text: "Kirim pesan kepada teman dekatmu dan tanyakan pendapat jujurnya mengenai peluang hubungan asmaramu saat ini.",
    isCustom: false,
    text_formal: "Kirim pesan kepada teman dekatmu dan tanyakan pendapat jujurnya mengenai peluang hubungan asmaramu saat ini.",
    text_casual: "Chat sahabat lo sekarang, tanya: 'Menurut lo, gue sama si doi ada harapan jadian gak sih?' terus tunjukin balesannya!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d9",
    category: "asmara",
    type: "dare",
    text: "Reka ulang cara kamu bersikap saat sedang berusaha tebar pesona atau mencari perhatian orang lain di tempat umum.",
    isCustom: false,
    text_formal: "Reka ulang cara kamu bersikap saat sedang berusaha tebar pesona atau mencari perhatian orang lain di tempat umum.",
    text_casual: "Peragain gaya lo tebar pesona atau caper pas lagi papasan sama cowok/cewek cakep di mall. Harus ekspresif!",
    subCategory: "pdkt",
    status: "approved"
  },
  {
    id: "asmara-pdkt-d10",
    category: "asmara",
    type: "dare",
    text: "Lakukan panggilan telepon kepada kawan lamamu, lalu katakan 'Aku merindukanmu' dengan nada yang sangat dramatis dan langsung matikan teleponnya.",
    isCustom: false,
    text_formal: "Lakukan panggilan telepon kepada kawan lamamu, lalu katakan 'Aku merindukanmu' dengan nada yang sangat dramatis dan langsung matikan teleponnya.",
    text_casual: "Telpon temen lo secara acak, bilang 'Gue kangen banget sama lo...' pake nada mellow/nangis, terus langsung tutup telponnya!",
    subCategory: "pdkt",
    status: "approved"
  },

  // ==========================================
  // SUB-CATEGORY: PACARAN (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "asmara-pacaran-t1",
    category: "asmara",
    type: "truth",
    text: "Apa hal sepele yang paling sering memicu perdebatan konyol atau membuatmu terlalu banyak berpikir dalam hubunganmu?",
    isCustom: false,
    text_formal: "Apa hal sepele yang paling sering memicu perdebatan konyol atau membuatmu terlalu banyak berpikir dalam hubunganmu?",
    text_casual: "Hal gak penting apa yang paling sering bikin lo *overthinking* brutal atau memicu berantem hebat sama pacar?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t2",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu menganggap membagikan kata sandi akun media sosial kepada pasangan adalah hal yang wajib atau justru melanggar privasi?",
    isCustom: false,
    text_formal: "Apakah kamu menganggap membagikan kata sandi akun media sosial kepada pasangan adalah hal yang wajib atau justru melanggar privasi?",
    text_casual: "Menurut lo, tukeran password IG/TikTok sama pacar itu bukti komitmen atau malah toxic yang berkedok cinta?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t3",
    category: "asmara",
    type: "truth",
    text: "Sebutkan satu kebiasaan pasanganmu yang menurutmu merupakan tanda peringatan atau ketidakcocokan dalam hubungan kalian.",
    isCustom: false,
    text_formal: "Sebutkan satu kebiasaan pasanganmu yang menurutmu merupakan tanda peringatan atau ketidakcocokan dalam hubungan kalian.",
    text_casual: "Spill satu habit terselubung dari pacar lo yang menurut lo itu mengarah ke *red flag* tapi masih lo toleransi.",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t4",
    category: "asmara",
    type: "truth",
    text: "Apa tindakan sederhana yang paling membuatmu merasa dicintai dan dihargai oleh pasanganmu?",
    isCustom: false,
    text_formal: "Apa tindakan sederhana yang paling membuatmu merasa dicintai dan dihargai oleh pasanganmu?",
    text_casual: "Apa *green flag* atau bentuk apresiasi paling *bare minimum* dari pacar yang bisa langsung bikin hati lo meleleh?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t5",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu tipikal orang yang suka memamerkan pasangan secara tersirat di media sosial, atau lebih memilih untuk menyembunyikannya?",
    isCustom: false,
    text_formal: "Apakah kamu tipikal orang yang suka memamerkan pasangan secara tersirat di media sosial, atau lebih memilih untuk menyembunyikannya?",
    text_casual: "Lo tim yang suka *soft-launching* pacar tipis-tipis di IG Story (kayak foto tangan/makanan), atau mending di-private sekalian?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t6",
    category: "asmara",
    type: "truth",
    text: "Pernahkah kamu membandingkan hubungan asmaramu dengan hubungan asmara orang lain yang terlihat sempurna di media sosial?",
    isCustom: false,
    text_formal: "Pernahkah kamu membandingkan hubungan asmaramu dengan hubungan asmara orang lain yang terlihat sempurna di media sosial?",
    text_casual: "Pernah gak lo ngerasa iri atau nge-bandingin hubungan lo sama kemesraan couple fyp TikTok / selebgram?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t7",
    category: "asmara",
    type: "truth",
    text: "Sebutkan perdebatan mengenai hak kewajiban paling konyol yang pernah kamu perdebatkan bersama pasanganmu.",
    isCustom: false,
    text_formal: "Sebutkan perdebatan mengenai hak kewajiban paling konyol yang pernah kamu perdebatkan bersama pasanganmu.",
    text_casual: "Debat soal *bare minimum* atau bagi tagihan kencan (split bill) paling heboh apa yang pernah lo ributin sama doi?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t8",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu pernah berpura-pura menyukai hobi pasanganmu hanya agar dia merasa senang dan dihargai?",
    isCustom: false,
    text_formal: "Apakah kamu pernah berpura-pura menyukai hobi pasanganmu hanya agar dia merasa senang dan dihargai?",
    text_casual: "Pernah gak lo pura-pura suka band atau hobi tertentu demi bisa nyambung pas *deep talk* sama doi?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t9",
    category: "asmara",
    type: "truth",
    text: "Jika diberikan pilihan, apakah kamu memilih pasangan yang sangat tampan atau cantik namun dingin, atau yang biasa saja tetapi humoris?",
    isCustom: false,
    text_formal: "Jika diberikan pilihan, apakah kamu memilih pasangan yang sangat tampan atau cantik namun dingin, atau yang biasa saja tetapi humoris?",
    text_casual: "Mening dapet pacar spek visual unreal tapi cuek abis, atau muka standar tapi seharian bikin ketawa terus?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-t10",
    category: "asmara",
    type: "truth",
    text: "Apa ketakutan terbesar yang selalu kamu cemaskan terkait masa depan hubungan percintaanmu saat ini?",
    isCustom: false,
    text_formal: "Apa ketakutan terbesar yang selalu kamu cemaskan terkait masa depan hubungan percintaanmu saat ini?",
    text_casual: "Ketakutan terbesar apa yang paling sering bikin lo cemas soal kelanjutan hubungan lo sama pacar saat ini?",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d1",
    category: "asmara",
    type: "dare",
    text: "Lakukan tangkapan layar dari sisa saldo dompet digital Anda dan tunjukkan kepada pasangan atau kirimkan ke grup obrolan ini.",
    isCustom: false,
    text_formal: "Lakukan tangkapan layar dari sisa saldo dompet digital Anda dan tunjukkan kepada pasangan atau kirimkan ke grup obrolan ini.",
    text_casual: "Tunjukin screenshot saldo e-wallet (GoPay/ShopeePay) lo saat ini ke grup, buktikan apakah dompet aman atau kritis!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d2",
    category: "asmara",
    type: "dare",
    text: "Kirimkan pesan teks kepada pasanganmu berisi kalimat 'Aku ingin berbicara serius' dan segera matikan sambungan internetmu selama satu menit.",
    isCustom: false,
    text_formal: "Kirimkan pesan teks kepada pasanganmu berisi kalimat 'Aku ingin berbicara serius' dan segera matikan sambungan internetmu selama satu menit.",
    text_casual: "Chat pacar lo: 'Kita perlu ngomong serius deh...' terus langsung matiin paket data/WiFi HP lo selama 2 menit!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d3",
    category: "asmara",
    type: "dare",
    text: "Unggah foto pasanganmu dengan gaya yang paling tidak siap atau lucu ke dalam cerita WhatsApp milikmu sekarang juga.",
    isCustom: false,
    text_formal: "Unggah foto pasanganmu dengan gaya yang paling tidak siap atau lucu ke dalam cerita WhatsApp milikmu sekarang juga.",
    text_casual: "Post foto aib / foto *candid* terkonyol pacar lo ke status WA dengan caption manis romantis sekarang juga!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d4",
    category: "asmara",
    type: "dare",
    text: "Pilihlah salah satu barang bawaanmu yang paling berharga, lalu katakan bahwa kamu akan menghibahkannya kepada teman di sebelah kirimu.",
    isCustom: false,
    text_formal: "Pilihlah salah satu barang bawaanmu yang paling berharga, lalu katakan bahwa kamu akan menghibahkannya kepada teman di sebelah kirimu.",
    text_casual: "Serahin satu barang di tas/saku lo yang berharga ke temen sebelah kiri, bilang itu hadiah tulus seumur hidup.",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d5",
    category: "asmara",
    type: "dare",
    text: "Tunjukkan isi obrolan WhatsApp teratas kamu dengan pasangan kepada seluruh pemain yang hadir hari ini.",
    isCustom: false,
    text_formal: "Tunjukkan isi obrolan WhatsApp teratas kamu dengan pasangan kepada seluruh pemain yang hadir hari ini.",
    text_casual: "Buka chat WA paling atas dari doi/gebetan, bacain 3 chat terakhir mereka dengan lantang dan ekspresif!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d6",
    category: "asmara",
    type: "dare",
    text: "Kirimkan foto selfie wajah jelekmu tanpa filter apa pun kepada pasanganmu saat ini juga.",
    isCustom: false,
    text_formal: "Kirimkan foto selfie wajah jelekmu tanpa filter apa pun kepada pasanganmu saat ini juga.",
    text_casual: "Ambil foto selfie muka jelek lo (double chin max) tanpa filter apa pun, terus kirim ke doi lewat chat sekarang!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d7",
    category: "asmara",
    type: "dare",
    text: "Lakukan tantangan menatap mata pemain di depanmu selama 30 detik tanpa tertawa sambil menirukan ekspresi orang yang sedang merajuk.",
    isCustom: false,
    text_formal: "Lakukan tantangan menatap mata pemain di depanmu selama 30 detik tanpa tertawa sambil menirukan ekspresi orang yang sedang merajuk.",
    text_casual: "Tatap mata temen di depan lo selama 30 detik tanpa ketawa sambil masang muka ngambek paling manja!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d8",
    category: "asmara",
    type: "dare",
    text: "Kirimkan pesan kepada pasanganmu tentang satu kebiasaan burukmu yang belum pernah dia ketahui sebelumnya.",
    isCustom: false,
    text_formal: "Kirimkan pesan kepada pasanganmu tentang satu kebiasaan burukmu yang belum pernah dia ketahui sebelumnya.",
    text_casual: "Chat pacar lo soal satu kebiasaan jorok/aneh lo yang belum dia tahu (misal: jarang mandi pas weekend) lalu liat reaksinya!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d9",
    category: "asmara",
    type: "dare",
    text: "Peragakan kembali dengan gaya berlebihan momen saat kamu dilarang pergi atau diatur secara ketat oleh pasanganmu.",
    isCustom: false,
    text_formal: "Peragakan kembali dengan gaya berlebihan momen saat kamu dilarang pergi atau diatur secara ketat oleh pasanganmu.",
    text_casual: "Peragain secara dramatis pas pacar lo lagi protektif atau ngelarang lo pergi nongkrong sama temen cowok/cewek!",
    subCategory: "pacaran",
    status: "approved"
  },
  {
    id: "asmara-pacaran-d10",
    category: "asmara",
    type: "dare",
    text: "Hubungi kontak terakhir di panggilan masuk ponselmu dan katakan bahwa kamu sangat menyayangi pasanganmu secara mendadak.",
    isCustom: false,
    text_formal: "Hubungi kontak terakhir di panggilan masuk ponselmu dan katakan bahwa kamu sangat menyayangi pasanganmu secara mendadak.",
    text_casual: "Telpon nomor terakhir di log panggilan lo, langsung bilang: 'Gue cuma mau bilang kalau gue sayang banget sama pacar gue!' terus tutup.",
    subCategory: "pacaran",
    status: "approved"
  },

  // ==========================================
  // SUB-CATEGORY: PERNIKAHAN (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "asmara-pernikahan-t1",
    category: "asmara",
    type: "truth",
    text: "Apa kekhawatiran finansial terbesar yang membuatmu ragu atau takut untuk melangkah ke jenjang pernikahan?",
    isCustom: false,
    text_formal: "Apa kekhawatiran finansial terbesar yang membuatmu ragu atau takut untuk melangkah ke jenjang pernikahan?",
    text_casual: "Ketakutan finansial apa yang paling bikin lo ciut pas denger kata 'nikah' di usia muda?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t2",
    category: "asmara",
    type: "truth",
    text: "Bagaimana pandanganmu tentang pembagian penghasilan dalam rumah tangga? Apakah kamu setuju dengan konsep rekening bersama?",
    isCustom: false,
    text_formal: "Bagaimana pandanganmu tentang pembagian penghasilan dalam rumah tangga? Apakah kamu setuju dengan konsep rekening bersama?",
    text_casual: "Gimana menurut lo soal pembagian duit nikah? Lebih milih sistem uang bersama (joint account) atau pegang dompet masing-masing?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t3",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu lebih memprioritaskan pesta pernikahan yang megah untuk estetika media sosial atau tabungan pascapernikahan?",
    isCustom: false,
    text_formal: "Apakah kamu lebih memprioritaskan pesta pernikahan yang megah untuk estetika media sosial atau tabungan pascapernikahan?",
    text_casual: "Mending nikah mewah demi estetika feeds IG (meski ngutang), atau nikah intim di KUA yang penting tabungan aman pascanikah?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t4",
    category: "asmara",
    type: "truth",
    text: "Apa reaksi pertama yang paling kamu cemaskan apabila nanti kamu harus bertemu dan mengobrol intens dengan calon mertuamu?",
    isCustom: false,
    text_formal: "Apa reaksi pertama yang paling kamu cemaskan apabila nanti kamu harus bertemu dan mengobrol intens dengan calon mertuamu?",
    text_casual: "Hal apa yang paling bikin lo ngeri pas ntar pertama kali diajak ngobrol empat mata sama calon mertua (calon mertua)?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t5",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu bersedia berkompromi jika setelah menikah nanti pasanganmu memintamu untuk membatasi pertemanan dengan lawan jenis?",
    isCustom: false,
    text_formal: "Apakah kamu bersedia berkompromi jika setelah menikah nanti pasanganmu memintamu untuk membatasi pertemanan dengan lawan jenis?",
    text_casual: "Setelah nikah ntar, lo oke gak kalau misal pacar nge-batesin lo buat nongkrong bareng temen lawan jenis?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t6",
    category: "asmara",
    type: "truth",
    text: "Di masa depan, apakah kamu lebih memilih tinggal mandiri meski menyewa rumah kecil, atau menumpang bersama orang tua dengan fasilitas lengkap?",
    isCustom: false,
    text_formal: "Di masa depan, apakah kamu lebih memilih tinggal mandiri meski menyewa rumah kecil, atau menumpang bersama orang tua dengan fasilitas lengkap?",
    text_casual: "Mending mandiri ngontrak rumah petak berdua pascanikah, atau numpang di rumah mertua yang mewah tapi serba sungkan?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t7",
    category: "asmara",
    type: "truth",
    text: "Bagaimana opini jujurmu mengenai kontroversi peran ibu rumah tangga vs. wanita karier di era modern saat ini?",
    isCustom: false,
    text_formal: "Bagaimana opini jujurmu mengenai kontroversi peran ibu rumah tangga vs. wanita karier di era modern saat ini?",
    text_casual: "Pilih istri fokus karir (double income) atau fokus jadi IRT urus anak tapi pengeluaran dibatesin gila-gilaan? No debat!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t8",
    category: "asmara",
    type: "truth",
    text: "Apakah kamu percaya bahwa cinta dan kecocokan karakter saja cukup untuk mempertahankan pernikahan selama puluhan tahun?",
    isCustom: false,
    text_formal: "Apakah kamu percaya bahwa cinta dan kecocokan karakter saja cukup untuk mempertahankan pernikahan selama puluhan tahun?",
    text_casual: "Menurut lo, modal cinta sama cocok doang beneran cukup buat mertahanin rumah tangga puluhan tahun biar gak cerai?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t9",
    category: "asmara",
    type: "truth",
    text: "Apa sifat burukmu yang paling kamu khawatirkan akan sulit ditoleransi oleh pasangan hidupmu di bawah satu atap?",
    isCustom: false,
    text_formal: "Apa sifat burukmu yang paling kamu khawatirkan akan sulit ditoleransi oleh pasangan hidupmu di bawah satu atap?",
    text_casual: "Sifat jelek lo yang mana yang paling lo takutin bakal bikin pasangan hidup lo ntar nyesel nikah sama lo?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-t10",
    category: "asmara",
    type: "truth",
    text: "Seberapa penting persetujuan dan restu dari orang tua bagimu sebelum kamu memutuskan untuk menikah dengan seseorang?",
    isCustom: false,
    text_formal: "Seberapa penting persetujuan dan restu dari orang tua bagimu sebelum kamu memutuskan untuk menikah dengan seseorang?",
    text_casual: "Seberapa krusial restu ortu buat lo? Bakal tetep nekat nikah lari gak kalau ortu gak setuju sama sekali?",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d1",
    category: "asmara",
    type: "dare",
    text: "Lakukan simulasi singkat selama 45 detik tentang bagaimana cara kamu meminta restu pernikahan kepada calon mertua fiktif.",
    isCustom: false,
    text_formal: "Lakukan simulasi singkat selama 45 detik tentang bagaimana cara kamu meminta restu pernikahan kepada calon mertua fiktif.",
    text_casual: "Peragain akting 45 detik ngelamar dan izin minta restu ke camer imajiner dengan gaya yang paling sopan tapi gemetaran!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d2",
    category: "asmara",
    type: "dare",
    text: "Carilah gambar konsep gaun pernikahan atau rumah impian di internet dan unggah ke status WhatsApp kamu dengan tulisan 'Semoga lekas terwujud'.",
    isCustom: false,
    text_formal: "Carilah gambar konsep gaun pernikahan atau rumah impian di internet dan unggah ke status WhatsApp kamu dengan tulisan 'Semoga lekas terwujud'.",
    text_casual: "Cari foto dekorasi nikahan impian (Pinterest aesthetic) terus post di status WA dengan caption 'Semoga disegerakan... aamiin'!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d3",
    category: "asmara",
    type: "dare",
    text: "Kirimkan pesan suara kepada ibumu menanyakan berapa anggaran perkiraan mas kawin atau biaya pernikahan yang ideal menurut beliau.",
    isCustom: false,
    text_formal: "Kirimkan pesan suara kepada ibumu menanyakan berapa anggaran perkiraan mas kawin atau biaya pernikahan yang ideal menurut beliau.",
    text_casual: "Kirim VN ke nyokap lo sekarang: 'Mah, menurut Mamah dana nikah minimal biar gak malu-maluin berapa sih?' Tunjukin balesannya!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d4",
    category: "asmara",
    type: "dare",
    text: "Lakukan pijat santai pada pundak atau tangan teman di sebelah kananmu sambil mengeluhkan sulitnya mengumpulkan dana pernikahan.",
    isCustom: false,
    text_formal: "Lakukan pijat santai pada pundak atau tangan teman di sebelah kananmu sambil mengeluhkan sulitnya mengumpulkan dana pernikahan.",
    text_casual: "Pijetin pundak temen sebelah kanan sambil curhat melas soal harga sewa gedung pernikahan yang makin gak masuk akal!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d5",
    category: "asmara",
    type: "dare",
    text: "Tuliskan satu janji pernikahan yang paling lucu namun tulus di secarik kertas atau catatan ponselmu, lalu bacakan dengan khidmat.",
    isCustom: false,
    text_formal: "Tuliskan satu janji pernikahan yang paling lucu namun tulus di secarik kertas atau catatan ponselmu, lalu bacakan dengan khidmat.",
    text_casual: "Bikin janji nikah (wedding vow) terkocak tapi manis di notes HP, terus bacain di depan semua orang sambil pasang muka sakral!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d6",
    category: "asmara",
    type: "dare",
    text: "Pilihlah salah satu lagu bernuansa pernikahan yang romantis, lalu nyanyikan bagian chorusnya dengan gaya menyerupai penyanyi opera.",
    isCustom: false,
    text_formal: "Pilihlah salah satu lagu bernuansa pernikahan yang romantis, lalu nyanyikan bagian chorusnya dengan gaya menyerupai penyanyi opera.",
    text_casual: "Nyanyiin lagu nikahan (contoh: 'Janji Suci' - Yovie & Nuno) pake suara seriosa opera super kenceng selama 20 detik!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d7",
    category: "asmara",
    type: "dare",
    text: "Sebutkan daftar tiga syarat mutlak (deal-breaker) sebelum kamu bersedia menyetujui ajakan pernikahan dari seseorang.",
    isCustom: false,
    text_formal: "Sebutkan daftar tiga syarat mutlak (deal-breaker) sebelum kamu bersedia menyetujui ajakan pernikahan dari seseorang.",
    text_casual: "Sebutin 3 syarat mutlak (non-negotiable) yang harus dipenuhin calon pasangan lo sebelum lo bilang 'I do'!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d8",
    category: "asmara",
    type: "dare",
    text: "Hubungi kerabat dekatmu dan katakan bahwa kamu berencana menikah dalam waktu dekat, lalu dengarkan nasihat paniknya.",
    isCustom: false,
    text_formal: "Hubungi kerabat dekatmu dan katakan bahwa kamu berencana menikah dalam waktu dekat, lalu dengarkan nasihat paniknya.",
    text_casual: "Hubungi saudara/kakak lo, bilang: 'Minta doanya, gue rencana mau nikah bulan depan nih.' dengerin ceramah kepanikan dia!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d9",
    category: "asmara",
    type: "dare",
    text: "Kirimkan emotikon cincin pernikahan (💍) ke salah satu teman lawan jenismu di WhatsApp tanpa kata-kata.",
    isCustom: false,
    text_formal: "Kirimkan emotikon cincin pernikahan (💍) ke salah satu teman lawan jenismu di WhatsApp tanpa kata-kata.",
    text_casual: "Kirim emoji cincin (💍) ke chat WA temen lawan jenis lo sekarang tanpa teks apa pun, terus langsung matikan layar hp!",
    subCategory: "pernikahan",
    status: "approved"
  },
  {
    id: "asmara-pernikahan-d10",
    category: "asmara",
    type: "dare",
    text: "Peragakan ekspresi lucumu saat membayangkan tagihan biaya tak terduga setelah acara resepsi pernikahan selesai diselenggarakan.",
    isCustom: false,
    text_formal: "Peragakan ekspresi lucumu saat membayangkan tagihan biaya tak terduga setelah acara resepsi pernikahan selesai diselenggarakan.",
    text_casual: "Peragain ekspresi muka lo pas ngeliat total tagihan catering, tenda, dan MUA pasca kelar pesta nikahan. Muka harus pingsan!",
    subCategory: "pernikahan",
    status: "approved"
  }
];

function main() {
  console.log('=== LOADING DATABASE TO APPEND 60 NEW ASMARA QUESTIONS ===');
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

  console.log(`Currently there are ${db.questions.length} questions in the database.`);

  // Append new questions, taking care to not add duplicates if script is run multiple times
  let addedCount = 0;
  for (const q of newQuestions) {
    const exists = db.questions.some((existing: any) => existing.id === q.id);
    if (!exists) {
      db.questions.push(q);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    console.log(`Successfully appended ${addedCount} new highly interactive Gen-Z Asmara questions!`);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('Database updated successfully!');
  } else {
    console.log('All 60 questions already exist in the database.');
  }
}

main();
