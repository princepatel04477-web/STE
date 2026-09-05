/**
 * The guest list, taken from the master sheet (STE_data_sheet.xlsx).
 *
 * One row per exhibitor. A firm that gave the organisers more than one number,
 * or that logged into the portal on a second number before the list was closed,
 * keeps a single row: the extra numbers go in `aliases` so both log in as the
 * same exhibitor and the admin panel counts the firm once.
 */
export interface RegisteredExhibitor {
  /** The number the master sheet gives, or a portal ID where it gives none. */
  mobile: string;
  brandName: string;
  stallSqft: string;
  category?: string;
  market?: string;
  /** Other numbers the same firm is known by. */
  aliases?: string[];
}

export const REGISTERED_EXHIBITORS_LIST: RegisteredExhibitor[] = [
  { mobile: "9106139666", brandName: "Varunya Admin Demo", stallSqft: "400 sq ft", category: "Demo", market: "Organizer" },
  { mobile: "9950787787", brandName: "AKAS Organizer Main", stallSqft: "1000 sq ft", category: "Organizer", market: "Organizer" },
  { mobile: "9712327649", brandName: "STE Organiser Admin", stallSqft: "", category: "Organizer", market: "Organizer" },
  { mobile: "9824886668", brandName: "Aalingan Art / Nidhanam", stallSqft: "200 sq ft", category: "Saree", market: "M1" },
  { mobile: "9274669399", brandName: "Aashirwad Creation  (Aahira)", stallSqft: "100 sq ft", category: "Men's Wear / Ethnic Fabric", market: "RRTM" },
  { mobile: "9979940730", brandName: "Abhaar Vastram", stallSqft: "400 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9824131004", brandName: "Abhilasha Enterprises", stallSqft: "100 sq ft", category: "Home Furnishing", market: "" },
  { mobile: "9506455565", brandName: "Abhiraj Fashion", stallSqft: "200 sq ft", category: "Sarees", market: "Ekta Textile Market" },
  { mobile: "9429222300", brandName: "Abhivadan Fashion", stallSqft: "1000 sq ft", category: "Saree , Lehengha", market: "Hitech Crest" },
  { mobile: "9879861191", brandName: "Akashleela", stallSqft: "600 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "8469000011", brandName: "Alok Suit", stallSqft: "400 sq ft", category: "Suit", market: "Gistic Park" },
  { mobile: "9374498302", brandName: "Alokraj Fashion", stallSqft: "100 sq ft", category: "Saree", market: "M2" },
  { mobile: "8980018801", brandName: "Amaya", stallSqft: "100 sq ft", category: "Lehanga", market: "INTL Textile Hub", aliases: ["8980018808"] },
  { mobile: "9898016566", brandName: "Amipara Sarees", stallSqft: "100 sq ft", category: "Sarees", market: "Abhinandan" },
  { mobile: "9265618713", brandName: "Amyraa Trends / Pagaria Fashion", stallSqft: "200 sq ft", category: "Saree", market: "Globale" },
  { mobile: "9998023918", brandName: "Anaya Designer", stallSqft: "800 sq ft", category: "Saree", market: "" },
  { mobile: "9726603807", brandName: "Anjali Creation", stallSqft: "300 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9825398582", brandName: "Apple lifestyle", stallSqft: "600 sq ft", category: "Sarees", market: "Aashirwad Market" },
  { mobile: "9725147177", brandName: "Ashirwad Textiles", stallSqft: "100 sq ft", category: "Fabrics", market: "" },
  { mobile: "9825231170", brandName: "Bahubali", stallSqft: "600 sq ft", category: "Sarees", market: "Kohinoor Textile Market" },
  { mobile: "9377609280", brandName: "Bansi Sarees", stallSqft: "1000 sq ft", category: "Uniform Saree", market: "Gurukrupa" },
  { mobile: "9377855666", brandName: "Bhagvad Fabrics", stallSqft: "100 sq ft", category: "Fabrics", market: "" },
  { mobile: "9825156704", brandName: "Bharti Sarees", stallSqft: "400 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9377418152", brandName: "Chandwani Silk Mills", stallSqft: "200 sq ft", category: "Saree", market: "M1" },
  { mobile: "9408990045", brandName: "Charchita Designer", stallSqft: "200 sq ft", category: "Saree", market: "M1" },
  { mobile: "7878279828", brandName: "Dev Mata Creation", stallSqft: "100 sq ft", category: "Rajputi Poshak", market: "RKTM" },
  { mobile: "9375793060", brandName: "Dhanlaxmi Silk Mills", stallSqft: "100 sq ft", category: "Sarees", market: "JJ Market" },
  { mobile: "9879360089", brandName: "Dharam Art (S)", stallSqft: "400 sq ft", category: "Dress Matterial, Kurtie", market: "Globale" },
  { mobile: "9974125112", brandName: "Dinesh Textile (D.T)", stallSqft: "300 sq ft", category: "Sarees", market: "M2" },
  { mobile: "9909789088", brandName: "Divine Silk Mills", stallSqft: "200 sq ft", category: "Sarees", market: "Shree Kuberji Textile Park" },
  { mobile: "8200203732", brandName: "Dream Delta", stallSqft: "100 sq ft", category: "Books", market: "" },
  { mobile: "7016067015", brandName: "Dream Home Fab", stallSqft: "200 sq ft", category: "Fabrics", market: "" },
  { mobile: "9978889174", brandName: "Durga Textiles / Durga Silk Mills", stallSqft: "200 sq ft", category: "Sarees", market: "RKTM, New Lucky", aliases: ["7405045216"] },
  { mobile: "9820935033", brandName: "Earth Fabrics", stallSqft: "600 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9979883010", brandName: "Etallica", stallSqft: "200 sq ft", category: "Fabrics", market: "M D Landmark" },
  { mobile: "9712366161", brandName: "Ethnico by Laxmi", stallSqft: "800 sq ft", category: "Men's Wear", market: "Ved Road" },
  { mobile: "8980835552", brandName: "Ganesh Fashion", stallSqft: "200 sq ft", category: "Sarees", market: "" },
  { mobile: "9375022000", brandName: "Ganga Sarees", stallSqft: "100 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "6357238663", brandName: "Garden Vareli", stallSqft: "200 sq ft", category: "Sarees / Dress Material", market: "" },
  { mobile: "9601700354", brandName: "Gauri Ganesh", stallSqft: "200 sq ft", category: "Sarees", market: "429 A M2" },
  { mobile: "9586899777", brandName: "Gauri Putra", stallSqft: "400 sq ft", category: "Lehanga", market: "M1" },
  { mobile: "9879688431", brandName: "Geeta Tex (Ambika)", stallSqft: "1000 sq ft", category: "Suit", market: "Kuberji Houses" },
  { mobile: "9638338014", brandName: "Glorry Creation", stallSqft: "200 sq ft", category: "Kurtis", market: "Surana 101" },
  { mobile: "9909648249", brandName: "Hanumanta Lehanga", stallSqft: "600 sq ft", category: "Lehanga", market: "De Ventura" },
  { mobile: "9586746162", brandName: "Hariom Trendz", stallSqft: "100 sq ft", category: "Saree", market: "" },
  { mobile: "8866666650", brandName: "Heirlooms", stallSqft: "600 sq ft", category: "Saree", market: "M1", aliases: ["9904566650"] },
  { mobile: "9824150667", brandName: "Inder silk mills", stallSqft: "200 sq ft", category: "Sarees", market: "Regent" },
  { mobile: "9727256154", brandName: "Indian Women", stallSqft: "1000 sq ft", category: "Sarees", market: "RRTM 1" },
  { mobile: "9821349444", brandName: "Israni Entertainment", stallSqft: "300 sq ft", category: "Entertainment", market: "Mumbai" },
  { mobile: "9898866093", brandName: "Jyotsna", stallSqft: "200 sq ft", category: "Saree", market: "" },
  { mobile: "9545612026", brandName: "J B Designer", stallSqft: "300 sq ft", category: "Kurti", market: "" },
  { mobile: "9998675623", brandName: "Jagadamba Creation", stallSqft: "100 sq ft", category: "Fabrics", market: "" },
  { mobile: "9586921213", brandName: "Janani Designer World / Janani Dreams Texfab Ltd", stallSqft: "300 sq ft", category: "Saree / Lengha", market: "M4" },
  { mobile: "9999991375", brandName: "Jindal Saree Center", stallSqft: "400 sq ft", category: "Sarees", market: "" },
  { mobile: "9586621717", brandName: "K.K. Garments", stallSqft: "1200 sq ft", category: "Fabric/Garment", market: "Hojiwala Sachin" },
  { mobile: "9426923797", brandName: "Kairadhya", stallSqft: "300 sq ft", category: "Sarees", market: "Raghukul", aliases: ["9327665182"] },
  { mobile: "9374954037", brandName: "Kala Shree", stallSqft: "600 sq ft", category: "Saree", market: "Ekta Textile Market" },
  { mobile: "9825129301", brandName: "Kama Print N Pack (NBD)", stallSqft: "200 sq ft", category: "Pack", market: "" },
  { mobile: "9537886611", brandName: "Kanak Priya Art", stallSqft: "100 sq ft", category: "Sarees", market: "M2" },
  { mobile: "9909313004", brandName: "Kayaan Prints", stallSqft: "600 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "9825127946", brandName: "Kesari Nandan", stallSqft: "600 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9824686050", brandName: "Keshrag PVT.LTD", stallSqft: "300 sq ft", category: "Saree", market: "Raghuvir Scarlett" },
  { mobile: "9825550213", brandName: "Khatu Shyam", stallSqft: "200 sq ft", category: "Lehanga Choli", market: "Old Katargam GIDC" },
  { mobile: "9377012023", brandName: "Kodas fashion", stallSqft: "600 sq ft", category: "Sarees", market: "M2" },
  { mobile: "9825385509", brandName: "Kokilla fashion", stallSqft: "200 sq ft", category: "Sarees", market: "Kokila House Near Subjail" },
  { mobile: "9712972601", brandName: "Krishnam Art", stallSqft: "600 sq ft", category: "Saree", market: "M1" },
  { mobile: "9925557740", brandName: "Kuhu Creation (Kesari Creation)", stallSqft: "300 sq ft", category: "Kurti", market: "Udhna BRC" },
  { mobile: "9627868411", brandName: "Kunj Bihari Creations", stallSqft: "100 sq ft", category: "Dress Matterial", market: "" },
  { mobile: "9825363009", brandName: "Laxmi Creation", stallSqft: "200 sq ft", category: "Saree", market: "Hojiwala Sachin", aliases: ["9825363099"] },
  { mobile: "9374739383", brandName: "Libaas Fashion (AK TRENDZ)", stallSqft: "600 sq ft", category: "Kurti", market: "Globale" },
  { mobile: "9825505610", brandName: "Mahadev Creations", stallSqft: "600 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9819582727", brandName: "Mahadev Fabrics", stallSqft: "100 sq ft", category: "Fabrics", market: "Raghuveer Scarlett" },
  { mobile: "9909220833", brandName: "Mahadev NX", stallSqft: "300 sq ft", category: "Sarees", market: "" },
  { mobile: "9327452161", brandName: "Mahadev Silk Mills (Chaudhary)", stallSqft: "200 sq ft", category: "Saree", market: "Raghukul" },
  { mobile: "7574971032", brandName: "Mangal Jyoti", stallSqft: "200 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "9913165411", brandName: "Mintu Fashion", stallSqft: "300 sq ft", category: "Sarees", market: "M2" },
  { mobile: "9925633987", brandName: "Mittoo Suits (Khantil E Com)", stallSqft: "600 sq ft", category: "Kurties/Suit", market: "Katargam GIDC" },
  { mobile: "9722771233", brandName: "Mohilya", stallSqft: "1000 sq ft", category: "Kurties", market: "Globale" },
  { mobile: "7878536330", brandName: "Mojasia Texo Fab", stallSqft: "100 sq ft", category: "Fabrics", market: "Raghukul" },
  { mobile: "9016588151", brandName: "Murtidhara Sarees / Shyamraj", stallSqft: "2000 sq ft", category: "Lehenga", market: "Raghukul" },
  { mobile: "9924222001", brandName: "Nandani Regent", stallSqft: "100 sq ft", category: "Sarees", market: "Regent" },
  { mobile: "9375511910", brandName: "Narmada Weavetech", stallSqft: "100 sq ft", category: "Fabrics", market: "Global" },
  { mobile: "9601258092", brandName: "Nidhi Creations", stallSqft: "200 sq ft", category: "Sarees", market: "M1" },
  { mobile: "7052577725", brandName: "Nidhivan / Yogayaa", stallSqft: "600 sq ft", category: "Sarees", market: "Raghkul" },
  { mobile: "8141335579", brandName: "Nirham Club Wear", stallSqft: "200 sq ft", category: "Kurti", market: "Globale" },
  { mobile: "9898106273", brandName: "Nirvana (Kiran)", stallSqft: "200 sq ft", category: "Saree", market: "M2" },
  { mobile: "8347324372", brandName: "Nirvana Designer", stallSqft: "200 sq ft", category: "Lehenga", market: "M1" },
  { mobile: "9377191978", brandName: "Nishcay Sarees / Naisha Synthetics", stallSqft: "600 sq ft", category: "Saree", market: "Kohinoor Textile Market" },
  { mobile: "9737762086", brandName: "NS Fashion", stallSqft: "100 sq ft", category: "Fabrics", market: "", aliases: ["9275114989"] },
  { mobile: "9327465454", brandName: "Omkar / Shivrudra", stallSqft: "200 sq ft", category: "Saree/Lehanga", market: "M1" },
  { mobile: "9879158404", brandName: "P.G. Sarees", stallSqft: "300 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9998862777", brandName: "Pearly Pink", stallSqft: "400 sq ft", category: "Kids Wear", market: "Pearly Pink E-10-13 3rd floor Laxmi Narayan Industrial Estate BRC Uudhana" },
  { mobile: "9825267689", brandName: "Pikasho", stallSqft: "400 sq ft", category: "Saree", market: "M4" },
  { mobile: "9377062128", brandName: "Poonam Designer", stallSqft: "300 sq ft", category: "Kurties", market: "Rajhans Imperia" },
  { mobile: "9909095200", brandName: "Prabhuji", stallSqft: "400 sq ft", category: "Lehenga", market: "M2" },
  { mobile: "9852146981", brandName: "Rachit Group", stallSqft: "600 sq ft", category: "Saree", market: "Annapurna", aliases: ["9825146981"] },
  { mobile: "9374072626", brandName: "Radhey Silk Weaves", stallSqft: "600 sq ft", category: "Fabrics", market: "" },
  { mobile: "9510064200", brandName: "Radhya Designer", stallSqft: "200 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "9830944345", brandName: "Raghav Creation", stallSqft: "200 sq ft", category: "Fabrics", market: "" },
  { mobile: "9825572748", brandName: "Raghav Silk Mills", stallSqft: "100 sq ft", category: "Sarees", market: "M2", aliases: ["7818968985"] },
  { mobile: "9374049925", brandName: "Ramsha (Gouri Impex)", stallSqft: "600 sq ft", category: "Kurti / Suits", market: "NTM" },
  { mobile: "7383001130", brandName: "Reyansh Creation", stallSqft: "100 sq ft", category: "Saree", market: "Globale" },
  { mobile: "9825424890", brandName: "Roots Fabrics", stallSqft: "600 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9829085935", brandName: "Ruby", stallSqft: "300 sq ft", category: "Saree", market: "Globale" },
  { mobile: "9979691230", brandName: "R.Rudra Creation", stallSqft: "600 sq ft", category: "Sarees", market: "NTM" },
  { mobile: "9737404150", brandName: "Saaj Creations", stallSqft: "100 sq ft", category: "Saree/other", market: "M2" },
  { mobile: "9825130650", brandName: "Sahil Creation", stallSqft: "100 sq ft", category: "Sareee", market: "Raghukul" },
  { mobile: "8980254587", brandName: "Samarth Creations", stallSqft: "200 sq ft", category: "Fabrics", market: "Globale" },
  { mobile: "9316721800", brandName: "Sambhav Saree (Samita & Dharaa)", stallSqft: "800 sq ft", category: "Saree", market: "Surana 101" },
  { mobile: "6353511883", brandName: "Samta Sarees", stallSqft: "400 sq ft", category: "Sarees", market: "M2" },
  { mobile: "7719063355", brandName: "SANKALP", stallSqft: "400 sq ft", category: "Sarees", market: "STM" },
  { mobile: "9810550285", brandName: "Saraogi Super Sales Private Limited", stallSqft: "2800 sq ft", category: "Sarees", market: "" },
  { mobile: "9978655007", brandName: "Sarv Kala (V.D)", stallSqft: "600 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9825122634", brandName: "Satish Dresses", stallSqft: "300 sq ft", category: "Uniform Saree", market: "Regent", aliases: ["9825900000"] },
  { mobile: "9099941185", brandName: "Satyavachan", stallSqft: "600 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "9982170219", brandName: "Shakambari Lace House", stallSqft: "200 sq ft", category: "Lace Materials", market: "Behind M2" },
  { mobile: "9898297092", brandName: "Shalini Fashions", stallSqft: "200 sq ft", category: "Sarees", market: "M2" },
  { mobile: "8758832184", brandName: "Shangar Tex", stallSqft: "200 sq ft", category: "Sarees", market: "Old Bombay" },
  { mobile: "7600710440", brandName: "Shankh Designer", stallSqft: "100 sq ft", category: "Sarees", market: "M1", aliases: ["8619183572"] },
  { mobile: "7359330135", brandName: "Shaurya Silk Mills", stallSqft: "200 sq ft", category: "Men's Wear", market: "RRTM 1" },
  { mobile: "9099009117", brandName: "Shayam Fabrics", stallSqft: "200 sq ft", category: "Fabrics", market: "Raghukul" },
  { mobile: "9924438132", brandName: "Shiv Fashion C K", stallSqft: "100 sq ft", category: "Fabrics", market: "" },
  { mobile: "9638143399", brandName: "Shiv Tex", stallSqft: "1000 sq ft", category: "Sarees", market: "Anmol" },
  { mobile: "7874363994", brandName: "Shiv Vardhaan", stallSqft: "200 sq ft", category: "Saree", market: "M4", aliases: ["8804754940"] },
  { mobile: "9825182005", brandName: "Shree Laxmi", stallSqft: "600 sq ft", category: "Lehenga/Saree", market: "M1" },
  { mobile: "9687014347", brandName: "Shreeji Designer / Khushi Fashion", stallSqft: "200 sq ft", category: "Saree", market: "Globale" },
  { mobile: "7487991498", brandName: "Shreya Silk Sarees", stallSqft: "100 sq ft", category: "Saree", market: "Raghukul", aliases: ["7487991497"] },
  { mobile: "9081277726", brandName: "Shritik Designer", stallSqft: "200 sq ft", category: "Saree", market: "Someshwar 2", aliases: ["9978912068"] },
  { mobile: "9998626756", brandName: "Siddharth Blouse", stallSqft: "600 sq ft", category: "Blouses", market: "Globale" },
  { mobile: "9913314440", brandName: "Sitaram Creations", stallSqft: "200 sq ft", category: "Sarees", market: "M1" },
  { mobile: "7874253511", brandName: "Siyaram Fabrics", stallSqft: "100 sq ft", category: "Fabrics", market: "" },
  { mobile: "9913590154", brandName: "Sristi Sarees", stallSqft: "400 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "7405442380", brandName: "Shubh Saachi/Shiv Ganges", stallSqft: "400 sq ft", category: "Sarees", market: "M2", aliases: ["9687609749"] },
  { mobile: "9033339606", brandName: "Sukhdev Textile", stallSqft: "400 sq ft", category: "Sarees", market: "M1" },
  { mobile: "6353582439", brandName: "Suparshva", stallSqft: "800 sq ft", category: "Saree", market: "M1" },
  { mobile: "9879892623", brandName: "Sur Shyam/Girraj", stallSqft: "1000 sq ft", category: "Lehenga", market: "Someshwar 2" },
  { mobile: "9374818499", brandName: "Swamee", stallSqft: "400 sq ft", category: "Saree", market: "M1" },
  { mobile: "9099448676", brandName: "Swarnpari Design", stallSqft: "300 sq ft", category: "Sarees", market: "M2" },
  { mobile: "9377404494", brandName: "Talreeja Sarees", stallSqft: "100 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9662399969", brandName: "Tithi Designer", stallSqft: "200 sq ft", category: "Saree", market: "M1", aliases: ["8511573752"] },
  { mobile: "8141014006", brandName: "Todi Creation", stallSqft: "400 sq ft", category: "Lehanga", market: "M1" },
  { mobile: "7285010000", brandName: "Univastra Sarees", stallSqft: "200 sq ft", category: "Sarees (200)", market: "M1" },
  { mobile: "9328539215", brandName: "Vani Designer", stallSqft: "200 sq ft", category: "Sarees", market: "M2" },
  { mobile: "9726277110", brandName: "Vaani NX", stallSqft: "200 sq ft", category: "Fabrics", market: "Ekta Textile Market" },
  { mobile: "9979907076", brandName: "Veemo Fashions", stallSqft: "100 sq ft", category: "Saree", market: "JJ A/C" },
  { mobile: "7573975665", brandName: "Vighnakarta / Seemaya", stallSqft: "200 sq ft", category: "Other", market: "M1" },
  { mobile: "9913313866", brandName: "Vihanaa Prints", stallSqft: "200 sq ft", category: "Sarees", market: "Raghukul" },
  { mobile: "9537420562", brandName: "Vikram Fabrics", stallSqft: "100 sq ft", category: "Fabrics", market: "Sakar Textile Market" },
  { mobile: "7874442888", brandName: "Vimarsh Prints", stallSqft: "300 sq ft", category: "Saree", market: "M1" },
  { mobile: "9537841621", brandName: "Vivah Textile", stallSqft: "200 sq ft", category: "Saree", market: "Old Bombay" },
  { mobile: "9978524326", brandName: "Yukti Fashion", stallSqft: "200 sq ft", category: "Sarees", market: "M1" },
  { mobile: "9376711888", brandName: "Sweety Fashion", stallSqft: "800 sq ft", category: "Suits", market: "Raghuveer Trade Centre", aliases: ["8141335505"] },
  { mobile: "9654554518", brandName: "Surekha", stallSqft: "400 sq ft", category: "Saree", market: "" },
  { mobile: "9310797518", brandName: "Pagriwala", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "9999478191", brandName: "Taani / Turkish Boy", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "8750204126", brandName: "Rich Rang", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "8017437639", brandName: "Miu-Miu / I Laila / Little Girls / Laila Gold", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "8130017615", brandName: "Rajnish Computer", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "9216586012", brandName: "Metal Bird / Eureca / Nyasia", stallSqft: "200 sq ft", category: "", market: "", aliases: ["9871342511"] },
  { mobile: "7456833341", brandName: "Signature Club", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "9839425959", brandName: "Mr.Ethnic", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "7678947481", brandName: "Happy Boy / 5G Jeans", stallSqft: "200 sq ft", category: "", market: "", aliases: ["9999059128"] },
  { mobile: "9582312435", brandName: "Ketely", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "7021115281", brandName: "Zylo", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "7874954427", brandName: "RKF Studio (Men's Ethnic)", stallSqft: "200 sq ft", category: "", market: "" },
  { mobile: "9883009021", brandName: "24 Street", stallSqft: "200 sq ft", category: "", market: "", aliases: ["8017311157"] },
  { mobile: "9007387489", brandName: "Wow Lotus", stallSqft: "200 sq ft", category: "", market: "", aliases: ["8420440876"] },
  // Added from ste_final_stall_numbers.xlsx (5 Sep 2026 final roster) - brands
  // with no prior profile or registeredExhibitors row at all.
  { mobile: "9374555439", brandName: "Prabhukripa Synthetics", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "9983545202", brandName: "Vaishnavi Sarees", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "8882750260", brandName: "Shivaay Cotoure", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "8003772130", brandName: "Soniya creation", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "9352924452", brandName: "Shubh laxmi", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "6376473726", brandName: "Mercury Fashion", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "9829084015", brandName: "Om Ganesh Fashion", stallSqft: "100 sq ft", category: "", market: "" },
  { mobile: "7728088199", brandName: "Aakashdip", stallSqft: "300 sq ft", category: "", market: "" },
  { mobile: "9151060725", brandName: "Kushagra", stallSqft: "200 sq ft", category: "", market: "" },
];

/** Every number one exhibitor answers to: the sheet's, plus any alias. */
export function numbersFor(exhibitor: RegisteredExhibitor): string[] {
  return [exhibitor.mobile, ...(exhibitor.aliases ?? [])];
}

const key = (identifier: string) => {
  const trimmed = String(identifier ?? "").trim();
  const digits = trimmed.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? digits : trimmed.toUpperCase();
};

/** Lookup by any of an exhibitor's numbers, or by portal ID such as 'SSS'. */
const BY_NUMBER: Map<string, RegisteredExhibitor> = new Map(
  REGISTERED_EXHIBITORS_LIST.flatMap((e) =>
    numbersFor(e).map((n) => [key(n), e] as [string, RegisteredExhibitor])
  )
);

export function findExhibitorByMobile(identifier: string): RegisteredExhibitor | undefined {
  if (!identifier) return undefined;
  return BY_NUMBER.get(key(identifier));
}

/**
 * Flexible exhibitor lookup: resolves by 10-digit mobile, alias, User ID,
 * or registered brand name (case-insensitive, exact or substring).
 */
export function findExhibitor(identifier: string | null | undefined): RegisteredExhibitor | undefined {
  if (!identifier) return undefined;
  const raw = String(identifier).trim();
  if (!raw) return undefined;

  // 1. Direct phone / ID lookup
  const byMobile = findExhibitorByMobile(raw);
  if (byMobile) return byMobile;

  // 2. Brand name match (case-insensitive)
  const norm = raw.toLowerCase();
  const exactBrand = REGISTERED_EXHIBITORS_LIST.find(
    (e) => e.brandName.toLowerCase().trim() === norm
  );
  if (exactBrand) return exactBrand;

  // 3. Substring match for brand name if 3 or more chars
  if (norm.length >= 3) {
    const partialBrand = REGISTERED_EXHIBITORS_LIST.find((e) => {
      const b = e.brandName.toLowerCase();
      return b.includes(norm) || norm.includes(b);
    });
    if (partialBrand) return partialBrand;
  }

  return undefined;
}

/**
 * The number an exhibitor's records belong under.
 *
 * Anything saved against an alias - a profile, an order, a drawn stall -
 * belongs to the one row on the master sheet, so the admin panel and the
 * lottery report both fold it back onto this number rather than showing the
 * same firm twice. An unknown number is returned as given.
 */
export function canonicalMobile(identifier: string | null | undefined): string {
  return findExhibitor(identifier)?.mobile ?? String(identifier ?? "");
}

/** The organiser logins, which are not exhibitors. */
export const ORGANISER_MOBILES = ["9106139666", "9950787787", "9712327649"];

/** The exhibitors alone - the master sheet's own list, without the organisers. */
export const EXHIBITORS_ONLY: RegisteredExhibitor[] = REGISTERED_EXHIBITORS_LIST.filter(
  (e) => !ORGANISER_MOBILES.includes(e.mobile)
);

/**
 * The portal is closed to everyone who is not on the master sheet.
 *
 * REGISTERED_EXHIBITORS_LIST is the whole guest list - the exhibitors, plus the
 * organiser numbers - so membership of it is the single test every entry
 * point applies.
 */
export function isRegisteredExhibitor(identifier: string | null | undefined): boolean {
  return findExhibitor(identifier) !== undefined;
}
