/**
 * GapFinder AI: Built-in Sample Subject & Seed Dataset
 * Subject: Class 10 Science (Life Processes, Chemical Reactions, and Light)
 * Completely original, high-yield educational content for instant demonstration.
 */

export const SAMPLE_USER = {
  id: 'usr_demo_gapfinder_2026',
  email: 'demo@gapfinder.ai',
  password: 'Demo@1234',
  name: 'Alex Johnson',
  role: 'student',
};

export const SAMPLE_SYLLABUS = {
  title: 'Class 10 Science Syllabus 2026',
  fileType: 'syllabus' as const,
  content: `
# CLASS 10 SCIENCE: COMPREHENSIVE CURRICULUM

## Unit 1: Chemical Substances - Nature and Behaviour
### Topic 1.1: Chemical Reactions and Equations
- Chemical equation balance and conservation of mass
- Types of chemical reactions: Combination, Decomposition, Displacement, Double Displacement
- Oxidation and Reduction (Redox reactions in everyday life: Corrosion and Rancidity)

### Topic 1.2: Acids, Bases, and Salts
- Definitions in terms of furnishing H+ and OH- ions
- Concept of pH scale (importance in daily life, tooth decay, digestive pH)
- Preparation and properties of Sodium Hydroxide, Bleaching Powder, Baking Soda, Washing Soda, and Plaster of Paris

## Unit 2: World of Living - Life Processes
### Topic 2.1: Nutrition in Plants and Animals
- Autotrophic nutrition: Photosynthesis equation, light reaction (photolysis of water, ATP/NADPH synthesis in thylakoids) vs dark reaction (Calvin cycle in stroma)
- Stomatal mechanism: Guard cells turgidity and opening
- Heterotrophic nutrition: Holozoic digestion in amoeba and humans (enzymes: salivary amylase, pepsin, trypsin, lipase)

### Topic 2.2: Respiration
- Glycolysis in cytoplasm: Breakdown of glucose into pyruvate
- Aerobic pathway (mitochondria, 36-38 ATP) vs Anaerobic pathway (yeast ethanol fermentation vs muscle lactic acid fermentation)
- Human respiratory mechanism: Alveoli gas exchange and hemoglobin affinity

### Topic 2.3: Transportation and Excretion
- Human circulatory system: 4-chambered heart, double circulation (pulmonary vs systemic)
- Blood components: RBCs, WBCs, Platelets, and Lymph
- Excretion in humans: Anatomy of the kidney, structure of nephron (Bowman's capsule, glomerulus, tubular reabsorption, and urine collection)

## Unit 3: Natural Phenomena
### Topic 3.1: Light - Reflection and Refraction
- Reflection of light by curved surfaces: Spherical mirrors, mirror formula and magnification
- Refraction: Snell's law, refractive index, lens formula and power of a lens
`.trim(),
};

export const SAMPLE_NOTES_CHAPTER_1 = {
  title: 'Chapter 1: Chemical Reactions and Redox Processes',
  fileType: 'notes' as const,
  content: `
# Chapter 1: Chemical Reactions and Equations

## 1.1 Fundamentals of Chemical Reactions
A chemical reaction is a process where reactants undergo bond cleavage and bond formation to yield products with distinct physical and chemical properties. Evidence of a chemical reaction includes change in state, evolution of gas, change in temperature, or change in color.

### Law of Conservation of Mass
Matter can neither be created nor destroyed in a chemical reaction. Therefore, the total mass of the elements present in the products must equal the total mass of the reactants. 
Example: Balancing combustion of methane:
CH4(g) + 2O2(g) -> CO2(g) + 2H2O(g)

## 1.2 Types of Chemical Reactions
1. **Combination Reaction**: Two or more substances combine to form a single product.
   CaO(s) + H2O(l) -> Ca(OH)2(aq) + Heat (Slaking of lime; highly exothermic).
2. **Decomposition Reaction**: A single compound breaks down into two or more simpler substances. Requires energy in the form of heat (thermal), light (photolytic), or electricity (electrolytic).
   - Thermal: 2FeSO4(s) --(Heat)--> Fe2O3(s) + SO2(g) + SO3(g) (Notice the brown ferric oxide residue and suffocating sulfur smell).
   - Photolytic: 2AgCl(s) --(Sunlight)--> 2Ag(s) + Cl2(g) (Used in black and white photography).
3. **Displacement Reaction**: A more reactive element displaces a less reactive element from its aqueous salt solution.
   Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s) (Blue solution turns light green, brown copper deposits).
4. **Double Displacement Reaction**: Exchange of ions between two aqueous reactants, often forming an insoluble precipitate.
   Na2SO4(aq) + BaCl2(aq) -> BaSO4(s) (white precipitate) + 2NaCl(aq).

## 1.3 Oxidation, Reduction, and Everyday Effects
- **Oxidation**: Gain of oxygen or loss of electrons/hydrogen.
- **Reduction**: Loss of oxygen or gain of electrons/hydrogen.
- In redox reactions: The substance that oxidizes another is the oxidizing agent (and gets reduced itself).
- **Corrosion**: Degradation of metals by moisture and airborne acids. Iron rusts to form hydrated ferric oxide Fe2O3.xH2O.
- **Rancidity**: Aerial oxidation of unsaturated fats and oils leading to foul odor and altered taste. Prevented using antioxidants (BHA/BHT), nitrogen gas flushing, or airtight cooling.
`.trim(),
};

export const SAMPLE_NOTES_CHAPTER_2 = {
  title: 'Chapter 2: Life Processes - Autotrophic & Heterotrophic Nutrition',
  fileType: 'notes' as const,
  content: `
# Chapter 2: Life Processes - Nutrition and Photosynthesis

## 2.1 The Architecture of Photosynthesis
Photosynthesis is the photochemical synthesis of organic carbohydrates from inorganic carbon dioxide and water in green plant cells containing chlorophyll, driven by sunlight.

Overall Chemical Equation:
6CO2 + 12H2O --(Sunlight / Chlorophyll)--> C6H12O6 + 6O2 + 6H2O

### Essential Photochemical Steps:
1. **Absorption of Light Energy**: Chlorophyll pigments located in thylakoid membranes trap radiant solar energy.
2. **Conversion and Photolysis of Water**: Solar energy is converted into chemical potential energy. Water molecules are cleaved into protons, electrons, and molecular oxygen (Photolysis: 2H2O -> 4H+ + 4e- + O2). This reaction takes place exclusively during the light phase inside thylakoid grana.
3. **Reduction of Carbon Dioxide**: ATP and NADPH generated in the light phase are utilized in the stroma to reduce CO2 into glucose (C6H12O6) during the light-independent (dark) reaction.

### Stomatal Action and Guard Cells:
Stomata are microscopic apertures distributed across the leaf epidermis. Gas exchange (CO2 uptake and O2 exit) and transpiration occur through stomata. Guard cells swell when water rushes inward, becoming turgid and curving outward to open the pore. When guard cells lose water, they become flaccid and the stoma closes to conserve moisture.

## 2.2 Human Digestive System & Enzyme Cascade
1. **Mouth / Buccal Cavity**: Teeth provide mechanical mastication. Salivary glands secrete salivary amylase (ptyalin) which hydrolyzes starch into maltose disaccharide at neutral pH ~6.8.
2. **Stomach**: Gastric glands secrete Gastric Juice containing:
   - **Hydrochloric Acid (HCl)**: Establishes an acidic milieu (pH 1.5 - 2.0) needed for activating pepsinogen into pepsin; kills ingested microbial pathogens.
   - **Pepsin**: Endopeptidase that cleaves proteins into peptones and proteoses.
   - **Mucus**: Forms a protective colloidal barrier shielding gastric lining from auto-digestion by corrosive HCl.
3. **Small Intestine (Site of Complete Digestion)**:
   - Receives Bile from liver: Bile salts emulsify large lipid droplets into fine micelles, increasing surface area for enzymatic attack, and alkaline bile neutralizes acidic stomach chyme.
   - Pancreatic juice: Contains trypsin (proteins to polypeptides), pancreatic amylase, and pancreatic lipase (lipids to fatty acids + glycerol).
   - Intestinal wall: Epithelial villi and microvilli dramatically amplify surface area for nutrient absorption directly into capillaries and lacteals.
`.trim(),
};

export const SAMPLE_NOTES_CHAPTER_3 = {
  title: 'Chapter 3: Respiration, Circulation, and Excretion',
  fileType: 'notes' as const,
  content: `
# Chapter 3: Cellular Respiration, Circulation, and Human Excretion

## 3.1 Cellular Respiration Pathways
Respiration is the cellular biochemical oxidation of glucose to harvest metabolic energy stored as Adenosine Triphosphate (ATP).
Phase 1: **Glycolysis** occurs in the **cytoplasm** without requiring oxygen. 1 Glucose (6-carbon) molecule is enzymatically cleaved into 2 Pyruvate (3-carbon) molecules, generating a net gain of 2 ATP.

Phase 2: Fate of Pyruvate depending on oxygen availability:
1. **Anaerobic in Yeast (Ethanol Fermentation)**: Pyruvate -> Ethanol + CO2 + 2 ATP.
2. **Anaerobic in Human Muscle Cells (Vigorous exercise)**: Oxygen deficit causes pyruvate conversion into Lactic Acid + 2 ATP. Accumulation of lactic acid triggers muscle cramps.
3. **Aerobic in Mitochondria**: In presence of O2, pyruvate enters the Krebs cycle and electron transport chain inside mitochondria, generating CO2 + H2O + 36 to 38 ATP.

## 3.2 Human Double Circulation
The human heart is a muscular 4-chambered pump designed to segregate oxygenated and deoxygenated blood completely.
- **Deoxygenated blood** from systemic tissues enters the **Right Atrium** via superior and inferior vena cava. It passes through the tricuspid valve into the **Right Ventricle**, which pumps it through the pulmonary artery to the lungs for oxygenation.
- **Oxygenated blood** returns from the lungs through pulmonary veins into the **Left Atrium**. It passes through the bicuspid (mitral) valve into the **Left Ventricle**.
- The Left Ventricle has thick, muscular myocardium because it generates high pressure to pump oxygenated blood through the **Aorta** to the entire systemic body.
- Double circulation prevents mixing of oxygenated and deoxygenated blood, ensuring high metabolic efficiency.

## 3.3 Excretion and Nephron Physiology
Excretion is the elimination of nitrogenous toxic wastes (primarily urea and uric acid) produced during protein catabolism.
Each kidney harbors approximately 1.2 million microscopic filtration functional units called **Nephrons**.

### Stages of Nephron Function:
1. **Ultrafiltration in Malpighian Body**: High blood pressure in the afferent arteriole forces liquid blood through the fenestrated glomerular capillaries into **Bowman's capsule**. Proteins and blood cells are retained; water, glucose, amino acids, urea, and electrolytes enter as glomerular filtrate.
2. **Selective Tubular Reabsorption**: In the Proximal Convoluted Tubule (PCT) and Loop of Henle, essential nutrients (100% of glucose and amino acids, plus 85% of water and salts) are selectively pumped back into surrounding peritubular capillaries.
3. **Tubular Secretion**: Excess potassium, hydrogen ions, and drugs are actively secreted from capillaries into the distal tubule to balance blood pH.
4. **Urine Concentration and Storage**: Concentrated urine travels down collecting ducts into ureters, accumulating in the urinary bladder until voided through the urethra.
`.trim(),
};

export const SAMPLE_PAST_PAPER = {
  title: 'Class 10 Science Board Exam Past Papers (2022-2024)',
  fileType: 'past_paper' as const,
  content: `
# Past Board Exam Questions - Class 10 Science (2022 - 2024)

Q1 [Year: 2024, Marks: 3]
Explain the light reaction of photosynthesis. What is photolysis of water, where does it occur inside the chloroplast, and what are the primary products released?

Q2 [Year: 2024, Marks: 2]
Why is double circulation necessary in human beings? Name the blood vessel that carries oxygenated blood from the lungs to the heart.

Q3 [Year: 2023, Marks: 5]
Describe the structure of a nephron with a neat labeled diagram. Differentiate between ultrafiltration in Bowman's capsule and selective reabsorption in the renal tubule.

Q4 [Year: 2023, Marks: 3]
Differentiate between aerobic respiration and anaerobic respiration with reference to site of occurrence, end products, and ATP yield. Why do sprinters suffer from muscle cramps?

Q5 [Year: 2022, Marks: 3]
What happens when ferrous sulphate crystals are heated in a dry test tube? Write the balanced chemical equation, state the type of reaction, and list two observations.

Q6 [Year: 2022, Marks: 2]
Explain the role of hydrochloric acid and mucus in the human stomach. What complication arises if mucus secretion is impaired?

Q7 [Year: 2023, Marks: 2]
Why does a displacement reaction take place when an iron nail is dipped in blue copper sulphate solution? Write the chemical equation and state the color change.

Q8 [Year: 2024, Marks: 3]
Define rancidity and corrosion. Suggest two preventative industrial techniques to safeguard fatty food products against rancidity.

Q9 [Year: 2022, Marks: 3]
Explain how guard cells regulate the opening and closing of stomatal pores. Why do desert plants keep their stomata closed during daytime?

Q10 [Year: 2023, Marks: 4]
Trace the path of an oxygen molecule from atmospheric air to the pulmonary capillaries in the human lung. How are alveoli adapted for maximum gas exchange?
`.trim(),
};

export const SAMPLE_TOPICS = [
  {
    id: 'top_chem_rxn',
    unitName: 'Unit 1: Chemical Substances',
    title: 'Chemical Reactions and Equations',
    description: 'Balancing equations, types of reactions (combination, decomposition, redox), corrosion & rancidity.',
    examFrequency: 7,
    orderIndex: 1,
  },
  {
    id: 'top_acids_bases',
    unitName: 'Unit 1: Chemical Substances',
    title: 'Acids, Bases and Salts',
    description: 'pH scale, chemical properties of salts, neutralization and indicators.',
    examFrequency: 4,
    orderIndex: 2,
  },
  {
    id: 'top_photo_nutrition',
    unitName: 'Unit 2: World of Living',
    title: 'Photosynthesis & Plant Nutrition',
    description: 'Light reaction vs dark reaction, photolysis of water, stomatal guard cell regulation.',
    examFrequency: 9,
    orderIndex: 3,
  },
  {
    id: 'top_human_digestion',
    unitName: 'Unit 2: World of Living',
    title: 'Human Digestive System',
    description: 'Enzyme cascade (salivary amylase, pepsin, trypsin, lipase), HCl & mucus, villi absorption.',
    examFrequency: 6,
    orderIndex: 4,
  },
  {
    id: 'top_respiration_atp',
    unitName: 'Unit 2: World of Living',
    title: 'Cellular Respiration & Fermentation',
    description: 'Glycolysis in cytoplasm, aerobic mitochondria vs anaerobic muscle lactic acid & yeast fermentation.',
    examFrequency: 8,
    orderIndex: 5,
  },
  {
    id: 'top_circulation_heart',
    unitName: 'Unit 2: World of Living',
    title: 'Human Circulation & Double Circulation',
    description: 'Heart chambers, pulmonary vs systemic circuits, aorta, blood components.',
    examFrequency: 6,
    orderIndex: 6,
  },
  {
    id: 'top_excretion_nephron',
    unitName: 'Unit 2: World of Living',
    title: 'Excretion & Nephron Physiology',
    description: 'Ultrafiltration in Bowman capsule, selective reabsorption of glucose/water in renal tubules.',
    examFrequency: 8,
    orderIndex: 7,
  },
  {
    id: 'top_light_optics',
    unitName: 'Unit 3: Natural Phenomena',
    title: 'Light Reflection & Refraction',
    description: 'Mirrors, lenses, Snell law, refractive index and focal power.',
    examFrequency: 5,
    orderIndex: 8,
  },
];

export const SAMPLE_PRESEEDED_ATTEMPTS = [
  {
    attemptNumber: 1,
    score: 42,
    date: '2026-11-04T10:00:00Z',
    responses: [
      { topicId: 'top_photo_nutrition', score: 0, isCorrect: false, question: 'Where does photolysis occur?' },
      { topicId: 'top_excretion_nephron', score: 0, isCorrect: false, question: 'Which substance is 100% reabsorbed in nephron?' },
      { topicId: 'top_chem_rxn', score: 0.5, isCorrect: false, question: 'Identify redox agents in FeSO4 decomposition' },
      { topicId: 'top_respiration_atp', score: 1, isCorrect: true, question: 'Where does glycolysis take place?' },
    ],
  },
  {
    attemptNumber: 2,
    score: 58,
    date: '2026-11-06T14:30:00Z',
    responses: [
      { topicId: 'top_chem_rxn', score: 1, isCorrect: true, question: 'Balance combination reaction of calcium oxide' },
      { topicId: 'top_photo_nutrition', score: 0, isCorrect: false, question: 'Compare products of light and dark reactions' },
      { topicId: 'top_respiration_atp', score: 1, isCorrect: true, question: 'Explain cause of muscle cramps in sprinters' },
      { topicId: 'top_circulation_heart', score: 0.5, isCorrect: false, question: 'Which vessel carries oxygenated blood to heart?' },
    ],
  },
  {
    attemptNumber: 3,
    score: 75,
    date: '2026-11-08T18:00:00Z',
    responses: [
      { topicId: 'top_chem_rxn', score: 1, isCorrect: true, question: 'State observation when heating ferrous sulphate crystals' },
      { topicId: 'top_respiration_atp', score: 1, isCorrect: true, question: 'Calculate ATP yield in aerobic respiration' },
      { topicId: 'top_excretion_nephron', score: 0.5, isCorrect: false, question: 'Role of Bowman capsule in ultrafiltration' },
      { topicId: 'top_human_digestion', score: 1, isCorrect: true, question: 'Role of bile salts in lipid emulsification' },
      { topicId: 'top_photo_nutrition', score: 0.5, isCorrect: false, question: 'Why stomata close in guard cell flaccidity' },
    ],
  },
];
