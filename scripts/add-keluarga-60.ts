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

const rawQuestions = [
  // ==========================================
  // SUB-CATEGORY: ORANG TUA (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "keluarga-orangtua-t1",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Kebohongan terbesar apa yang pernah Anda katakan kepada orang tua agar diizinkan keluar malam?",
    text_casual: "Kebohongan paling epic apa yang pernah lo bohongin ke bokap nyokap biar dapet izin nongkrong sampe malem?"
  },
  {
    id: "keluarga-orangtua-t2",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Apakah Anda pernah merasa kesal karena dibandingkan dengan anak tetangga atau anak teman orang tua Anda?",
    text_casual: "Seberapa kesel sih lo pas dibanding-bandingin sama 'anak tetangga' yang katanya jauh lebih rajin dan sukses?"
  },
  {
    id: "keluarga-orangtua-t3",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Berapa banyak uang saku tambahan yang pernah Anda minta dengan alasan membeli buku pelajaran padahal digunakan untuk kebutuhan lain?",
    text_casual: "Pernah gak lo minta duit tambahan alasan beli buku atau iuran sekolah, padahal aslinya buat nongkrong atau jajan?"
  },
  {
    id: "keluarga-orangtua-t4",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Kapan terakhir kali Anda secara tulus memeluk atau mengungkapkan rasa sayang kepada ayah atau ibu Anda secara langsung?",
    text_casual: "Kapan terakhir kali lo peluk erat ortu atau bilang 'Aku sayang Mama/Papa' secara tulus tanpa embel-embel ada maunya?"
  },
  {
    id: "keluarga-orangtua-t5",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Apakah ada rahasia asmara atau percintaan yang Anda sembunyikan rapat-rapat dari pengetahuan orang tua Anda saat ini?",
    text_casual: "Ada gak gebetan atau cerita pacaran yang lo tutupin rapat-rapat karena takut diinterogasi abis-abisan sama *strict parents* lo?"
  },
  {
    id: "keluarga-orangtua-t6",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Apa aturan rumah yang dibuat oleh orang tua yang menurut Anda paling tidak adil atau terlalu ketat?",
    text_casual: "Apa aturan rumah bikinin ortu yang menurut lo paling gak masuk akal dan bikin lo merasa terkekang banget?"
  },
  {
    id: "keluarga-orangtua-t7",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Pernahkah Anda menyembunyikan nilai ujian yang buruk atau surat teguran dari sekolah agar tidak dimarahi orang tua?",
    text_casual: "Pernah gak lo nyembunyiin nilai ujian jelek atau rapot merah di bawah kasur biar gak kena ceramah kultum ortu?"
  },
  {
    id: "keluarga-orangtua-t8",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Apa perbedaan pendapat terbesar antara Anda dan orang tua yang dipicu oleh perbedaan generasi?",
    text_casual: "Hal apa dari dunia Gen-Z yang paling sering memicu perdebatan sengit akibat *generation gap* sama bokap nyokap lo?"
  },
  {
    id: "keluarga-orangtua-t9",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Barang tidak berguna termahal apa yang pernah Anda beli menggunakan uang pemberian orang tua secara diam-diam?",
    text_casual: "Barang gak guna termahal apa yang pernah lo beli pake duit ortu diem-diem, terus lo nyesel sendiri pas tahu fungsinya?"
  },
  {
    id: "keluarga-orangtua-t10",
    type: "truth",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Ceritakan momen paling menegangkan ketika Anda ketahuan melanggar jam malam dan harus menghadapi interogasi orang tua.",
    text_casual: "Spill momen paling jantungan pas lo ketahuan pulang lewat jam malam dan ortu lo udah nungguin di depan pintu sambil melotot!"
  },
  {
    id: "keluarga-orangtua-d1",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Kirimkan pesan suara pendek kepada ibu atau ayah Anda yang berisi kalimat apresiasi hangat dan ucapan terima kasih tulus.",
    text_casual: "Kirim VN ke nyokap/bokap bilang: 'Ma/Pa, makasih ya udah sabar mendidik aku selama ini.' dengan intonasi se-sweet mungkin!"
  },
  {
    id: "keluarga-orangtua-d2",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Gunakan aplikasi perpesanan untuk meminta tambahan uang saku dengan menyertakan alasan yang sangat jenaka dan kreatif.",
    text_casual: "Chat bokap atau nyokap lo minta tambahan uang jajan H-15 bulanan dengan alasan super kreatif nan kocak!"
  },
  {
    id: "keluarga-orangtua-d3",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Tirukan gaya orang tua Anda saat sedang mengomeli atau menasihati Anda tentang kebiasaan terlalu lama bermain ponsel.",
    text_casual: "Tiruin gaya bokap/nyokap pas lagi ngoceh perkara lo main HP terus seharian. Harus lengkap dengan gesture tangannya!"
  },
  {
    id: "keluarga-orangtua-d4",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Kirimkan swafoto dengan ekspresi wajah paling lucu kepada salah satu orang tua Anda saat ini juga tanpa penjelasan tambahan.",
    text_casual: "Kirim selfie muka jelek/kocak lo ke WA nyokap atau bokap sekarang juga tanpa teks apa-apa, lalu biarkan mereka bingung."
  },
  {
    id: "keluarga-orangtua-d5",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Kirimkan pesan suara bernada romantis dan penuh kehangatan yang ditujukan khusus untuk kedua orang tua Anda.",
    text_casual: "VN ortu lo bilang 'Aku bersyukur banget punya orang tua terhebat kayak kalian' tanpa ketawa atau grogi!"
  },
  {
    id: "keluarga-orangtua-d6",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Kirimkan pesan singkat ke orang tua Anda yang menerangkan bahwa Anda akan memasak sarapan spesial untuk mereka esok pagi.",
    text_casual: "Chat ortu lo bilang: 'Besok pagi jangan masak ya, aku yang bakal masakin sarapan spesial buat Mama & Papa.'!"
  },
  {
    id: "keluarga-orangtua-d7",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Tunjukkan riwayat pesanan makanan atau belanja daring terakhir Anda yang dibiayai menggunakan uang orang tua Anda.",
    text_casual: "Buka riwayat e-wallet atau e-commerce, spill belanjaan terakhir lo yang sebenarnya dibayarin pake duit bulanan ortu!"
  },
  {
    id: "keluarga-orangtua-d8",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Peragakan kembali adegan ketika Anda pertama kali ketahuan melakukan kesalahan fatal di depan orang tua Anda dengan gaya dramatis.",
    text_casual: "Akting ulang momen paling panik sedunia pas kelakuan bandel lo kepergok langsung sama ortu di rumah!"
  },
  {
    id: "keluarga-orangtua-d9",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Tunjukkan kepada seluruh pemain daftar aplikasi di ponsel Anda yang sengaja dipasang kunci proteksi agar tidak dilihat orang tua.",
    text_casual: "Tunjukin folder/aplikasi di HP lo yang lo kasih password ekstra biar chat atau galeri lo gak bisa diintip ortu!"
  },
  {
    id: "keluarga-orangtua-d10",
    type: "dare",
    category: "keluarga",
    subCategory: "ortu-anak",
    text_formal: "Buatlah pengakuan tulus mengenai satu kesalahan kecil yang pernah Anda sembunyikan dari orang tua Anda hingga hari ini.",
    text_casual: "Bikin pengakuan jujur ke temen-temen soal satu kenakalan remaja lo yang sampe detik ini ortu lo gak pernah tahu."
  },

  // ==========================================
  // SUB-CATEGORY: KAKAK ADIK (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "keluarga-kakakadik-t1",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Pernahkah Anda mengambil atau meminjam pakaian saudara kandung Anda tanpa meminta izin terlebih dahulu?",
    text_casual: "Jujur, seberapa sering lo comot baju, hoodie, atau skincare punya kakak/adik lo diem-diem tanpa izin?"
  },
  {
    id: "keluarga-kakakadik-t2",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Siapakah di antara Anda dan saudara kandung yang menurut Anda merupakan anak emas atau anak kesayangan orang tua?",
    text_casual: "Gak pake sensor, siapa sih anak kesayangan kasta tertinggi yang dapet predikat 'anak emas' dari bokap nyokap lo?"
  },
  {
    id: "keluarga-kakakadik-t3",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Pernahkah Anda melaporkan kesalahan saudara kandung kepada orang tua demi menghindarkan diri Anda dari hukuman?",
    text_casual: "Pernah gak lo jadi cepu murahan dengan ngelaporin kelakuan nakal saudara lo biar lo slamet dari murka ortu?"
  },
  {
    id: "keluarga-kakakadik-t4",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Apa bentuk perkelahian paling parah atau pertengkaran fisik terdahsyat yang pernah terjadi antara Anda dan saudara kandung?",
    text_casual: "Apa momen berantem paling brutal, banting pintu, atau perang bantal terdahsyat yang pernah lo alamin bareng saudara kandung?"
  },
  {
    id: "keluarga-kakakadik-t5",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Apakah Anda pernah merasa sangat cemburu atau iri terhadap pencapaian akademis maupun karier saudara kandung Anda?",
    text_casual: "Pernah gak lo ngerasa insecure atau cemburu berat pas ngeliat prestasi atau kelebihan saudara kandung lo sendiri?"
  },
  {
    id: "keluarga-kakakadik-t6",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Informasi rahasia atau memalukan apa milik kakak atau adik Anda yang hingga kini Anda simpan rapat-rapat?",
    text_casual: "Rahasia memalukan atau aib apa punya saudara kandung lo yang lo pegang sebagai kartu as buat ngancem mereka?"
  },
  {
    id: "keluarga-kakakadik-t7",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Apakah ada momen di mana Anda menggosipkan perilaku orang tua Anda bersama saudara kandung secara rahasia?",
    text_casual: "Seberapa sering lo nge-gosip kompak bareng saudara lo buat ngomongin habit unik atau omelan aneh dari bokap nyokap?"
  },
  {
    id: "keluarga-kakakadik-t8",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Kebohongan krusial apa yang pernah Anda dan saudara kandung sepakati bersama demi menutupi kesalahan dari orang tua?",
    text_casual: "Kenakalan apa yang lo sama saudara lo tutup-tutupin bareng biar gak auto dicoret dari KK sama ortu?"
  },
  {
    id: "keluarga-kakakadik-t9",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Apa julukan nama kontak paling konyol atau mengejek yang Anda gunakan untuk menyimpan nomor telepon saudara Anda?",
    text_casual: "Apa sih nama kontak saudara lo di HP? Kasih tahu seberapa absurd atau mengejeknya julukan itu!"
  },
  {
    id: "keluarga-kakakadik-t10",
    type: "truth",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Pernahkah Anda sengaja mengabaikan pesan instan saudara kandung Anda saat dia sedang membutuhkan bantuan urgen?",
    text_casual: "Pernah gak lo sengaja nge-read doang chat saudara lo pas dia minta jemput atau bantuin beres-beres rumah karena lo mager?"
  },
  {
    id: "keluarga-kakakadik-d1",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Kirimkan pesan singkat kepada kakak atau adik Anda yang isinya menyatakan keinginan meminjam uang dengan alasan yang tidak masuk akal.",
    text_casual: "Chat saudara lo sekarang juga pura-pura mau pinjam duit 50 ribu buat beli cilok estetik penenang jiwa!"
  },
  {
    id: "keluarga-kakakadik-d2",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Tunjukkan tangkapan layar percakapan terakhir Anda dengan kakak atau adik yang memperlihatkan kebiasaan obrolan kalian.",
    text_casual: "Spill screenshot chat terakhir lo bareng saudara kandung. Kita mau liat seberapa dingin atau random-nya interaksi kalian!"
  },
  {
    id: "keluarga-kakakadik-d3",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Hubungi saudara kandung Anda dan ceritakan satu lelucon garing lalu tahan tawa Anda demi menunggu reaksinya.",
    text_casual: "Telpon saudara lo sekarang, kasih jokes bapak-bapak paling garing terus diem nungguin reaksi dingin dia!"
  },
  {
    id: "keluarga-kakakadik-d4",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Tirukan kembali ekspresi menangis penuh drama saudara kandung Anda saat waktu kecil ketika sedang merajuk agar dibelikan mainan.",
    text_casual: "Tiruin akting nangis manja saudara lo waktu kecil pas lagi ngerengek minta jajan. Harus lebay dan dramatis!"
  },
  {
    id: "keluarga-kakakadik-d5",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Kirimkan stiker dengan ekspresi aneh atau lucu ke saudara kandung Anda lewat aplikasi perpesanan tanpa memberikan keterangan apa pun.",
    text_casual: "Kirim sticker komuk paling absurd ke chat saudara lo sekarang tanpa teks apa pun, lalu abaikan balesannya."
  },
  {
    id: "keluarga-kakakadik-d6",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Katakan dengan suara lantang bahwa saudara kandung Anda adalah sosok terbaik yang pernah dikaruniakan dalam hidup Anda.",
    text_casual: "Teriak lantang di ruangan: '[Nama Saudara] lo emang saudara terbaik gue sedunia!' terus rekam suara kirim ke dia!"
  },
  {
    id: "keluarga-kakakadik-d7",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Peragakan cara berjalan unik atau gestur tubuh khas dari kakak atau adik Anda sehari-hari saat sedang terburu-buru.",
    text_casual: "Peragain gaya jalan atau gesture saudara lo pas lagi panik telat kuliah atau kerja. Harus dapet banget karakternya!"
  },
  {
    id: "keluarga-kakakadik-d8",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Kirimkan pesan ke kakak atau adik Anda berisi kalimat: 'Terima kasih ya sudah lahir ke bumi ini, meskipun terkadang menyebalkan.'",
    text_casual: "Chat saudara lo: 'Makasih ya udah lahir di dunia ini nemenin gue, meskipun kerjaan lo bikin emosi mulu.'!"
  },
  {
    id: "keluarga-kakakadik-d9",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Gantilah gambar profil kontak saudara kandung di ponsel Anda menggunakan swafoto paling tidak estetik miliknya saat ini juga.",
    text_casual: "Ganti foto kontak saudara lo di HP pake foto aib dia yang paling burik sekarang juga!"
  },
  {
    id: "keluarga-kakakadik-d10",
    type: "dare",
    category: "keluarga",
    subCategory: "saudara",
    text_formal: "Ambil satu barang terdekat Anda lalu laksanakan monolog singkat bercakap-cakap dengan barang tersebut seolah-olah barang itu adalah saudara Anda.",
    text_casual: "Pegang benda random di deket lo, ajak ngobrol benda itu seolah-olah dia adalah saudara kandung lo yang lagi ngerebut remote TV!"
  },

  // ==========================================
  // SUB-CATEGORY: KELUARGA BESAR (10 Truths, 10 Dares)
  // ==========================================
  {
    id: "keluarga-keluargabesar-t1",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Pertanyaan dari paman atau bibi saat acara kumpul keluarga apa yang paling sering membuat Anda ingin segera pergi dari tempat tersebut?",
    text_casual: "Pertanyaan basa-basi dari om/tante pas Lebaran yang paling bikin lo pengen pura-pura pingsan di tempat? (Misal: Kapan nikah?)"
  },
  {
    id: "keluarga-keluargabesar-t2",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Apakah Anda pernah sengaja keluar atau mengheningkan selamanya notifikasi grup percakapan WhatsApp keluarga besar karena dirasa terlalu bising?",
    text_casual: "Jujur, seberapa sering lo mute selamanya grup WA Keluarga Besar gara-gara isinya broadcast hoax atau wejangan berantai?"
  },
  {
    id: "keluarga-keluargabesar-t3",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Alasan paling fiktif dan tidak berdasar apa yang pernah Anda buat demi menghindari kewajiban menghadiri acara kumpul keluarga besar?",
    text_casual: "Alasan bohong paling ngadi-ngadi apa yang lo pake buat mangkir dari acara arisan keluarga besar?"
  },
  {
    id: "keluarga-keluargabesar-t4",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Siapa sepupu kekerabatan Anda yang paling sering Anda ajak bersekongkol guna membicarakan tingkah unik kerabat senior lain?",
    text_casual: "Siapa rekan sepupuan lo yang paling sefrekuensi buat diajak gosip miring mojok pas acara arisan keluarga?"
  },
  {
    id: "keluarga-keluargabesar-t5",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Kapan terakhir kali Anda kecewa karena mengharapkan pembagian amplop hari raya tetapi ternyata hanya mendapatkan janji kosong?",
    text_casual: "Pernah gak lo udah masang muka manis berharap dapet amplop THR tebel dari om tajir, eh ternyata cuma dapet senyuman tulus?"
  },
  {
    id: "keluarga-keluargabesar-t6",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Pernahkah Anda secara diam-diam menaruh kekaguman atau rasa cinta monyet masa kecil kepada salah satu sepupu jauh Anda?",
    text_casual: "Jujur pas masih bocah banget dulu, pernah gak lo ngerasa naksir monyet atau kagum sama sepupu jauh sendiri?"
  },
  {
    id: "keluarga-keluargabesar-t7",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Siapakah paman atau bibi di keluarga besar Anda yang dinilai paling gemar memamerkan pencapaian serta kekayaan keluarganya saat berkumpul?",
    text_casual: "Siapa paman atau tante lo yang paling menonjol hobi pamer pencapaian anaknya pas kumpul keluarga?"
  },
  {
    id: "keluarga-keluargabesar-t8",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Pernahkah Anda memaksakan tawa palsu demi menghargai lelucon humor paman Anda yang sebenarnya tidak lucu atau garing?",
    text_casual: "Pernah gak lo ketawa maksa ampe rahang kaku demi nge-hype jokes bapak-bapak paman lo padahal kriuk garing abis?"
  },
  {
    id: "keluarga-keluargabesar-t9",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Sebutkan satu nasihat mengenai karier atau hubungan asmara paling absurd yang pernah diberikan oleh anggota pilar senior keluarga besar Anda.",
    text_casual: "Apa nasihat tentang masa depan ato percintaan paling gak nyambung yang pernah lo dapet dari kerabat jauh?"
  },
  {
    id: "keluarga-keluargabesar-t10",
    type: "truth",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Ceritakan momen paling canggung ketika Anda terjebak sendirian di pojokan ruangan tanpa topik pembicaraan saat perhelatan arisan keluarga.",
    text_casual: "Spill momen paling *antisosial* pas lo mojok sendirian clingak-clinguk pura-pura sibuk main HP di tengah keriuhan kumpul keluarga!"
  },
  {
    id: "keluarga-keluargabesar-d1",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Teruskan satu kiriman gambar ucapan berformat bapak-bapak atau ibu-ibu yang sangat usang ke dalam grup percakapan WhatsApp keluarga besar.",
    text_casual: "Kirim gambar meme ucapan 'Selamat Pagi, Semangat Menjemput Rezeki 🌹' khas bapak-bapak ke grup WA keluarga lo!"
  },
  {
    id: "keluarga-keluargabesar-d2",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Kirimkan pesan ke sepupu terdekat Anda berisi pertanyaan candaan tentang gosip terbaru dari paman atau bibi Anda.",
    text_casual: "Chat sepupu terdekat lo sekarang: 'Eh spill gosip tante [X] dong, masak tadi update status aneh banget di FB'!"
  },
  {
    id: "keluarga-keluargabesar-d3",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Tirukan intonasi suara serta ekspresi khas bibi Anda saat menanyakan pertanyaan interogatif 'Kapan merencanakan pernikahan?'.",
    text_casual: "Tiruin gaya tante lo pas nge-roasting nanya 'Kapan lulus kuliah?' atau 'Kapan bawa pacar ke rumah?' pake nada nyindir halus!"
  },
  {
    id: "keluarga-keluargabesar-d4",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Bagikan kepada seluruh pemain gambar tangkapan layar paling absurd atau unik dari galeri media grup WhatsApp keluarga besar Anda.",
    text_casual: "Tunjukin satu foto/meme/video paling absurd dari grup WA keluarga besar lo yang ada di galeri hp lo saat ini!"
  },
  {
    id: "keluarga-keluargabesar-d5",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Kirimkan pesan suara ramah ke sepupu Anda berisi ajakan untuk segera merencanakan agenda bergosip seru pada pertemuan keluarga berikutnya.",
    text_casual: "VN sepupu kesayangan lo: 'Kumpul besok kita mojok gosip lagi ya, capek dengerin tante pamer mulu.'!"
  },
  {
    id: "keluarga-keluargabesar-d6",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Peragakan gerakan salam bersalaman resmi yang sangat patuh dan khidmat khas cara menghormati keluarga pilar senior paman bibi.",
    text_casual: "Peragain gaya salim super santun, bungkuk 90 derajat, cium tangan bolak-balik pas ketemu paman/tante terhormat!"
  },
  {
    id: "keluarga-keluargabesar-d7",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Ambil pose ekspresi tertekan saat diberondong pertanyaan oleh sepuluh bibi dalam suatu waktu di acara arisan keluarga.",
    text_casual: "Pose muka se-depresi mungkin kayak lagi dikepung puluhan tante-tante kepo yang nuntut lo cepet dapet kerjaan!"
  },
  {
    id: "keluarga-keluargabesar-d8",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Kirimkan pesan suara ke grup keluarga berisi salam pembuka penuh semangat pagi dengan nada ceria layaknya pembicara motivasi.",
    text_casual: "Kirim VN ucapan 'Semangat pagi semuanya! Jaga kesehatan ya!' di grup WA keluarga pake suara senerjik motivator handal."
  },
  {
    id: "keluarga-keluargabesar-d9",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Tuliskan pembaruan status di WhatsApp Anda berupa kalimat kutipan mutiara bertema kekeluargaan yang sangat puitis dan dramatis saat ini juga.",
    text_casual: "Post status WA berupa kalimat mutiara super-dramatis bertema 'Keluarga Adalah Segalanya' pake background bunga-bunga!"
  },
  {
    id: "keluarga-keluargabesar-d10",
    type: "dare",
    category: "keluarga",
    subCategory: "keluarga-besar",
    text_formal: "Lakukan pembacaan dramatis penuh penghayatan atas pesan teks panjang terakhir yang dikirimkan oleh paman atau bibi Anda di grup keluarga.",
    text_casual: "Bacain chat wejangan terakhir dari om atau tante lo di grup WA pake intonasi puisi dramatis penuh emosi kejujuran!"
  }
];

function main() {
  console.log('=== LOADING DATABASE TO APPEND 60 NEW KELUARGA QUESTIONS ===');
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

  const formattedQuestions: Question[] = rawQuestions.map(q => ({
    id: q.id,
    category: q.category,
    type: q.type as 'truth' | 'dare',
    text: q.text_formal, // Use text_formal as default text fallback
    isCustom: false,
    text_formal: q.text_formal,
    text_casual: q.text_casual,
    subCategory: q.subCategory,
    status: "approved"
  }));

  // Append new questions safely
  let addedCount = 0;
  for (const q of formattedQuestions) {
    const exists = db.questions.some((existing: any) => existing.id === q.id);
    if (!exists) {
      db.questions.push(q);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    console.log(`Successfully appended ${addedCount} new highly interactive Gen-Z Keluarga questions!`);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('Database updated successfully!');
  } else {
    console.log('All 60 questions already exist in the database.');
  }
}

main();
