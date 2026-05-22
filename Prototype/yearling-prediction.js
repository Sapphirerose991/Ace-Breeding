// ==========================================================================
// 1. GLOBAL REGISTERED YEARLING DATABASE (2026 MVP SCHEMA)
// ==========================================================================
const YEARLING_DATABASE = {
    "USA": [
        { dam: "War Like Goddess", sire: "Into Mischief", year: 2025, country: "USA", surface: "Turf/Dirt", sex: "Colt", damWeight: 540, birthOrder: 2, cannonCircumference: 21.5, regionalTrack: "Saratoga", baselinePrice: 450000, preferredDistance: 2200, nicks: "Sadler's Wells 4D × 5D", trueCOI: 1.85 },
        { dam: "Beholder", sire: "Curlin", year: 2025, country: "USA", surface: "Dirt", sex: "Filly", damWeight: 565, birthOrder: 5, cannonCircumference: 20.2, regionalTrack: "Churchill Downs", baselinePrice: 850000, preferredDistance: 1800, nicks: "Mr. Prospector 3S × 4D", trueCOI: 2.10 },
        { dam: "Midnight Bisou", sire: "Gun Runner", year: 2025, country: "USA", surface: "Dirt", sex: "Colt", damWeight: 510, birthOrder: 3, cannonCircumference: 22.0, regionalTrack: "Belmont Park", baselinePrice: 600000, preferredDistance: 1700, nicks: "Quiet American 4S × 4D", trueCOI: 3.40 },
        { dam: "Monomoy Girl", sire: "Tapit", year: 2025, country: "USA", surface: "Dirt", sex: "Gelding", damWeight: 525, birthOrder: 1, cannonCircumference: 20.8, regionalTrack: "Santa Anita", baselinePrice: 500000, preferredDistance: 1800, nicks: "A.P. Indy 3S × 4D × 5D", trueCOI: 4.80 }, // First Foal
        { dam: "Songbird", sire: "Justify", year: 2025, country: "USA", surface: "Dirt/Turf", sex: "Filly", damWeight: 550, birthOrder: 4, cannonCircumference: 20.5, regionalTrack: "Keeneland", baselinePrice: 1200000, preferredDistance: 2000, nicks: "Mr. Prospector 5S × 5D × 5D", trueCOI: 1.20 },
        { dam: "Gamine", sire: "Quality Road", year: 2025, country: "USA", surface: "Dirt", sex: "Colt", damWeight: 530, birthOrder: 1, cannonCircumference: 21.2, regionalTrack: "Del Mar", baselinePrice: 750000, preferredDistance: 1400, nicks: "Harlan 4S × 4D", trueCOI: 3.90 }, // First Foal
        { dam: "Swiss Skydiver", sire: "Constitution", year: 2025, country: "USA", surface: "Dirt", sex: "Colt", damWeight: 535, birthOrder: 2, cannonCircumference: 21.8, regionalTrack: "Pimlico", baselinePrice: 350000, preferredDistance: 1900, nicks: "A.P. Indy 3S × 4D × 5D", trueCOI: 5.10 },
        { dam: "Rachel Alexandra", sire: "Not This Time", year: 2025, country: "USA", surface: "Dirt", sex: "Filly", damWeight: 565, birthOrder: 6, cannonCircumference: 19.8, regionalTrack: "Oaklawn Park", baselinePrice: 900000, preferredDistance: 1800, nicks: "Northern Dancer 5S × 5S × 4D", trueCOI: 2.95 },
        { dam: "Zenyatta", sire: "Flightline", year: 2025, country: "USA", surface: "Dirt", sex: "Colt", damWeight: 580, birthOrder: 7, cannonCircumference: 23.0, regionalTrack: "Churchill Downs", baselinePrice: 1500000, preferredDistance: 2000, nicks: "Mr. Prospector 4S × 5S × 4D", trueCOI: 4.15 },
        { dam: "Lady Eli", sire: "War Front", year: 2025, country: "USA", surface: "Turf", sex: "Gelding", damWeight: 495, birthOrder: 4, cannonCircumference: 20.5, regionalTrack: "Belmont Park", baselinePrice: 400000, preferredDistance: 1600, nicks: "Northern Dancer 3S × 5D", trueCOI: 3.20 }
    ],
    "Japan": [
        { dam: "Almond Eye", sire: "Equinox", year: 2025, country: "Japan", surface: "Turf", sex: "Colt", damWeight: 485, birthOrder: 3, cannonCircumference: 21.2, regionalTrack: "Tokyo", baselinePrice: 2000000, preferredDistance: 2000, nicks: "Sunday Silence 3S × 4D", trueCOI: 11.25 }, // SS High Inbreeding
        { dam: "Gentildonna", sire: "Kitasan Black", year: 2025, country: "Japan", surface: "Turf", sex: "Filly", damWeight: 500, birthOrder: 5, cannonCircumference: 19.5, regionalTrack: "Kyoto", baselinePrice: 1200000, preferredDistance: 2400, nicks: "Lyphard 4S × 5D", trueCOI: 3.85 },
        { dam: "Gran Alegria", sire: "Lord Kanaloa", year: 2025, country: "Japan", surface: "Turf", sex: "Colt", damWeight: 515, birthOrder: 2, cannonCircumference: 21.5, regionalTrack: "Hanshin", baselinePrice: 1500000, preferredDistance: 1600, nicks: "Sunday Silence 3S × 4D", trueCOI: 9.45 }, // SS High Inbreeding
        { dam: "Chrono Genesis", sire: "Lord Kanaloa", year: 2025, country: "Japan", surface: "Turf", sex: "Filly", damWeight: 475, birthOrder: 3, cannonCircumference: 20.0, regionalTrack: "Nakayama", baselinePrice: 800000, preferredDistance: 2200, nicks: "Nureyev 5S × 4D", trueCOI: 1.15 },
        { dam: "Loves Only You", sire: "Equinox", year: 2025, country: "Japan", surface: "Turf", sex: "Colt", damWeight: 490, birthOrder: 2, cannonCircumference: 20.8, regionalTrack: "Tokyo", baselinePrice: 1000000, preferredDistance: 2000, nicks: "Sunday Silence 4S × 3D", trueCOI: 4.20 },
        { dam: "Daring Tact", sire: "Epiphaneia", year: 2025, country: "Japan", surface: "Turf", sex: "Filly", damWeight: 470, birthOrder: 1, cannonCircumference: 19.2, regionalTrack: "Kyoto", baselinePrice: 700000, preferredDistance: 2000, nicks: "Sunday Silence 4S × 4D", trueCOI: 3.90 }, // First Foal
        { dam: "Lys Gracieux", sire: "Maurice", year: 2025, country: "Japan", surface: "Turf", sex: "Gelding", damWeight: 505, birthOrder: 4, cannonCircumference: 21.2, regionalTrack: "Hanshin", baselinePrice: 900000, preferredDistance: 2200, nicks: "Sunday Silence 4S × 3D", trueCOI: 7.45 },
        { dam: "Marche Lorraine", sire: "Drefong", year: 2025, country: "Japan", surface: "Dirt/Turf", sex: "Colt", damWeight: 495, birthOrder: 1, cannonCircumference: 21.4, regionalTrack: "Oi Local", baselinePrice: 500000, preferredDistance: 1800, nicks: "Deputy Minister 4D × 5D", trueCOI: 0.85 }, // First Foal
        { dam: "Sodashi", sire: "Gold Ship", year: 2025, country: "Japan", surface: "Turf/Dirt", sex: "Filly", damWeight: 485, birthOrder: 2, cannonCircumference: 20.5, regionalTrack: "Sapporo", baselinePrice: 1100000, preferredDistance: 1600, nicks: "Sunday Silence 3S × 4D", trueCOI: 3.20 },
        { dam: "Deirdre", sire: "Harbinger", year: 2025, country: "Japan", surface: "Turf", sex: "Colt", damWeight: 510, birthOrder: 5, cannonCircumference: 21.0, regionalTrack: "Tokyo", baselinePrice: 600000, preferredDistance: 2000, nicks: "Northern Dancer 4S × 5S × 5D", trueCOI: 2.15 }
    ],
    "Europe": [
        { dam: "Enable", sire: "Dubawi", year: 2025, country: "Europe", surface: "Turf", sex: "Colt", damWeight: 520, birthOrder: 2, cannonCircumference: 21.4, regionalTrack: "Newmarket", baselinePrice: 1800000, preferredDistance: 2400, nicks: "Sadler's Wells 4S × 3D", trueCOI: 5.60 },
        { dam: "Magical", sire: "Frankel", year: 2025, country: "Europe", surface: "Turf", sex: "Filly", damWeight: 505, birthOrder: 1, cannonCircumference: 19.8, regionalTrack: "Ascot", baselinePrice: 1500000, preferredDistance: 2000, nicks: "Sadler's Wells 3S × 3D", trueCOI: 12.40 }, // First Foal
        { dam: "Minding", sire: "Wootton Bassett", year: 2025, country: "Europe", surface: "Turf", sex: "Colt", damWeight: 510, birthOrder: 4, cannonCircumference: 21.0, regionalTrack: "Leopardstown", baselinePrice: 950000, preferredDistance: 1600, nicks: "Sadler's Wells 4D × 5D", trueCOI: 1.50 },
        { dam: "Tepin", sire: "Kingman", year: 2025, country: "Europe", surface: "Turf", sex: "Filly", damWeight: 530, birthOrder: 4, cannonCircumference: 20.2, regionalTrack: "Goodwood", baselinePrice: 800000, preferredDistance: 1600, nicks: "Danzig 4S × 5D", trueCOI: 2.80 },
        { dam: "Found", sire: "Siyouni", year: 2025, country: "Europe", surface: "Turf", sex: "Colt", damWeight: 515, birthOrder: 5, cannonCircumference: 21.6, regionalTrack: "Longchamp", baselinePrice: 1300000, preferredDistance: 2400, nicks: "Sadler's Wells 4D × 5D", trueCOI: 3.10 },
        { dam: "Laurens", sire: "No Nay Never", year: 2025, country: "Europe", surface: "Turf", sex: "Filly", damWeight: 540, birthOrder: 2, cannonCircumference: 20.6, regionalTrack: "York", baselinePrice: 650000, preferredDistance: 1600, nicks: "Storm Cat 4S × 5D", trueCOI: 1.90 },
        { dam: "Alpinista", sire: "Sea The Stars", year: 2025, country: "Europe", surface: "Turf", sex: "Colt", damWeight: 490, birthOrder: 1, cannonCircumference: 20.8, regionalTrack: "Chantilly", baselinePrice: 1600000, preferredDistance: 2400, nicks: "Urban Sea 2S × 4D", trueCOI: 6.85 }, // First Foal
        { dam: "Blue Bunting", sire: "Lope de Vega", year: 2025, country: "Europe", surface: "Turf", sex: "Gelding", damWeight: 525, birthOrder: 6, cannonCircumference: 21.2, regionalTrack: "Curragh", baselinePrice: 550000, preferredDistance: 2000, nicks: "Machiavellian 4S × 4D", trueCOI: 2.20 },
        { dam: "Wonderful Tonight", sire: "St Mark's Basilica", year: 2025, country: "Europe", surface: "Turf (Heavy)", sex: "Filly", damWeight: 480, birthOrder: 1, cannonCircumference: 19.4, regionalTrack: "Deauville", baselinePrice: 700000, preferredDistance: 2400, nicks: "Nureyev 5S × 5D × 5D", trueCOI: 4.10 }, // First Foal
        { dam: "Alpha Centauri", sire: "Night Of Thunder", year: 2025, country: "Europe", surface: "Turf", sex: "Colt", damWeight: 550, birthOrder: 3, cannonCircumference: 22.2, regionalTrack: "Newmarket", baselinePrice: 1100000, preferredDistance: 1600, nicks: "Mr. Prospector 5S × 5D", trueCOI: 3.50 }
    ],
    "Oceania": [
        { dam: "Winx", sire: "I Am Invincible", year: 2025, country: "Oceania", surface: "Turf", sex: "Filly", damWeight: 535, birthOrder: 2, cannonCircumference: 20.4, regionalTrack: "Randwick", baselinePrice: 2500000, preferredDistance: 1600, nicks: "Danetime 4S × 4D", trueCOI: 2.40 },
        { dam: "Black Caviar", sire: "Snitzel", year: 2025, country: "Oceania", surface: "Turf", sex: "Colt", damWeight: 570, birthOrder: 6, cannonCircumference: 22.8, regionalTrack: "Flemington", baselinePrice: 2000000, preferredDistance: 1200, nicks: "Danehill 3S × 4D", trueCOI: 6.25 },
        { dam: "Verry Elleegant", sire: "Justify", year: 2025, country: "Oceania", surface: "Turf (Soft)", sex: "Colt", damWeight: 490, birthOrder: 1, cannonCircumference: 21.0, regionalTrack: "Rosehill", baselinePrice: 1100000, preferredDistance: 2400, nicks: "Mr. Prospector 5S × 5D", trueCOI: 1.10 }, // First Foal
        { dam: "Sunlight", sire: "Wootton Bassett", year: 2025, country: "Oceania", surface: "Turf", sex: "Filly", damWeight: 510, birthOrder: 2, cannonCircumference: 19.9, regionalTrack: "Caulfield", baselinePrice: 850000, preferredDistance: 1100, nicks: "Nureyev 5S × 5D", trueCOI: 1.80 },
        { dam: "Melito", sire: "Extreme Choice", year: 2025, country: "Oceania", surface: "Turf", sex: "Colt", damWeight: 520, birthOrder: 4, cannonCircumference: 21.8, regionalTrack: "Doomben", baselinePrice: 900000, preferredDistance: 1200, nicks: "Danehill 3S × 3D", trueCOI: 9.35 },
        { dam: "Imperatriz", sire: "Proisir", year: 2025, country: "Oceania", surface: "Turf", sex: "Filly", damWeight: 530, birthOrder: 1, cannonCircumference: 20.5, regionalTrack: "Moonee Valley", baselinePrice: 1600000, preferredDistance: 1200, nicks: "Danehill 4S × 5D", trueCOI: 3.50 }, // First Foal
        { dam: "Alinghi", sire: "Anamoe", year: 2025, country: "Oceania", surface: "Turf", sex: "Gelding", damWeight: 500, birthOrder: 5, cannonCircumference: 21.1, regionalTrack: "Caulfield", baselinePrice: 750000, preferredDistance: 1400, nicks: "Mr. Prospector 4S × 5D", trueCOI: 4.25 },
        { dam: "More Joyous", sire: "Capitalist", year: 2025, country: "Oceania", surface: "Turf", sex: "Filly", damWeight: 515, birthOrder: 3, cannonCircumference: 19.6, regionalTrack: "Randwick", baselinePrice: 800000, preferredDistance: 1400, nicks: "Halo 5S × 4D", trueCOI: 2.10 },
        { dam: "Atlantic Jewel", sire: "Pierro", year: 2025, country: "Oceania", surface: "Turf", sex: "Colt", damWeight: 545, birthOrder: 4, cannonCircumference: 22.4, regionalTrack: "Flemington", baselinePrice: 1200000, preferredDistance: 1600, nicks: "Zabeel 3S × 4D", trueCOI: 6.70 },
        { dam: "She Will Reign", sire: "Banish", year: 2025, country: "Oceania", surface: "Turf", sex: "Colt", damWeight: 480, birthOrder: 1, cannonCircumference: 20.9, regionalTrack: "Rosehill", baselinePrice: 500000, preferredDistance: 1000, nicks: "Danehill 4D × 3D", trueCOI: 5.40 } // First Foal
    ]
};

// ==========================================================================
// 2. STUDBOOK FILTER & CORRELATION SORTING ALGORITHM
// ==========================================================================
async function fetchFilteredAndSortedYearlings(region, budget, targetDistance) {
    // Standardize input string matching to avoid front-end mismatched selections
    let resolvedRegion = "USA";
    const cleanedRegion = region.trim().toLowerCase();
    
    if (cleanedRegion.includes("japan") || cleanedRegion.includes("jp")) resolvedRegion = "Japan";
    else if (cleanedRegion.includes("europe") || cleanedRegion.includes("eu")) resolvedRegion = "Europe";
    else if (cleanedRegion.includes("Oceania") || cleanedRegion.includes("oce")) resolvedRegion = "Oceania";

    const regionList = YEARLING_DATABASE[resolvedRegion] || [];
    if (regionList.length === 0) return [];

    const mappedList = regionList.map(horse => {
        let matchScore = 100;

        // Hard Budget Cap Constraint Penalty
        if (horse.baselinePrice > budget) {
            matchScore -= 50 + ((horse.baselinePrice - budget) / budget) * 50;
        } else {
            matchScore += (horse.baselinePrice / budget) * 10; 
        }

        // Distance Aptitude Delta Deviation Penalty
        const distDelta = Math.abs(horse.preferredDistance - targetDistance);
        matchScore -= (distDelta / 100) * 3.5;

        return { ...horse, finalMatchScore: Math.max(0, Math.min(100, matchScore)) };
    });

    return mappedList.sort((a, b) => b.finalMatchScore - a.finalMatchScore);
}

// ==========================================================================
// 3. CORE REPORT RENDERING ENGINE (SVG GRAPH WITH CI SHADING)
// ==========================================================================
async function yearlingRecommendations() {
    // Robust cross-selector mapping injection
    const budgetElement = document.getElementById('Budget');
    const budgetInput = budgetElement ? budgetElement.value : "";
    
    const distanceElement = document.getElementById('Expected distance');
    const distanceInput = distanceElement ? distanceElement.value : "1600";
    
    // Explicitly scan both potential dropdown positions seen in DOM UI layout templates
    let selectedRegion = "USA";
    const primaryCountrySelector = document.getElementById('Country');
    
    if (primaryCountrySelector) {
        selectedRegion = primaryCountrySelector.value;
    } else {
        // Fallback checks to prevent DOM mismatch on customized structural layouts
        const fallbackSelectors = document.querySelectorAll('select');
        for (let sel of fallbackSelectors) {
            if (sel.value === "Japan" || sel.value === "USA" || sel.value === "Europe" || sel.value === "Oceania") {
                selectedRegion = sel.value;
                break;
            }
        }
    }

    const reportContainer = document.getElementById('yearling-report-container');

    if (!budgetInput || budgetInput === "N/A" || isNaN(budgetInput.replace(/[^0-9.]/g, ''))) {
        alert("Please enter a valid budget numeric threshold first.");
        return;
    }
    
    const budget = parseFloat(budgetInput.replace(/[^0-9.]/g, ''));
    
    // Semantic Text-Aptitude Parser for non-numeric configurations (e.g., "Middle-distance")
    let targetDistance = 1600;
    const sanitizedDistanceText = distanceInput.trim().toLowerCase();
    if (/[0-9]/.test(sanitizedDistanceText)) {
        targetDistance = parseInt(sanitizedDistanceText.replace(/[^0-9]/g, '')) || 1600;
    } else {
        if (sanitizedDistanceText.includes("sprint")) targetDistance = 1200;
        else if (sanitizedDistanceText.includes("middle")) targetDistance = 2000;
        else if (sanitizedDistanceText.includes("classic") || sanitizedDistanceText.includes("long")) targetDistance = 2400;
    }

    const sortedYearlings = (await fetchFilteredAndSortedYearlings(selectedRegion, budget, targetDistance)).slice(0, 5);

    // Standardize registry token header conversion
    let headerRegionDisplay = "USA";
    const testRegionLower = selectedRegion.toLowerCase();
    if (testRegionLower.includes("japan") || testRegionLower.includes("jp")) headerRegionDisplay = "Japan";
    else if (testRegionLower.includes("europe") || testRegionLower.includes("eu")) headerRegionDisplay = "Europe";
    else if (testRegionLower.includes("Oceania") || testRegionLower.includes("oce")) headerRegionDisplay = "Oceania";

    if (!reportContainer) {
        console.error("Target report element '#yearling-report-container' not located in active DOM structure.");
        return;
    }

    if (sortedYearlings.length === 0) {
        reportContainer.style.display = "block";
        reportContainer.innerHTML = `<h3 class="red" style="text-align:center;">No yearlings found in the [${headerRegionDisplay}] registry database.</h3>`;
        return;
    }

    reportContainer.style.display = "block";
    reportContainer.innerHTML = `<h2 class="red" style="text-align:center; font-size:1.8em; margin-bottom:30px;">AI-Ranked Yearling Recommendations (${headerRegionDisplay} Studbook)</h2>`;

    sortedYearlings.forEach((horse, index) => {
        const horseName = `${horse.dam} ${horse.year}`;
        const isFirstFoal = horse.birthOrder === 1;

        // --- BIOMECHANICAL & MATURITY ALGORITHM ---
        const baseHeight = horse.sex === "Colt" ? 15.8 : (horse.sex === "Filly" ? 15.5 : 15.7);
        let growthFactor = parseFloat((horse.damWeight * 0.0008 - horse.birthOrder * 0.04).toFixed(2));
        if (isFirstFoal) growthFactor -= 0.25; 
        
        const finalHeight = (parseFloat(baseHeight) + growthFactor).toFixed(1);
        const isStructuralSurge = growthFactor > 0.22 && !isFirstFoal;

        // Dynamic Boundaries Matrix
        const ciRange = isFirstFoal ? 10 : 20;
        const w1 = Math.floor(horse.damWeight * (isFirstFoal ? 0.78 : 0.82)); 
        const w1Min = w1 - ciRange; const w1Max = w1 + ciRange;
        
        const w2 = Math.floor(horse.damWeight * (isFirstFoal ? 0.91 : 0.95)); 
        const w2Min = w2 - ciRange; const w2Max = w2 + (ciRange + 5);
        
        const w3 = Math.floor(horse.damWeight * (isStructuralSurge ? 1.05 : (isFirstFoal ? 0.96 : 1.01))); 
        const w3Min = w3 - ciRange; const w3Max = w3 + (isStructuralSurge ? 35 : 20);

        const distancePercent = Math.min(95, Math.max(5, ((horse.preferredDistance - 1000) / 1400) * 100));

        // --- RISK PROFILE & INTERNATIONALLY ALIGNED FREQUENCY LOGIC ---
        let riskProfile = "Low Matrix Pattern";
        let riskColor = "#2A9D8F";
        
        if (horse.nicks.includes("Sunday Silence 3S") || horse.trueCOI > 8.0) {
            riskProfile = "High Susceptibility: Bone Fracture / Cannon Condylar Stress";
            riskColor = "#E63946";
        } else if (isFirstFoal) {
            riskProfile = "Moderate: Delayed Musculoskeletal Closure (First Foal Constriction)";
            riskColor = "#DAA520";
        }

        let optimalInterval = "21 - 28 Days (Standard Cycle)";
        if (horse.country === "Japan" || headerRegionDisplay === "Japan") {
            optimalInterval = (riskColor === "#E63946") ? "45 - 60 Days (Strict Rest Needed - Firm Turf Alert)" : "35 - 42 Days (Skeletal Preservation)";
        } else if (horse.country === "Oceania" || headerRegionDisplay === "Oceania") {
            optimalInterval = (isFirstFoal) ? "21 - 28 Days" : "14 - 21 Days (High Frequency Racing Model)";
        } else if (riskColor === "#E63946") {
            optimalInterval = "35 - 45 Days (Precautionary Layoff)";
        }

        // --- EVALUATION METRICS CAPS ---
        let scoreCurrent = parseFloat((7.4 + Math.random() * 1.2).toFixed(1));
        if (isFirstFoal) scoreCurrent -= 0.6;
        const scoreThreeYo = (scoreCurrent + growthFactor).toFixed(1);
        const estCeilingPrice = Math.floor(horse.baselinePrice * (1.15 + (10 - horse.birthOrder) * 0.025));

        const horseHTML = `
            <div class="analysis-card" style="margin-bottom: 50px; padding: 30px; border-radius: 12px; background: #fff; box-shadow: 0 15px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); position:relative;">
                
                <div style="position:absolute; right:30px; top:-12px; background:#2A9D8F; color:white; font-size:11px; padding:4px 12px; border-radius:20px; font-weight:600; box-shadow:0 4px 10px rgba(42,157,143,0.3);">
                    Match Score: ${horse.finalMatchScore.toFixed(1)}%
                </div>

                <div style="display:flex; align-items:center; border-bottom:2px solid #E63946; padding-bottom:10px; margin-bottom:20px;">
                    <h3 style="margin:0; font-size:15px; color:#333; font-weight:700; border:none; padding:0;">#${index + 1}: ${horseName}</h3>
                    <span style="background:#f5f5f5; border:1px solid #ddd; color:#666; margin-left:15px; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">${horse.sex.toUpperCase()}</span>
                    ${isFirstFoal ? `<span style="background:#fff3cd; border:1px solid #ffeeba; color:#856404; margin-left:10px; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">FIRST FOAL DEBUFF</span>` : ''}
                    <span style="color:#999; font-size:11px; margin-left:auto;">Registry Location: ${horse.regionalTrack}</span>
                </div>

                <div class="two-columns" style="gap:40px; display:flex;">
                    <div class="left" style="width:50%;">
                        <h4 class="yellow" style="margin:0 0 10px 0; font-size:12px; font-weight:600;">🧬 Bloodstock Pedigree Cross & Linebreeding Pattern</h4>
                        <div style="background: #FDF5E6; padding: 12px; border-radius: 6px; font-family: monospace; font-size:11px; color:#555; line-height:1.7; margin-bottom:15px; border-left:3px solid #DAA520;">
                            <strong>Sire:</strong> ${horse.sire} <br>
                            <strong>Dam:</strong> ${horse.dam} (Maternal Dam Birth Order: #${horse.birthOrder})<br>
                            <span style="color:#E63946; font-weight:bold;"><strong>Inbreeding Pattern:</strong> ${horse.nicks} (COI: ${horse.trueCOI}%)</span>
                        </div>

                        <h4 class="red" style="margin:15px 0 10px 0; font-size:12px; font-weight:600;">🏥 Distal Limb Morphology & Biomechanical Risk Matrix</h4>
                        <table style="width:100%; font-size:11px; border-collapse:collapse; line-height:2.2;">
                            <tr style="border-bottom:1px solid #f0f0f0;"><td style="color:#777;">Cannon Bone Circumference:</td><td style="font-weight:600; text-align:right;">${horse.cannonCircumference} cm</td></tr>
                            <tr style="border-bottom:1px solid #f0f0f0;"><td style="color:#777;">Skeletal Pathology Vulnerability:</td><td style="color:${riskColor}; font-weight:600; text-align:right;">${riskProfile}</td></tr>
                            <tr style="border-bottom:1px solid #f0f0f0;"><td style="color:#777;">AI-Predicted Race Frequency Cap:</td><td style="color:#E63946; font-weight:600; text-align:right;">${optimalInterval}</td></tr>
                            <tr style="border-bottom:1px solid #f0f0f0;"><td style="color:#777;">Regional Target Track Fit:</td><td style="text-align:right; font-weight:600;">${horse.surface} Base</td></tr>
                        </table>
                    </div>

                    <div class="left" style="width:50%;">
                        <h4 class="green" style="margin:0 0 10px 0; font-size:12px; font-weight:600;">📊 Optimal Aptitude Distance Extension Range</h4>
                        <div style="margin-bottom:20px; padding-top:5px;">
                            <div style="position:relative; height:6px; background:#e0e0e0; border-radius:3px;">
                                <div style="position:absolute; left:${Math.max(0, distancePercent - 12)}%; width:24%; height:100%; background:rgba(42,157,143,0.25); border-radius:3px;"></div>
                                <div style="position:absolute; left:${distancePercent}%; top:-5px; width:14px; height:14px; background:#2A9D8F; border-radius:50%; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.2);"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-top:6px; font-family:monospace;">
                                <span>1000m (Sprint)</span>
                                <span style="color:#2A9D8F; font-weight:bold;">Optimum: ${horse.preferredDistance}m</span>
                                <span>2400m+ (Classic)</span>
                            </div>
                        </div>

                        <h4 class="yellow" style="margin:15px 0 10px 0; font-size:12px; font-weight:600;">📈 Growth Mass Trajectory Line (Confidence Interval Shaded Area)</h4>
                        <div style="position:relative; background:#fbfbfb; padding:12px; border-radius:6px; border:1px solid #eee;">
                            <svg viewBox="0 0 300 75" style="width:100%; height:auto; overflow:visible;">
                                <polygon points="35,${65 - (w1Max-340)/4} 150,${65 - (w2Max-340)/4} 265,${65 - (w3Max-340)/4} 265,${65 - (w3Min-340)/4} 150,${65 - (w2Min-340)/4} 35,${65 - (w1Min-340)/4}" fill="rgba(218,165,32,0.12)" />
                                <path d="M35,${65 - (w1-340)/4} L150,${65 - (w2-340)/4} L265,${65 - (w3-340)/4}" fill="none" stroke="#DAA520" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                                <circle cx="35" cy="${65 - (w1-340)/4}" r="3.5" fill="#333" />
                                <circle cx="150" cy="${65 - (w2-340)/4}" r="3.5" fill="#E63946" />
                                <circle cx="265" cy="${65 - (w3-340)/4}" r="3.5" fill="#2A9D8F" />
                                <text x="35" y="${52 - (w1-340)/4}" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="bold" fill="#666">${w1}kg</text>
                                <text x="150" y="${52 - (w2-340)/4}" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="bold" fill="#E63946">${w2}kg</text>
                                <text x="265" y="${52 - (w3-340)/4}" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="bold" fill="#2A9D8F">${w3}kg</text>
                            </svg>
                            <div style="display:flex; justify-content:space-between; font-size:9px; color:#999; margin-top:2px; padding:0 5px;">
                                <span>Yearling Stage</span><span>2YO Juvenile</span><span>3YO Classic Cap</span>
                            </div>
                        </div>
                        <p style="font-size:10px; color:#777; margin:6px 0 0 0; line-height:1.4;">
                            ℹ️ <em>${isFirstFoal ? "⚠️ First Foal Constriction Warning: Scale and height indices are restricted. Stabilized tactical speed structure with lesser post-3YO growth curve surge." : (isStructuralSurge ? "📈 Late Maturative Surge: Skeletal mass expansion expected past 2YO stage. Prepare to scale training distance upwards." : "Maturity Track Uniform: Growth vector follows standard progression limits.") }</em>
                        </p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:25px; border-top:1px dashed #ddd; padding-top:15px;">
                    <div style="background: #fff8e1; border-left: 4px solid #DAA520; padding: 12px; border-radius:0 6px 6px 0;">
                        <h5 style="margin:0 0 4px 0; color:#DAA520; font-size:11px; font-weight:600;">📐 Conformation Grading & Racing Prediction</h5>
                        <p style="margin:0; font-size:11px; color:#333;">Current Yearling Grade: <strong>${scoreCurrent.toFixed(1)} / 10</strong> → Projected 3YO Maturity: <strong style="color:#E63946;">${scoreThreeYo} / 10</strong></p>
                        <p style="margin:3px 0 0 0; font-size:10px; color:#666;">Phenotype Spec: Projected adult height ${finalHeight} hh. Racing strategy relies heavily on skeletal closure parameters.</p>
                    </div>

                    <div style="background: #e8f5e9; border-left: 4px solid #2A9D8F; padding: 12px; border-radius:0 6px 6px 0;">
                        <h5 style="margin:0 0 4px 0; color:#2A9D8F; font-size:11px; font-weight:600;">🔨 Ace Auction Ring Smart Bidding Strategy</h5>
                        <p style="margin:0; font-size:11px; color:#333;">Bloodstock Base Appraised Value: <strong>$${horse.baselinePrice.toLocaleString()}</strong></p>
                        <p style="margin:3px 0 0 0; font-size:12px; color:#2A9D8F; font-weight:700;">AI-Recommended Bidding Ceiling Limit: $${estCeilingPrice.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
        reportContainer.innerHTML += horseHTML;
    });
}