import mongoose from "mongoose";
import dotenv from "dotenv";
import Address from "./src/models/Address.js";

dotenv.config();

const addressData = [
  // --- BARISHAL DIVISION ---
  { division: "Barishal", district: "Barguna", upazilas: ["Amtali", "Barguna Sadar", "Betagi", "Bamna", "Patharghata", "Taltali"] },
  { division: "Barishal", district: "Barishal", upazilas: ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Barishal Sadar", "Mehendiganj", "Muladi", "Wazirpur"] },
  { division: "Barishal", district: "Bhola", upazilas: ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"] },
  { division: "Barishal", district: "Jhalokathi", upazilas: ["Jhalokathi Sadar", "Kathalia", "Nalchity", "Rajapur"] },
  { division: "Barishal", district: "Patuakhali", upazilas: ["Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali", "Dumki"] },
  { division: "Barishal", district: "Pirojpur", upazilas: ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Pirojpur Sadar", "Nesarabad", "Zianagar"] },

  // --- CHATTOGRAM DIVISION ---
  { division: "Chattogram", district: "Bandarban", upazilas: ["Ali Kadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"] },
  { division: "Chattogram", district: "Brahmanbaria", upazilas: ["Akhaura", "Bancharampur", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Ashuganj", "Bijoynagar"] },
  { division: "Chattogram", district: "Chandpur", upazilas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab North", "Matlab South", "Shahrasti"] },
  { division: "Chattogram", district: "Chattogram", upazilas: ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda", "Karnaphuli"] },
  { division: "Chattogram", district: "Cox's Bazar", upazilas: ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua"] },
  { division: "Chattogram", district: "Cumilla", upazilas: ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Cumilla Sadar", "Meghna", "Titas", "Monohargonj", "Cumilla Sadar South"] },
  { division: "Chattogram", district: "Feni", upazilas: ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Parshuram", "Sonagazi", "Fulgazi"] },
  { division: "Chattogram", district: "Khagrachhari", upazilas: ["Dighinala", "Khagrachhari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"] },
  { division: "Chattogram", district: "Lakshmipur", upazilas: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"] },
  { division: "Chattogram", district: "Noakhali", upazilas: ["Begumganj", "Noakhali Sadar", "Chatkhil", "Companyganj", "Hatiya", "Senbagh", "Subarnachar", "Sonaimuri", "Kabirhat"] },
  { division: "Chattogram", district: "Rangamati", upazilas: ["Baghaichhari", "Barkal", "Kawkhali", "Belaichhari", "Kaptai", "Juraichhari", "Langadu", "Nanighar", "Rajasthali", "Rangamati Sadar"] },

  // --- DHAKA DIVISION ---
  { division: "Dhaka", district: "Dhaka", upazilas: ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar"] },
  { division: "Dhaka", district: "Faridpur", upazilas: ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"] },
  { division: "Dhaka", district: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"] },
  { division: "Dhaka", district: "Gopalganj", upazilas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"] },
  { division: "Dhaka", district: "Kishoreganj", upazilas: ["Itna", "Katiadi", "Bhairab", "Tarail", "Hossainpur", "Pakundia", "Kuliarchar", "Kishoreganj Sadar", "Karimganj", "Bajitpur", "Austagram", "Mithamain", "Nikli"] },
  { division: "Dhaka", district: "Madaripur", upazilas: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"] },
  { division: "Dhaka", district: "Manikganj", upazilas: ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shibalaya", "Singair"] },
  { division: "Dhaka", district: "Munshiganj", upazilas: ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"] },
  { division: "Dhaka", district: "Narayanganj", upazilas: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"] },
  { division: "Dhaka", district: "Narsingdi", upazilas: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"] },
  { division: "Dhaka", district: "Rajbari", upazilas: ["Baliakandi", "Goalandaghat", "Pangsha", "Rajbari Sadar", "Kalukhali"] },
  { division: "Dhaka", district: "Shariatpur", upazilas: ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira"] },
  { division: "Dhaka", district: "Tangail", upazilas: ["Gopalpur", "Basail", "Bhuapur", "Delduar", "Ghatail", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar", "Dhanbari"] },

  // --- KHULNA DIVISION ---
  { division: "Khulna", district: "Bagerhat", upazilas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"] },
  { division: "Khulna", district: "Chuadanga", upazilas: ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"] },
  { division: "Khulna", district: "Jashore", upazilas: ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jashore Sadar", "Manirampur", "Sharsha"] },
  { division: "Khulna", district: "Jhenaidah", upazilas: ["Harinakundu", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"] },
  { division: "Khulna", district: "Khulna", upazilas: ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Khulna Sadar", "Paikgachha", "Phultala", "Rupsha", "Terokhada"] },
  { division: "Khulna", district: "Kushtia", upazilas: ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"] },
  { division: "Khulna", district: "Magura", upazilas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"] },
  { division: "Khulna", district: "Meherpur", upazilas: ["Gangni", "Meherpur Sadar", "Mujibnagar"] },
  { division: "Khulna", district: "Narail", upazilas: ["Lohagara", "Narail Sadar", "Kalia"] },
  { division: "Khulna", district: "Satkhira", upazilas: ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"] },

  // --- MYMENSINGH DIVISION ---
  { division: "Mymensingh", district: "Jamalpur", upazilas: ["Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"] },
  { division: "Mymensingh", district: "Mymensingh", upazilas: ["Trishal", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Mymensingh Sadar", "Muktagachha", "Nandail", "Phulpur", "Bhaluka", "Tara Khanda"] },
  { division: "Mymensingh", district: "Netrokona", upazilas: ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"] },
  { division: "Mymensingh", district: "Sherpur", upazilas: ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"] },

  // --- RAJSHAHI DIVISION ---
  { division: "Rajshahi", district: "Bogura", upazilas: ["Adamdighi", "Bogura Sadar", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Sherpur", "Shibganj", "Sonatala", "Shajahanpur"] },
  { division: "Rajshahi", district: "Joypurhat", upazilas: ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"] },
  { division: "Rajshahi", district: "Naogaon", upazilas: ["Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"] },
  { division: "Rajshahi", district: "Natore", upazilas: ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra", "Naldanga"] },
  { division: "Rajshahi", district: "Chapai Nawabganj", upazilas: ["Bholahat", "Gomastapur", "Nachole", "Chapai Nawabganj Sadar", "Shibganj"] },
  { division: "Rajshahi", district: "Pabna", upazilas: ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"] },
  { division: "Rajshahi", district: "Rajshahi", upazilas: ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"] },
  { division: "Rajshahi", district: "Sirajganj", upazilas: ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"] },

  // --- RANGPUR DIVISION ---
  { division: "Rangpur", district: "Dinajpur", upazilas: ["Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Dinajpur Sadar", "Nawabganj", "Parbatipur"] },
  { division: "Rangpur", district: "Gaibandha", upazilas: ["Phulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"] },
  { division: "Rangpur", district: "Kurigram", upazilas: ["Bhurungamari", "Chilmari", "Phulbari", "Kurigram Sadar", "Nageshwari", "Rajarhat", "Raumari", "Ulipur", "Char Rajibpur"] },
  { division: "Rangpur", district: "Lalmonirhat", upazilas: ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"] },
  { division: "Rangpur", district: "Nilphamari", upazilas: ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"] },
  { division: "Rangpur", district: "Panchagarh", upazilas: ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"] },
  { division: "Rangpur", district: "Rangpur", upazilas: ["Badarganj", "Gangachara", "Kaunia", "Rangpur Sadar", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"] },
  { division: "Rangpur", district: "Thakurgaon", upazilas: ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"] },

  // --- SYLHET DIVISION ---
  { division: "Sylhet", district: "Habiganj", upazilas: ["Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj", "Sayestaganj"] },
  { division: "Sylhet", district: "Moulvibazar", upazilas: ["Barlekha", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal", "Juri"] },
  { division: "Sylhet", district: "Sunamganj", upazilas: ["Bishwamvapur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sulla", "Sunamganj Sadar", "Tahirpur", "Dakshin Sunamganj"] },
  { division: "Sylhet", district: "Sylhet", upazilas: ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj", "Dakshin Surma", "Osmani Nagar"] }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB... 🚀");
    
    await Address.deleteMany({}); 
    await Address.insertMany(addressData);
    
    console.log("Success: All 64 Districts and 495 Upazilas Seeded! ✅");
    process.exit();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

seedDB();