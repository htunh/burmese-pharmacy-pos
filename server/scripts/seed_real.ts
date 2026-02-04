import db from "../db/database";

const rawData = `Air x		2000	2500
Airx xrop		5000	5500
Alben400		400	500
Antacil		1450	1500
Appeton 60		43200	45000
Avolac syr သေး			11000
Bactolac		4100	4500
Besadil5	Oct-26	300	500
Bilac 		1400	1700
Biogesic120mg		6800	7000
Biogesic250mg		9600	10000
Cyprocal		12200	13000
Dexoph		4800	5500
Dicitol	May-29	600	1000
Fame collagen		19400	20000
Fame Neurogin		11700	13000
Fame urocrush		11700	12500
Fast125		500	700
Fast250		7200	8000
Fast500		830	1000
Floxogyl syp		2500	3000
Gasout		730	1000
Gripe mixture		4000	
Kidlac		1200	1500
Maxbone		11600	15000
Methycobal500	Feb-29	11600	12500
Mybacin loz		1150	1500
Nanakid		4500	5000
Neubonနီ		400	500
Omega 3  omega gold		2900	3200
Omega 3 5s		1750	2000
Omeprazole 		750	1000
OracipED		2650	3000
Orlioc40mg		800	1000
Paracap		1000	1200
Parasafe125		3100	3500
Parasafe250		4800	5300
Physiodose		800	1000
Ranitidine	Sep-27	700	1000
Rhinozol0.05		6250	7000
Rhinozol0.1		6750	7500
Sara120mg		5220	6000
Sara250mg		6000	6600
Savogesid		700	1000
Siloxogene tab	May-28	1000	1000
Siloဝါ		1000	
Starmox pow			
Tetra eye		1250	1500
Tiffy ကြီး		5000	5500
Tiffy သေး		3300	4000
Trinamin		2500	3000
Venus400			
Vrohto စိမ်း		18000	
Vrohto ပြာ		15000	
Xceldrop		3900	4500
Zinc pai tab		600	1000
Natrilam1.5 /5		5400	6000
Urocrush 		11500	13000
Ameprolol Xl 25		27800	30000
Mulivitamin card		11000	12500
Savogesidပန်း		700	1000
O 3gold ntk		29000	32000
Silo 		1000	
ORS ပြာ		850	1000
Royal D		580	600
Ediplex		2600	3000
SsI mom 100		4550	5000
Cemol 100		3450	4000
Coxကု		4000	4500
Mycodyl syr		4470	5000
Fefa sy		4800	5500
Zecuf syr		4400	6000
Konidin sy		4500	5000
Vifex		7400	8000
PB tussive		3300	4000
PB mycolyte		3400	4000
Wood နီ		14500	15000
Wood ပြာ		14500	15000
Ascoril sy		6500	7000
Chericof syr		8150	9000
Nanakid		4400	5000
Mexy syr		3450	4000
Cetrine syr		2900	3200
Safil2		3500	5000
Salbutamol ရှူ		9500	11000
Motimax 5		18500	20000
Motimax 10		26500	30000
Roshir 10		2650	3000
Atornod 10		7300	10000
Levastor 20		13000	15000
Cardivas 3.125		2600	3000
Deriphllin		720	800
OG		31700	33000
OF		31200	32000
Cypridin		1750	2000
Vitacap		7000	7500
Nutrivita		2650	3000
Reevit		17000	20000
Enervon C		9000	9500
Cyprohep		11500	15000
Hemarexin		1550	2000
Venus		30500	3500
Imancee		2100	2500
Dofenal 250		2700	3000
Dofenal 500		3150	3500
Mefdol f		1250	1500
Enat 400		8350	9000
Prim E		7800	8500
Eposoft		10000	10500
Ferrovit		3350	3500
Bet GM		4250	5000
Gentene c		4800	5000
Compound cream		2800	3000
ငှက်နှစ်ကောင်		1000	1200
Unison ointment 		2150	2500
Zema 		2750	3500
29A		1650	1800
Caramine 		3700	4000
Fungiderm 		3770	4000
Sk စိမ်း		4200	5000
Skineal		8000	9000
Sonaderm		4300	5000`;

const seedReal = () => {
  console.log("Seeding real data...");
  const lines = rawData.split("\n");

  const insertProduct = db.prepare(`
    INSERT INTO products (name_mm, name_en, sale_price) VALUES (?, ?, ?)
  `);

  const insertBatch = db.prepare(`
    INSERT INTO inventory_batches (product_id, batch_no, expiry_date, cost_price, qty_on_hand, received_at)
    VALUES (?, 'INIT', '2026-01-01', ?, ?, ?)
  `);

  let count = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split by tab first?
    // Based on user input, it looks like tabs.
    // Try to normalize: Replace tab with special char or just split by regex
    // Regex for 2 or more spaces or tabs
    const parts = trimmed
      .split(/[\t]+/)
      .map((p) => p.trim())
      .filter((p) => p !== "");

    // Heuristic parsing
    let name = parts[0];
    let cost = 0;
    let price = 0;

    // Case 1: 4 parts (Name, Date, Cost, Price)
    if (parts.length === 4) {
      cost = parseInt(parts[2].replace(/,/g, "")) || 0;
      price = parseInt(parts[3].replace(/,/g, "")) || 0;
    }
    // Case 2: 3 parts (Name, Date/Cost, Cost/Price)
    else if (parts.length === 3) {
      // Check if 2nd part is Date or Number
      const p1 = parts[1];
      const p2 = parts[2];

      const isNum1 = /^\d+$/.test(p1.replace(/,/g, ""));
      const isNum2 = /^\d+$/.test(p2.replace(/,/g, ""));

      if (isNum1 && isNum2) {
        // Name, Cost, Price
        cost = parseInt(p1.replace(/,/g, ""));
        price = parseInt(p2.replace(/,/g, ""));
      } else {
        // Name, Date, Price? Or Name, Date, Cost?
        // Usually last one is Price if there's only one number?
        // Or duplicate?
        // Based on "Siloဝါ 1000", if only one number, user might mean Cost?
        // But "Avolac syr သေး 11000" (from image) looked like Price.
        // Let's assume if strict number, it's Price, and assume 20% margin for cost?
        // Or look at the example "Siloဝါ 1000" -> Cost 1000 (from previous analysis).
        // "Vrohto စိမ်း 18000" -> Price? Or Cost?
        // Let's look at "Vrohto စိမ်း 18000" in list.
        // Previous lines: "Trinamin 2500 3000".
        // "Vrohto စိမ်း 18000". If 18000 is cost, price might be 20000?
        // If 18000 is price, cost might be 15000.

        const val = parseInt(p2.replace(/,/g, ""));
        if (val) {
          price = val;
          cost = Math.round(val * 0.8); // Estimate cost
        }
      }
    }
    // Case 3: 2 parts (Name, Number)
    else if (parts.length === 2) {
      const val = parseInt(parts[1].replace(/,/g, ""));
      if (!isNaN(val)) {
        // Is it Cost or Price?
        // "Siloဝါ 1000". In original, 1000 aligns with Cost column?
        // "Gripe mixture 4000".
        // Let's assume Price if usually high?
        // Actually safer to assume Price and calc Cost.
        price = val;
        cost = Math.round(val * 0.8);
      } else {
        // Name, Date -> Skip
        console.log(`Skipping (No price): ${name}`);
      }
    }
    // Case 4: 1 part (Name only)
    else if (parts.length === 1) {
      console.log(`Skipping (No data): ${name}`);
    }

    if (price > 0 || cost > 0) {
      // Insert
      const info = insertProduct.run(name, name, price);
      const pid = info.lastInsertRowid;
      insertBatch.run(pid, cost, 10, new Date().toISOString()); // Qty 10
      count++;
    }
  }

  console.log(`Seeded ${count} products.`);
};

seedReal();
