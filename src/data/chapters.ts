import mahakali from "@/assets/mahakali.jpg";
import mahalakshmi from "@/assets/mahalakshmi.jpg";
import mahasaraswati from "@/assets/mahasaraswati.jpg";

export type Charitra = {
  id: "prathama" | "madhyama" | "uttama";
  name: string;
  devanagari: string;
  deity: string;
  guna: string;
  image: string;
  essence: string;
};

export const charitras: Charitra[] = [
  { id: "prathama", name: "Prathama Charitra", devanagari: "प्रथम चरित्र", deity: "Mahakali", guna: "Tamas", image: mahakali, essence: "Awakening from inertia — the Devi as Yoga Nidra rouses the sleeping Vishnu." },
  { id: "madhyama", name: "Madhyama Charitra", devanagari: "मध्यम चरित्र", deity: "Mahalakshmi", guna: "Rajas", image: mahalakshmi, essence: "Gathered light becomes power — the united tejas of the gods conquers Mahishasura." },
  { id: "uttama", name: "Uttama Charitra", devanagari: "उत्तम चरित्र", deity: "Mahasaraswati", guna: "Sattva", image: mahasaraswati, essence: "Wisdom dissolves the ego — Shumbha, Nishumbha and their hosts return into the One." },
];

export type Quiz = { q: string; options: string[]; answer: number };
export type Chapter = {
  n: number;
  charitra: Charitra["id"];
  title: string;
  sanskritTitle: string;
  theme: string;
  story: string;
  verse: { sa: string; tr: string; en: string };
  lessons: string[];
  practice: string;
  quiz: Quiz[];
};

export const chapters: Chapter[] = [
  {
    n: 1, charitra: "prathama", title: "Madhu-Kaitabha Vadha", sanskritTitle: "मधुकैटभवधः",
    theme: "Awakening from Yoga Nidra",
    story: "King Suratha, robbed of his kingdom, and the merchant Samadhi, cast out by his family, meet in the forest hermitage of Sage Medhas. Both still ache for what they lost. The sage explains that this attachment is Mahamaya's veil. He tells how, at the end of an age, the demons Madhu and Kaitabha arose from Vishnu's ears to kill Brahma. Brahma praised Yoga Nidra, the Devi, who withdrew from Vishnu's eyes. Vishnu awoke, fought for five thousand years, and slew the demons on his thigh where there was no water.",
    verse: { sa: "या देवी सर्वभूतेषु निद्रारूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", tr: "yā devī sarvabhūteṣu nidrārūpeṇa saṃsthitā | namastasyai namastasyai namastasyai namo namaḥ ||", en: "To the Goddess who dwells in all beings as sleep — salutations, salutations, salutations again and again." },
    lessons: ["Attachment persists even when we know it hurts — this is Mahamaya.", "The same Devi who veils us is the one who awakens us.", "Madhu and Kaitabha are 'sweetness' and 'bitterness' — craving and aversion."],
    practice: "Before sleep tonight, name one thing you are still clinging to. Offer it to the Devi in a single breath.",
    quiz: [
      { q: "Who narrates the Devi Mahatmyam to Suratha and Samadhi?", options: ["Sage Markandeya", "Sage Medhas", "Lord Brahma", "Narada"], answer: 1 },
      { q: "Which form of the Devi awakens Vishnu?", options: ["Yoga Nidra", "Kali", "Chamunda", "Ambika"], answer: 0 },
      { q: "Which guna does the first charitra transmute?", options: ["Sattva", "Rajas", "Tamas", "None"], answer: 2 },
    ],
  },
  {
    n: 2, charitra: "madhyama", title: "Mahishasura Sainya Vadha", sanskritTitle: "महिषासुरसैन्यवधः",
    theme: "The Divine Armory",
    story: "Mahishasura, the buffalo demon, defeats the gods and seizes heaven. In anger, a great light pours out of Vishnu, Shiva, Brahma and every god. The lights merge into one radiant woman — Mahalakshmi. Each god gives her his weapon: Shiva his trident, Vishnu his discus, Varuna his conch, Indra his thunderbolt, Himavan a lion to ride. Her roar shakes the worlds and she destroys Mahishasura's generals and armies.",
    verse: { sa: "शूलं शूलाद्विनिष्कृष्य ददौ तस्यै पिनाकधृक् । चक्रं च दत्तवान् कृष्णः समुत्पाद्य स्वचक्रतः ॥", tr: "śūlaṃ śūlādviniṣkṛṣya dadau tasyai pinākadhṛk | cakraṃ ca dattavān kṛṣṇaḥ samutpādya svacakrataḥ ||", en: "The wielder of Pinaka drew a trident from his own and gave it to her; Krishna brought forth a discus from his own discus and gave it." },
    lessons: ["Shakti is not one power among many — she is all powers gathered.", "Every gift, however small, completes the whole.", "Righteous anger can be converted into creative force."],
    practice: "List three strengths you have received from teachers or family. Thank each one aloud.",
    quiz: [
      { q: "From what did the Devi arise in Chapter 2?", options: ["A lotus", "The combined tejas of the gods", "Ocean foam", "A sacrifice fire"], answer: 1 },
      { q: "Who gave the Devi her lion?", options: ["Indra", "Kubera", "Himavan", "Yama"], answer: 2 },
      { q: "Which form of the Devi presides over the middle charitra?", options: ["Mahakali", "Mahalakshmi", "Mahasaraswati", "Kaushiki"], answer: 1 },
    ],
  },
  {
    n: 3, charitra: "madhyama", title: "Mahishasura Vadha", sanskritTitle: "महिषासुरवधः",
    theme: "Victory over the shape-shifting ego",
    story: "Mahishasura charges in many forms — buffalo, lion, man with sword, elephant. Each time the Devi cuts the form, he takes another. She drinks the divine nectar and laughs: 'Roar, roar, fool, while I drink this honey.' Then she leaps on him, pins him with her foot and pierces him with the trident. As he half-emerges in his true form, she beheads him.",
    verse: { sa: "गर्ज गर्ज क्षणं मूढ मधु यावत्पिबाम्यहम् । मया त्वयि हतेऽत्रैव गर्जिष्यन्त्याशु देवताः ॥", tr: "garja garja kṣaṇaṃ mūḍha madhu yāvatpibāmyaham | mayā tvayi hate'traiva garjiṣyantyāśu devatāḥ ||", en: "Roar, roar a moment, fool, while I drink this honey. When you are slain by me, the gods will soon roar here in joy." },
    lessons: ["The ego changes shape — anger becomes pride becomes fear.", "The Devi is unhurried; true strength is calm.", "Bondage is cut at its root, not at its forms."],
    practice: "Notice one moment today when a feeling changes into another. Simply watch it, without acting.",
    quiz: [
      { q: "What did Mahishasura do when one form was cut?", options: ["Fled", "Took another form", "Surrendered", "Called Shumbha"], answer: 1 },
      { q: "What does the Devi drink before the final blow?", options: ["Soma", "Madhu (divine nectar)", "Milk", "Ganga water"], answer: 1 },
      { q: "Mahishasura symbolises…", options: ["Ignorance only", "The brute, shifting ego", "Time", "Sleep"], answer: 1 },
    ],
  },
  {
    n: 4, charitra: "madhyama", title: "Devi Stuti", sanskritTitle: "शक्रादिस्तुतिः",
    theme: "The gods' hymn of gratitude",
    story: "Freed from Mahishasura, Indra and the gods sing the Shakradaya Stuti. They praise her as prosperity in the homes of the virtuous, misfortune for the wicked, intelligence in the wise, faith in the good and modesty in the noble. Pleased, the Devi grants a boon: whenever they remember her in distress, she will come.",
    verse: { sa: "या श्रीः स्वयं सुकृतिनां भवनेष्वलक्ष्मीः पापात्मनां कृतधियां हृदयेषु बुद्धिः । श्रद्धा सतां कुलजनस्य च लज्जा तां त्वां नताः स्म परिपालय देवि विश्वम् ॥", tr: "yā śrīḥ svayaṃ sukṛtināṃ bhavaneṣvalakṣmīḥ pāpātmanāṃ kṛtadhiyāṃ hṛdayeṣu buddhiḥ | śraddhā satāṃ kulajanasya ca lajjā tāṃ tvāṃ natāḥ sma paripālaya devi viśvam ||", en: "You who are fortune in the homes of the virtuous, misfortune for the wicked, intelligence in the hearts of the wise, faith in the good and modesty in the noble — we bow to you; protect the universe, O Devi." },
    lessons: ["Gratitude completes victory.", "The Devi appears as qualities — prosperity, wisdom, faith, modesty.", "Her promise: remembered in distress, she comes."],
    practice: "Write a four-line hymn of thanks for something that went right this week.",
    quiz: [
      { q: "Who leads the hymn in Chapter 4?", options: ["Brahma", "Indra (Shakra)", "Vishnu", "Suratha"], answer: 1 },
      { q: "What boon does the Devi grant the gods?", options: ["Immortality", "To come whenever remembered in distress", "Heaven forever", "New weapons"], answer: 1 },
      { q: "In the hearts of the wise the Devi dwells as…", options: ["Fear", "Intelligence (buddhi)", "Wealth", "Sleep"], answer: 1 },
    ],
  },
  {
    n: 5, charitra: "uttama", title: "Devi Duta Samvada", sanskritTitle: "देवीदूतसंवादः",
    theme: "The Aparajita Stuti & the messenger",
    story: "Shumbha and Nishumbha conquer the three worlds. The gods go to Himalaya and sing the famous 'Ya Devi Sarvabhuteshu' hymn. From Parvati's body emerges the radiant Kaushiki (Ambika). Shumbha's servants see her and describe her beauty; he sends the messenger Sugriva to propose marriage. She smiles: she has vowed to wed only the one who defeats her in battle.",
    verse: { sa: "या देवी सर्वभूतेषु बुद्धिरूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", tr: "yā devī sarvabhūteṣu buddhirūpeṇa saṃsthitā | namastasyai namastasyai namastasyai namo namaḥ ||", en: "To the Goddess who dwells in all beings as intelligence — salutations again and again." },
    lessons: ["The Devi lives in every being as consciousness, hunger, compassion, peace, mother.", "The ego wants to possess the Divine; it can only be surrendered to.", "A calm 'no' can be the deepest form of strength."],
    practice: "Chant the 'Ya Devi' refrain three times, each time naming one quality you see in someone you love.",
    quiz: [
      { q: "Which goddess emerges from Parvati's body?", options: ["Kali", "Kaushiki / Ambika", "Chamunda", "Lakshmi"], answer: 1 },
      { q: "What was the Devi's vow?", options: ["Never to fight", "To wed whoever defeats her", "To stay in Kailasa", "To never speak"], answer: 1 },
      { q: "Who is Shumbha's messenger?", options: ["Sugriva", "Raktabija", "Chanda", "Dhumralochana"], answer: 0 },
    ],
  },
  {
    n: 6, charitra: "uttama", title: "Dhumralochana Vadha", sanskritTitle: "धूम्रलोचनवधः",
    theme: "Burning the smoky vision",
    story: "Enraged, Shumbha sends Dhumralochana — 'smoke-eyed' — with sixty thousand soldiers to drag the Devi by her hair. As he rushes at her, she simply utters 'Hum!' and he is reduced to ashes. Her lion destroys his army.",
    verse: { sa: "इत्युक्तः सोऽभ्यधावत्तामसुरो धूम्रलोचनः । हुंकारेणैव तं भस्म सा चकाराम्बिका ततः ॥", tr: "ityuktaḥ so'bhyadhāvattāmasuro dhūmralocanaḥ | huṃkāreṇaiva taṃ bhasma sā cakārāmbikā tataḥ ||", en: "So addressed, the demon Dhumralochana rushed at her; with merely the sound 'Hum', Ambika reduced him to ashes." },
    lessons: ["Clouded perception cannot touch the truth.", "Sometimes one syllable of clarity is enough.", "The lion — dharma — finishes what the Devi begins."],
    practice: "When a confused or 'smoky' thought arises today, mentally say 'Hum' and return to the breath.",
    quiz: [
      { q: "How does the Devi destroy Dhumralochana?", options: ["Trident", "Her lion", "The sound 'Hum'", "A flood"], answer: 2 },
      { q: "'Dhumralochana' means…", options: ["Smoke-eyed", "Red seed", "Fierce-faced", "Golden-armed"], answer: 0 },
      { q: "Who destroyed his army?", options: ["Kali", "The lion", "Indra", "The Matrikas"], answer: 1 },
    ],
  },
  {
    n: 7, charitra: "uttama", title: "Chanda-Munda Vadha", sanskritTitle: "चण्डमुण्डवधः",
    theme: "The birth of Kali & Chamunda",
    story: "Shumbha sends Chanda and Munda with a vast army. Ambika's face darkens with anger, and from her brow springs Kali — dark, emaciated, garlanded with skulls, sword and noose in hand. Kali devours the army, seizes Chanda by the hair and beheads both demons. She brings their heads to Ambika, who names her Chamunda.",
    verse: { sa: "ततः कोपादभूदस्या वदनं मसीवर्णम् । ललाटफलकात्सद्यः भ्रुकुटीकुटिलात्ततः ॥ विनिष्क्रान्तासिमुषला काली चातिविभीषणा ॥", tr: "tataḥ kopādabhūdasyā vadanaṃ masīvarṇam | lalāṭaphalakātsadyaḥ bhrukuṭīkuṭilāttataḥ || viniṣkrāntāsimuṣalā kālī cātivibhīṣaṇā ||", en: "Then her face grew ink-dark with anger; and from her furrowed brow sprang forth at once Kali, terrible, bearing sword and noose." },
    lessons: ["Chanda and Munda are passion and delusion — they need fierce grace.", "Kali is the Devi's own concentrated focus.", "The name Chamunda honours the conquest of both."],
    practice: "Choose one distraction and fast from it for a full day.",
    quiz: [
      { q: "From where does Kali emerge?", options: ["The Devi's brow", "The ocean", "Shiva's eye", "A fire altar"], answer: 0 },
      { q: "What name does Ambika give Kali?", options: ["Bhadrakali", "Chamunda", "Shivaduti", "Kaushiki"], answer: 1 },
      { q: "The mantra 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे' is called…", options: ["Gayatri", "Navarna mantra", "Mahamrityunjaya", "Panchakshari"], answer: 1 },
    ],
  },
  {
    n: 8, charitra: "uttama", title: "Raktabija Vadha", sanskritTitle: "रक्तबीजवधः",
    theme: "The multiplying ego & the Saptamatrikas",
    story: "The Shaktis of the gods — Brahmani, Maheshvari, Kaumari, Vaishnavi, Varahi, Narasimhi and Aindri — come forth as the Seven Mothers. Raktabija has a boon: every drop of his blood that touches the ground becomes a new demon. The battlefield fills with clones. The Devi asks Chamunda to open her mouth wide and drink every drop before it falls. Bloodless, Raktabija is slain.",
    verse: { sa: "चामुण्डे विस्तीर्णं वदनं कुरु मा चिरम् । मच्छस्त्रपातसम्भूतान् रक्तबिन्दून् महासुरान् ॥", tr: "cāmuṇḍe vistīrṇaṃ vadanaṃ kuru mā ciram | macchastrapātasambhūtān raktabindūn mahāsurān ||", en: "O Chamunda, open your mouth wide without delay, and take in the great demons born from drops of blood where my weapons strike." },
    lessons: ["Every unchecked desire seeds more desires.", "Some habits must be absorbed at the source, not fought one by one.", "Divine power works through many forms acting as one."],
    practice: "Catch one recurring thought the moment it arises. Don't argue with it — just 'drink' it with awareness.",
    quiz: [
      { q: "What was Raktabija's boon?", options: ["Invisibility", "Each drop of blood became a new demon", "Flight", "Immortality"], answer: 1 },
      { q: "How many Matrikas appear?", options: ["Five", "Seven", "Nine", "Twelve"], answer: 1 },
      { q: "Who drinks Raktabija's blood?", options: ["Chamunda", "Vaishnavi", "Aindri", "Varahi"], answer: 0 },
    ],
  },
  {
    n: 9, charitra: "uttama", title: "Nishumbha Vadha", sanskritTitle: "निशुम्भवधः",
    theme: "Cutting the 'mine'",
    story: "Furious at Raktabija's death, Nishumbha charges. He is struck down, rises again with ten thousand arms, and is struck again. From his chest a second being emerges, crying 'Stop!' — the Devi laughs and beheads it. The Matrikas and Kali destroy his army.",
    verse: { sa: "तस्यापतन्तं वेगेन निशुम्भस्यासुरस्य च । चिच्छेद सायकास्तीक्ष्णैश्चर्म चाष्टशशीयुतम् ॥", tr: "tasyāpatantaṃ vegena niśumbhasyāsurasya ca | ciccheda sāyakāstīkṣṇaiścarma cāṣṭaśaśīyutam ||", en: "With sharp arrows she cut the swiftly falling sword of the demon Nishumbha, and his shield adorned with eight moons." },
    lessons: ["Nishumbha is 'mamatā' — the sense of 'mine'.", "Possessiveness keeps reappearing in new forms.", "Laughter, not struggle, is the Devi's posture."],
    practice: "Give away one thing today that you think of as 'mine', even a small one.",
    quiz: [
      { q: "Nishumbha represents…", options: ["Sleep", "'Mine-ness'", "Lust", "Fear"], answer: 1 },
      { q: "What emerges from Nishumbha's chest?", options: ["Light", "A second being crying 'Stop!'", "A lion", "Blood seeds"], answer: 1 },
      { q: "Who is Nishumbha's brother?", options: ["Mahisha", "Shumbha", "Raktabija", "Madhu"], answer: 1 },
    ],
  },
  {
    n: 10, charitra: "uttama", title: "Shumbha Vadha", sanskritTitle: "शुम्भवधः",
    theme: "There is only One",
    story: "Shumbha mocks the Devi for relying on others' strength. She replies: 'I alone exist here in the world; who else is there beside me? See, these powers of mine re-enter me.' All the goddesses merge back into her. They fight in the sky; at last she hurls him to earth and pierces him with her trident. The world becomes calm, rivers flow in their courses, fires burn bright.",
    verse: { sa: "एकैवाहं जगत्यत्र द्वितीया का ममापरा । पश्यैता दुष्ट मय्येव विशन्त्यो मद्विभूतयः ॥", tr: "ekaivāhaṃ jagatyatra dvitīyā kā mamāparā | paśyaitā duṣṭa mayyeva viśantyo madvibhūtayaḥ ||", en: "I alone exist here in the world; who is there other than me? See, O wicked one, these my manifestations entering back into me." },
    lessons: ["Shumbha is 'ahaṃkāra' — the I-sense itself.", "All the forms of the Divine are one Devi.", "When the ego falls, nature returns to harmony."],
    practice: "Sit for five minutes repeating 'Ekaivāham' — I alone am — feeling all your roles merge into stillness.",
    quiz: [
      { q: "What does 'Ekaivāham' declare?", options: ["I am weak", "I alone exist", "I need help", "I am many"], answer: 1 },
      { q: "What happens to the other goddesses?", options: ["They leave", "They merge into the Devi", "They sleep", "They become demons"], answer: 1 },
      { q: "Shumbha symbolises…", options: ["The ego (I-sense)", "Time", "Ignorance of Vedas", "Wealth"], answer: 0 },
    ],
  },
  {
    n: 11, charitra: "uttama", title: "Narayani Stuti", sanskritTitle: "नारायणीस्तुतिः",
    theme: "The cosmic hymn of universal praise",
    story: "The gods, led by Agni, praise the Devi as Narayani — the refuge of all. She is every auspiciousness, the power of creation, preservation and dissolution, the one who removes the distress of those who come to her. Pleased, she promises to incarnate again in future ages — as Shakambhari, Bhima, Bhramari and others — whenever demons arise.",
    verse: { sa: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके । शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥", tr: "sarvamaṅgalamāṅgalye śive sarvārthasādhike | śaraṇye tryambake gauri nārāyaṇi namo'stu te ||", en: "O auspiciousness of all that is auspicious, O gracious one who fulfils every aim, O refuge, three-eyed Gauri, Narayani — salutations to you." },
    lessons: ["The Devi is shelter (sharanya) for anyone who turns to her.", "Her promise to return is a promise of hope.", "Praise is a way of seeing the Divine everywhere."],
    practice: "Recite 'Sarvamangala Mangalye' at dawn or dusk for seven days.",
    quiz: [
      { q: "By what name do the gods praise her in Chapter 11?", options: ["Narayani", "Bhavani", "Kamakshi", "Annapurna"], answer: 0 },
      { q: "Which future form does she promise?", options: ["Shakambhari", "Radha", "Sita", "Tara"], answer: 0 },
      { q: "'Sharanye' means…", options: ["Fierce one", "Refuge", "Dancer", "Mother of gods"], answer: 1 },
    ],
  },
  {
    n: 12, charitra: "uttama", title: "Phalastuti", sanskritTitle: "फलस्तुतिः",
    theme: "The shield of fruitful recitation",
    story: "The Devi herself describes the fruits of reciting her glory: protection from calamity, enemies, fire, water and disease; peace in the home; abundance for the household. Wherever this text is read with devotion, she promises never to leave that place.",
    verse: { sa: "यत्रैतत् पठ्यते सम्यङ् नित्यमायतने मम । सदा न तद्विमोक्ष्यामि सान्निध्यं तत्र मे स्थितम् ॥", tr: "yatraitat paṭhyate samyaṅ nityamāyatane mama | sadā na tadvimokṣyāmi sānnidhyaṃ tatra me sthitam ||", en: "Wherever this is rightly recited daily in my sanctuary, I shall never leave that place; my presence abides there." },
    lessons: ["Recitation is presence — the text itself is the Devi.", "Regularity matters more than quantity.", "The real fruit is fearlessness."],
    practice: "Choose a fixed daily time and place for even five minutes of reading.",
    quiz: [
      { q: "Who speaks the Phalastuti?", options: ["Medhas", "The Devi herself", "Indra", "Suratha"], answer: 1 },
      { q: "What does she promise where the text is read?", options: ["Wealth only", "Never to leave that place", "A new kingdom", "Moksha in one day"], answer: 1 },
      { q: "What matters most in recitation?", options: ["Speed", "Regular devotion", "Loudness", "Length"], answer: 1 },
    ],
  },
  {
    n: 13, charitra: "uttama", title: "Varapradana", sanskritTitle: "सुरथवैश्ययोर्वरप्रदानम्",
    theme: "The bestowal of boons",
    story: "Suratha and Samadhi worship the Devi for three years on a riverbank, making an earthen image. She appears. Suratha asks for his kingdom in this life and an indestructible one in the next — he will become the Manu Savarni. Samadhi, now dispassionate, asks for the knowledge that cuts the bonds of 'I' and 'mine' — and receives liberating wisdom.",
    verse: { sa: "वैश्यस्ततो ज्ञानं वव्रे निर्विण्णमानसो भवात् । ममेत्यहमिति प्राज्ञः संगविच्युतिकारकम् ॥", tr: "vaiśyastato jñānaṃ vavre nirviṇṇamānaso bhavāt | mametyahamiti prājñaḥ saṃgavicyutikārakam ||", en: "Then the wise merchant, his mind turned from worldly existence, chose the knowledge that dissolves attachment to 'I' and 'mine'." },
    lessons: ["The Devi gives both worldly and spiritual boons.", "What we ask for reveals who we have become.", "The journey that began in grief ends in wisdom."],
    practice: "Write the one boon you would ask of the Devi today. Revisit it in a month.",
    quiz: [
      { q: "What did Samadhi ask for?", options: ["His wealth back", "Liberating knowledge", "A kingdom", "Long life"], answer: 1 },
      { q: "Suratha becomes which future Manu?", options: ["Vaivasvata", "Savarni", "Svayambhuva", "Raivata"], answer: 1 },
      { q: "How long did they worship?", options: ["Nine days", "One year", "Three years", "Twelve years"], answer: 2 },
    ],
  },
];

export const charitraOf = (c: Chapter) => charitras.find((x) => x.id === c.charitra)!;
