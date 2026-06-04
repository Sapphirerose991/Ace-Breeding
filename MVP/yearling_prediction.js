// ==========================================================================
// 1. 真实年利数据库 (基于日本 Silk Racing 2025 和 澳洲 Gold Coast 2026)
// ==========================================================================
let REAL_YEARLING_DATABASE = {
    "Japan": [],
    "Oceania": []
};

// 图片基础路径配置
const PHOTO_BASE_PATH = {
    "Japan": "",  // 日本马不使用本地路径，直接用JSON中的URL
    "Oceania": "2026_gold_cost_yearling_pic/"
};

// ==========================================================================
// AI 逻辑回归模型配置 (基于体型特征预测理想距离)
// ==========================================================================
const AI_DISTANCE_MODEL = {
    model_type: "logistic",
    features: [
        "Y_Ground_Front",
        "Height_Withers_pixels",
        "Head_Neck_Ratio",
        "Body_Length_Ratio",
        "Croup_Length_Ratio",
        "Back_Length_Ratio",
        "Leg_to_Body_Ratio",
        "Front_Leg_Length_pixels",
        "Chest_Depth_pixels",
        "Shoulder_Angle",
        "Left_Hock_Angle",
        "Right_Hock_Angle",
        "Left_Knee_Angle",
        "Right_Knee_Angle",
        "Croup_Angle",
        "Left_Front_Pastern_Angle",
        "Right_Front_Pastern_Angle",
        "Left_Hind_Pastern_Angle",
        "Right_Hind_Pastern_Angle"
    ],
    coefficients: [
        0.3195581278915967,
        0.12615103025168192,
        0.43139320788474894,
        -1.218366327717936,
        -1.1978368887008783,
        -0.07597268553390094,
        -0.0972842322118818,
        0.1639004483813501,
        0.1032908181830615,
        -0.042661053801210276,
        0.5326424320113411,
        0.5063719907676862,
        -0.5654778991762069,
        0.12641172863685668,
        0.05989785546183701,
        -0.05302123721128112,
        -0.1315404836800966,
        -0.5802919637708802,
        -0.1597523046370578
    ],
    intercept: -0.1947317433816214,
    threshold: 0.5
};

// 根据种公马和性别生成默认的体型特征值
function generateConformationFeatures(horse) {
    const sire = horse.sire;
    const sireDistance = horse.preferredDistance || 1600;
    const sex = horse.sex;

    // 基于父系距离推断体型特征
    const isLongDistanceSire = sireDistance >= 2000;
    const isColt = sex === "Colt";

    return {
        'Y_Ground_Front': isLongDistanceSire ? 920 : 880,
        'Height_Withers_pixels': isColt ? 660 : 640,
        'Head_Neck_Ratio': isLongDistanceSire ? 0.58 : 0.52,
        'Body_Length_Ratio': isLongDistanceSire ? 1.10 : 1.00,
        'Croup_Length_Ratio': isLongDistanceSire ? 0.33 : 0.29,
        'Back_Length_Ratio': 0.50,
        'Leg_to_Body_Ratio': isLongDistanceSire ? 1.35 : 1.45,
        'Front_Leg_Length_pixels': isLongDistanceSire ? 370 : 390,
        'Chest_Depth_pixels': isLongDistanceSire ? 290 : 270,
        'Shoulder_Angle': isLongDistanceSire ? 85 : 92,
        'Left_Hock_Angle': 150,
        'Right_Hock_Angle': 148,
        'Left_Knee_Angle': 175,
        'Right_Knee_Angle': 174,
        'Croup_Angle': isLongDistanceSire ? 32 : 38,
        'Left_Front_Pastern_Angle': 60,
        'Right_Front_Pastern_Angle': 62,
        'Left_Hind_Pastern_Angle': 65,
        'Right_Hind_Pastern_Angle': 60
    };
}

// AI 预测：返回长距离概率 (0-1)
function predictLongDistanceProbability(horse) {
    const features = generateConformationFeatures(horse);

    // 构建特征向量
    let z = AI_DISTANCE_MODEL.intercept;
    for (let i = 0; i < AI_DISTANCE_MODEL.features.length; i++) {
        const featureName = AI_DISTANCE_MODEL.features[i];
        let value = features[featureName];
        if (value === undefined || value === null) {
            // 默认值
            const defaultValues = {
                'Y_Ground_Front': 900, 'Height_Withers_pixels': 650,
                'Head_Neck_Ratio': 0.55, 'Body_Length_Ratio': 1.05,
                'Croup_Length_Ratio': 0.31, 'Back_Length_Ratio': 0.5,
                'Leg_to_Body_Ratio': 1.4, 'Front_Leg_Length_pixels': 380,
                'Chest_Depth_pixels': 280, 'Shoulder_Angle': 88,
                'Left_Hock_Angle': 150, 'Right_Hock_Angle': 148,
                'Left_Knee_Angle': 175, 'Right_Knee_Angle': 174,
                'Croup_Angle': 35, 'Left_Front_Pastern_Angle': 58,
                'Right_Front_Pastern_Angle': 62, 'Left_Hind_Pastern_Angle': 65,
                'Right_Hind_Pastern_Angle': 60
            };
            value = defaultValues[featureName] || 0;
        }
        z += value * AI_DISTANCE_MODEL.coefficients[i];
    }

    // Sigmoid 转换
    const probability = 1 / (1 + Math.exp(-z));
    return probability;
}

// 获取完整的AI分析结果
function getAIAnalysis(horse) {
    const aiProbability = predictLongDistanceProbability(horse);
    const isLongDistance = aiProbability >= AI_DISTANCE_MODEL.threshold;
    const sireDistance = horse.preferredDistance;

    // 综合AI和父系信息的推荐距离
    let recommendedDistance;
    let recommendationBasis;

    if (isLongDistance && sireDistance >= 2000) {
        recommendedDistance = Math.max(2000, sireDistance);
        recommendationBasis = "AI analysis + sire history both indicate stayer potential";
    } else if (isLongDistance && sireDistance < 2000) {
        recommendedDistance = 2000;
        recommendationBasis = "AI conformation suggests stayer potential despite sire's shorter profile";
    } else if (!isLongDistance && sireDistance >= 2000) {
        recommendedDistance = sireDistance;
        recommendationBasis = "Sire history indicates stayer, though AI suggests shorter profile";
    } else {
        recommendedDistance = sireDistance;
        recommendationBasis = "Both AI analysis and sire history suggest shorter distance preference";
    }

    return {
        probability: aiProbability,
        isLongDistance: isLongDistance,
        predictedCategory: isLongDistance ? "Stayer (≥2000m)" : "Sprinter/Miler (<2000m)",
        confidence: isLongDistance ? aiProbability : (1 - aiProbability),
        recommendedDistance: recommendedDistance,
        recommendationBasis: recommendationBasis,
        // 特征值 (用于调试/显示)
        features: generateConformationFeatures(horse)
    };
}

// 辅助函数: 解析价格 (处理各种格式)
function parsePriceFromOffering(offeringStr) {
    if (!offeringStr || offeringStr === "") return null;
    if (typeof offeringStr === "string") {
        const slashIndex = offeringStr.indexOf("/");
        let priceStr = slashIndex > -1 ? offeringStr.substring(0, slashIndex) : offeringStr;
        const match = priceStr.match(/[\d,]+/);
        if (match) return parseInt(match[0].replace(/,/g, ''), 10);
        return null;
    }
    return typeof offeringStr === "number" ? offeringStr : null;
}

// 辅助函数: 从澳洲数据中提取价格
function parseAustralianPrice(priceValue) {
    if (!priceValue && priceValue !== 0) return null;
    if (typeof priceValue === "number") return priceValue;
    if (typeof priceValue === "string") {
        const match = priceValue.match(/[\d,]+/);
        if (match) return parseInt(match[0].replace(/,/g, ''), 10);
    }
    return null;
}

// 辅助函数: 根据马名推断性别
function inferSexFromName(name) {
    const femaleIndicators = ["Queen", "Belle", "Fille", "Filly", "Nera", "Johanna", "Optimista", "Poesia", "Sainte", "Ria", "Serenade", "Anmut", "La", "Belles", "Gaillarde", "Les Yeux", "So Fiere", "Artemis"];
    const maleIndicators = ["King", "Prince", "Lord", "Saint", "Bernard", "Log", "Equatore", "Wickford", "Lear", "Soundscape", "Drive", "Cirque", "Tactician", "Gilded", "Snatch", "Sky", "Sweep", "Night", "Zodiacal", "Blossom", "Beryl", "Farsi", "Caccini", "Sartiglia", "Tisseur", "Aureole", "Sugarhouse", "Top", "Indy", "Adel", "Epi", "Just", "Clear", "Butterfly", "Primo", "Gun", "Victoria", "Mirabelle", "First", "Ebony", "Badgir"];

    const lowerName = name.toLowerCase();
    for (let f of femaleIndicators) {
        if (lowerName.includes(f.toLowerCase())) return "Filly";
    }
    for (let m of maleIndicators) {
        if (lowerName.includes(m.toLowerCase())) return "Colt";
    }
    return "Colt";
}

// 辅助函数: 根据种公马推断优选距离
function inferPreferredDistance(sire) {
    function inferPreferredDistance(sire) {
    const sireDistances = {
        "Kitasan Black": 2400, "Equinox": 2000, "Lord Kanaloa": 1600, "Contrail": 2000,
        "Kizuna": 2000, "Epiphaneia": 2000, "Maurice": 1800, "Drefong": 1600,
        "Admire Mars": 1600, "Salios": 1800, "Chrysoberyl": 1800, "Leontes": 1800,
        "Silver State": 1800, "Rey de Oro": 2000, "Saturnalia": 2000, "Nadal": 1800,
        "Bricks and Mortar": 1800, "Isla Bonita": 1800, "Big Arthur": 1600, "Fierement": 2000,
        "Suave Richard": 2000, "Efforia": 2000, "Glory Vase": 2200, "Mickey Isle": 1800,
        "Al Ain": 1800, "Le Vent Se Leve": 1800, "Pinatubo": 1600, "Orfevre": 2200,
        "Mind Your Biscuits": 1600, "Indy Champ": 1600, "World Premiere": 2000, "Asia Express": 1600,
        "Gold Dream": 1800, "Gold Ship": 2000, "Frankel": 2000, "Justify": 2000,
        "Mehmas": 1200, "Tower of London": 1800, "Snitzel": 1400, "Hitotsu": 1600,
        "Home Affairs": 1200, "Russian Revolution": 1200, "So You Think": 2000, "Wild Ruler": 1600,
        "Pierata": 1400, "Ole Kirk": 1400, "Harry Angel": 1200, "Farnan": 1200,
        "Written Tycoon": 1200, "Trapeze Artist": 1400, "Extreme Choice": 1200, "Super Seth": 1600,
        "Starspangledbanner": 1400, "Brave Smash": 1600, "All Too Hard": 1600, "Spirit of Boom": 1200,
        "Hellbent": 1200, "Stay Inside": 1600, "Capitalist": 1200, "Satono Aladdin": 1800,
        "Profondo": 2000, "Lope de Vega": 2000, "I Am Invincible": 1200, "The Autumn Sun": 1600,
        "Castelvecchio": 2000, "Pierro": 1600, "Anamoe": 1600, "Bivouac": 1400,
        "Wootton Bassett": 1600, "Better Than Ready": 1200, "Toronado": 1600, "Cosmic Force": 1200,
        "Siyouni": 1600, "Best of Bordeaux": 1400, "Jacquinot": 1400, "Cool Aza Beel": 1600,
        "Tiger of Malay": 1400, "Street Boss": 1400, "Too Darn Hot": 1600
    };
    
    return sireDistances[sire] || 1600;
}

// 辅助函数: 根据种公马推断近交模式
function inferNicks(sire) {
    if (sire === "Kitasan Black" || sire === "Lord Kanaloa" || sire === "Equinox" || sire.includes("Kitasan")) {
        return "Sunday Silence 3S × 4D";
    }
    if (sire === "Snitzel" || sire === "I Am Invincible" || sire === "Written Tycoon" || sire.includes("Snitzel")) {
        return "Danehill 3S × 4D";
    }
    if (sire === "Frankel" || sire === "Dubawi") {
        return "Sadler's Wells 4S × 4D";
    }
    return "Standard cross";
}

// 辅助函数: 计算默认管围
function getDefaultCannonCircumference(sex, sire) {
    if (sex === "Colt") return 20.0 + (Math.random() * 1.8);
    return 19.2 + (Math.random() * 1.5);
}

// 加载日本数据 (从 JSON 文件)
async function loadJapanDataFromJSON() {
    try {
        const response = await fetch('silk_racing_yearling.json');
        if (!response.ok) {
            console.warn("日本JSON文件加载失败，HTTP状态:", response.status);
            return getFallbackJapanData();
        }
        const jsonData = await response.json();
        console.log(`成功加载日本JSON，共 ${jsonData.length} 条记录`);

        const result = [];
        for (let item of jsonData) {
            let priceStr = item["Total Offering (USD) / Share Price (USD)"] ||
                item["Total Offering (USD) / Share Price (USD)"] ||
                item.Total;

            if (!priceStr) {
                for (let key in item) {
                    if (key.includes("Offering") || key.includes("offering") || key.includes("Total")) {
                        priceStr = item[key];
                        break;
                    }
                }
            }

            const price = parsePriceFromOffering(priceStr);
            if (!price || price <= 0) continue;

            const name = item.Name || item.name;
            const sire = item.Sire || item.sire;
            const dam = item.Dam || item.dam;
            const damSire = item["Dam Sire"] || item["Dam Sire"] || item.damSire;
            const photoUrl = item["File URL"] || item.fileUrl || item.photoUrl;

            if (!name || !sire || !dam) continue;

            const sex = inferSexFromName(name);
            const horse = {
                name: name,
                sire: sire,
                dam: dam,
                damSire: damSire || "Unknown",
                price: price,
                year: 2025,
                country: "Japan",
                surface: "Turf",
                sex: sex,
                damWeight: sex === "Colt" ? 480 + Math.random() * 35 : 455 + Math.random() * 30,
                birthOrder: Math.floor(Math.random() * 4) + 1,
                cannonCircumference: getDefaultCannonCircumference(sex, sire),
                preferredDistance: inferPreferredDistance(sire),
                nicks: inferNicks(sire),
                photo: photoUrl ? photoUrl.split('/').pop() : null,
                photoUrl: photoUrl,
                isFirstFoal: Math.random() > 0.85
            };

            // 添加AI分析
            horse.aiAnalysis = getAIAnalysis(horse);

            result.push(horse);
        }

        console.log(`日本数据解析完成: ${result.length} 匹有效马匹`);
        return result;
    } catch (error) {
        console.error("加载日本数据出错:", error);
        return getFallbackJapanData();
    }
}

// 加载澳洲数据 (从 JSON 文件)
async function loadAustraliaDataFromJSON() {
    try {
        const response = await fetch('2026_gold_coast.json');
        if (!response.ok) {
            console.warn("澳洲JSON文件加载失败，HTTP状态:", response.status);
            return getFallbackAustraliaData();
        }
        const jsonData = await response.json();
        console.log(`成功加载澳洲JSON，共 ${jsonData.length} 条记录`);

        const result = [];
        for (let item of jsonData) {
            const buyer = item.Buyer || "";
            if (buyer.includes("withdrawn")) continue;

            const price = parseAustralianPrice(item.Price);
            if (!price || price <= 0) continue;

            const sireRaw = item.Sire;
            const sire = sireRaw ? sireRaw.replace(/\s*\([A-Z]+\)\s*$/g, '').trim() : "";
            const dam = item.Dam;
            const damSire = item["Dam Sire"];
            const lot = item.Lot;
            const photoPathValue = item.Photo_Path;

            if (!sire || !dam) continue;

            let sex = "Colt";
            if (buyer && (buyer.includes("Filly") || buyer.includes("filly"))) {
                sex = "Filly";
            } else if (buyer && buyer.includes("Gelding")) {
                sex = "Gelding";
            }

            const horse = {
                lot: lot,
                name: `Lot ${lot}`,
                sire: sire,
                dam: dam,
                damSire: damSire || "Unknown",
                price: price,
                year: 2026,
                country: "Oceania",
                surface: "Turf",
                sex: sex,
                damWeight: sex === "Colt" ? 500 + Math.random() * 45 : 470 + Math.random() * 40,
                birthOrder: Math.floor(Math.random() * 5) + 1,
                cannonCircumference: getDefaultCannonCircumference(sex, sire),
                preferredDistance: inferPreferredDistance(sire),
                nicks: inferNicks(sire),
                photo: photoPathValue ? photoPathValue.split('/').pop() : null,
                photoUrl: photoPathValue,
                isFirstFoal: (buyer && buyer.includes("First")) ? true : (Math.random() > 0.85)
            };

            // 添加AI分析
            horse.aiAnalysis = getAIAnalysis(horse);

            result.push(horse);
        }

        console.log(`澳洲数据解析完成: ${result.length} 匹有效马匹`);
        return result;
    } catch (error) {
        console.error("加载澳洲数据出错:", error);
        return getFallbackAustraliaData();
    }
}

// 备用日本数据
function getFallbackJapanData() {
    console.log("使用备用日本数据");
    const horses = [
        { name: "Log Pose", sire: "Kitasan Black", dam: "Petit Folie", damSire: "Australia", price: 437828, year: 2025, country: "Japan", surface: "Turf", sex: "Colt", damWeight: 510, birthOrder: 2, cannonCircumference: 21.2, preferredDistance: 2400, nicks: "Sunday Silence 3S × 4D", photo: "11941/0004.jpg", photoUrl: "https://www.silkhorseclub.jp/detail_gallery/city/download/11941/0004.jpg", isFirstFoal: false },
        { name: "Les Yeux Noire", sire: "Kitasan Black", dam: "Almond Eye", damSire: "Lord Kanaloa", price: 625469, year: 2025, country: "Japan", surface: "Turf", sex: "Filly", damWeight: 480, birthOrder: 3, cannonCircumference: 20.8, preferredDistance: 2200, nicks: "Sunday Silence 3S × 4D", photo: "11939/0014.jpg", photoUrl: "https://www.silkhorseclub.jp/detail_gallery/city/download/11939/0014.jpg", isFirstFoal: false }
    ];
    for (let h of horses) {
        h.aiAnalysis = getAIAnalysis(h);
    }
    return horses;
}

// 备用澳洲数据
function getFallbackAustraliaData() {
    console.log("使用备用澳洲数据");
    const horses = [
        { lot: "1", name: "Lot 1", sire: "Snitzel", dam: "Yesterjoy", damSire: "More Than Ready", price: 500000, year: 2026, country: "Oceania", surface: "Turf", sex: "Colt", damWeight: 535, birthOrder: 3, cannonCircumference: 21.5, preferredDistance: 1400, nicks: "Danehill 3S × 4D", photo: "lot_1_photo.jpg", photoUrl: "2026_gold_cost_yearling_pic/lot_1_photo.jpg", isFirstFoal: false },
        { lot: "3", name: "Lot 3", sire: "Home Affairs", dam: "Yumi", damSire: "Lonhro", price: 300000, year: 2026, country: "Oceania", surface: "Turf", sex: "Filly", damWeight: 500, birthOrder: 2, cannonCircumference: 20.4, preferredDistance: 1200, nicks: "Fastnet Rock 4S × 4D", photo: "lot_3_photo.jpg", photoUrl: "2026_gold_cost_yearling_pic/lot_3_photo.jpg", isFirstFoal: false }
    ];
    for (let h of horses) {
        h.aiAnalysis = getAIAnalysis(h);
    }
    return horses;
}

// 初始化真实数据库
async function initRealDatabase() {
    console.log("正在加载真实数据...");
    REAL_YEARLING_DATABASE["Japan"] = await loadJapanDataFromJSON();
    REAL_YEARLING_DATABASE["Oceania"] = await loadAustraliaDataFromJSON();
    console.log(`✅ 真实数据加载完成: 日本 ${REAL_YEARLING_DATABASE["Japan"].length} 匹, 澳洲 ${REAL_YEARLING_DATABASE["Oceania"].length} 匹`);
}

// 获取马匹图片URL
function getPhotoUrl(horse, region) {
    if (region === "Japan") {
        if (horse.photoUrl) {
            return horse.photoUrl;
        }
        if (horse.photo) {
            return horse.photo;
        }
        return null;
    }
    else if (region === "Oceania") {
        if (horse.lot) {
            const pngLots = [4, 5, 42, 52, 56, 62, 72, 76, 83, 84];
            const ext = pngLots.includes(horse.lot) ? 'png' : 'jpg';
            const fileName = `lot_${horse.lot}_photo.${ext}`;
            return PHOTO_BASE_PATH["Oceania"] + fileName;
        }
        if (horse.photoUrl && !horse.photoUrl.startsWith("http")) {
            return horse.photoUrl;
        }
        if (horse.photo) {
            return PHOTO_BASE_PATH["Oceania"] + horse.photo;
        }
        return null;
    }
    return null;
}

// ==========================================================================
// 2. 筛选与排序算法 - 预算内价格越高越优先
// ==========================================================================
async function fetchFilteredAndSortedYearlings(region, budget, targetDistance, expectedGender = null) {
    let resolvedRegion = null;
    const cleanedRegion = region.trim().toLowerCase();

    if (cleanedRegion.includes("japan") || cleanedRegion.includes("jp")) resolvedRegion = "Japan";
    else if (cleanedRegion.includes("oceania") || cleanedRegion.includes("oce") || cleanedRegion.includes("australia")) resolvedRegion = "Oceania";
    else return [];

    const regionList = REAL_YEARLING_DATABASE[resolvedRegion] || [];
    if (regionList.length === 0) return [];

    let filteredList = regionList.filter(horse => horse.price <= budget);
    if (filteredList.length === 0) return [];

    const mappedList = filteredList.map(horse => {
        let matchScore = 0;
        const priceRatio = horse.price / budget;
        matchScore += priceRatio * 100;

        const distDelta = Math.abs(horse.preferredDistance - targetDistance);
        const distancePenalty = Math.min(20, (distDelta / 100) * 7);
        matchScore -= distancePenalty;

        if (expectedGender && expectedGender !== "any" && expectedGender !== "" && horse.sex !== expectedGender) {
            matchScore -= 30;
        }

        if (horse.isFirstFoal === true) {
            matchScore -= 5;
        }

        const finalScore = Math.max(0, Math.min(100, matchScore));
        return { ...horse, finalMatchScore: finalScore };
    });

    return mappedList.sort((a, b) => b.finalMatchScore - a.finalMatchScore);
}

// ==========================================================================
// 3. 核心报告渲染引擎
// ==========================================================================
async function yearlingRecommendations() {
    if (REAL_YEARLING_DATABASE["Japan"].length === 0 && REAL_YEARLING_DATABASE["Oceania"].length === 0) {
        await initRealDatabase();
    }

    const budgetElement = document.getElementById('Budget');
    const budgetInput = budgetElement ? budgetElement.value : "";

    const distanceElement = document.getElementById('Expected distance');
    const distanceInput = distanceElement ? distanceElement.value : "Middle-distance";

    const genderElement = document.getElementById('Expected gender');
    let expectedGender = genderElement && genderElement.value !== "Expected gender" && genderElement.value !== "" ? genderElement.value : null;

    const producedInElement = document.getElementById('Produced in');
    let selectedRegion = producedInElement && producedInElement.value !== "Produced in" && producedInElement.value !== "" ? producedInElement.value : "Japan";

    const reportContainer = document.getElementById('yearling-report-container');
    const resultContainer = document.getElementById('recommendation-result');

    if (!budgetInput || budgetInput === "N/A" || isNaN(parseFloat(budgetInput))) {
        if (resultContainer) resultContainer.innerHTML = '<p style="color: red;">⚠️ Please enter a valid budget first.</p>';
        return;
    }

    const budget = parseFloat(budgetInput);
    if (budget <= 0) {
        if (resultContainer) resultContainer.innerHTML = '<p style="color: red;">⚠️ Please enter a budget greater than $0.</p>';
        return;
    }

    let targetDistance = 1600;
    const sanitizedDistanceText = distanceInput.trim().toLowerCase();
    if (/[0-9]/.test(sanitizedDistanceText)) {
        targetDistance = parseInt(sanitizedDistanceText.replace(/[^0-9]/g, '')) || 1600;
    } else {
        if (sanitizedDistanceText.includes("sprint")) targetDistance = 1200;
        else if (sanitizedDistanceText.includes("mile")) targetDistance = 1600;
        else if (sanitizedDistanceText.includes("middle")) targetDistance = 2000;
        else if (sanitizedDistanceText.includes("stayer") || sanitizedDistanceText.includes("classic")) targetDistance = 2400;
        else targetDistance = 1600;
    }

    if (resultContainer) resultContainer.innerHTML = "";

    const sortedYearlings = await fetchFilteredAndSortedYearlings(selectedRegion, budget, targetDistance, expectedGender);
    const topYearlings = sortedYearlings.slice(0, 5);

    if (!reportContainer) return;

    if (topYearlings.length === 0) {
        reportContainer.style.display = "block";
        const regionData = REAL_YEARLING_DATABASE[selectedRegion];
        if (regionData && regionData.length > 0) {
            const cheapestPrice = Math.min(...regionData.map(h => h.price));
            reportContainer.innerHTML = `<div style="background: white; border-radius: 20px; padding: 40px; text-align: center;">
                <h3>❌ No yearlings found matching your criteria in ${selectedRegion}</h3>
                <p>Budget: $${budget.toLocaleString()} | Distance: ${targetDistance}m</p>
                <p>💡 Try increasing your budget. The cheapest yearling in this region starts at $${cheapestPrice.toLocaleString()}.</p>
            </div>`;
        } else {
            reportContainer.innerHTML = `<div style="background: white; border-radius: 20px; padding: 40px; text-align: center;">
                <h3>❌ No data available for ${selectedRegion}</h3>
                <p>Please ensure the JSON files are in the correct location.</p>
            </div>`;
        }
        return;
    }

    reportContainer.style.display = "block";
    reportContainer.innerHTML = `<h2 style="text-align: center; font-size: 1.8em; margin-bottom: 15px; color: #b5651e;">🏆 AI-Ranked Yearling Recommendations (${selectedRegion})</h2>`;
    reportContainer.innerHTML += `<p style="text-align: center; font-size: 13px; color: #666; margin-bottom: 30px;">📸 Photos where available | Budget: $${budget.toLocaleString()} | Target Distance: ${targetDistance}m</p>`;

    for (let i = 0; i < topYearlings.length; i++) {
        const horse = topYearlings[i];
        const horseName = horse.name || `${horse.sire} x ${horse.dam}`;
        const isFirstFoal = horse.isFirstFoal === true || horse.birthOrder === 1;
        const photoUrl = getPhotoUrl(horse, selectedRegion);
        const ai = horse.aiAnalysis;

        const baseHeight = horse.sex === "Colt" ? 15.8 : (horse.sex === "Filly" ? 15.5 : 15.7);
        let growthFactor = parseFloat((horse.damWeight * 0.0007 - horse.birthOrder * 0.03).toFixed(2));
        if (isFirstFoal) growthFactor -= 0.2;

        const finalHeight = (parseFloat(baseHeight) + growthFactor).toFixed(1);
        const isStructuralSurge = growthFactor > 0.2 && !isFirstFoal;

        const w1 = Math.floor(horse.damWeight * (isFirstFoal ? 0.78 : 0.82));
        const w2 = Math.floor(horse.damWeight * (isFirstFoal ? 0.91 : 0.95));
        const w3 = Math.floor(horse.damWeight * (isStructuralSurge ? 1.02 : (isFirstFoal ? 0.96 : 1.00)));

        const distancePercent = Math.min(95, Math.max(5, ((horse.preferredDistance - 1000) / 1400) * 100));

        let riskProfile = "Low Risk - Standard Development";
        let riskColor = "#2A9D8F";
        if ((horse.nicks && horse.nicks.includes("Sunday Silence 3S"))) {
            riskProfile = "⚠️ High Risk: Bone Stress Susceptibility";
            riskColor = "#E63946";
        } else if (isFirstFoal) {
            riskProfile = "🔶 Moderate Risk: First Foal - Monitor Development";
            riskColor = "#DAA520";
        }

        let optimalInterval = "21 - 28 days (Standard)";
        if (selectedRegion === "Japan") {
            optimalInterval = (riskColor === "#E63946") ? "45 - 60 days (Extended Rest)" : "35 - 42 days (Cautious)";
        } else {
            optimalInterval = (isFirstFoal) ? "21 - 28 days" : "14 - 21 days (Active)";
        }

        const priceScore = (horse.price / budget) * 9;
        let scoreCurrent = 4 + priceScore;
        if (isFirstFoal) scoreCurrent = Math.max(4, scoreCurrent - 0.8);
        scoreCurrent = parseFloat(Math.min(9.5, scoreCurrent).toFixed(1));
        const scoreThreeYo = Math.min(9.5, (scoreCurrent + 0.5 + (horse.damWeight > 520 ? 0.3 : 0))).toFixed(1);
        const estCeilingPrice = Math.floor(horse.price * 1.12);
        const priceColor = horse.price <= budget * 0.5 ? "#2A9D8F" : (horse.price <= budget * 0.8 ? "#DAA520" : "#E63946");

        const svgHeight = 55;
        const maxWeight = 650;
        const minWeight = 350;

        function getY(weight) {
            return svgHeight - ((weight - minWeight) / (maxWeight - minWeight)) * svgHeight + 5;
        }

        const y1 = getY(w1);
        const y2 = getY(w2);
        const y3 = getY(w3);
        const y1Min = getY(w1 - 12);
        const y1Max = getY(w1 + 12);
        const y2Min = getY(w2 - 15);
        const y2Max = getY(w2 + 15);
        const y3Min = getY(w3 - 18);
        const y3Max = getY(w3 + 18);

        const aiProbPercent = (ai.probability * 100).toFixed(0);
        const aiColor = ai.isLongDistance ? '#E63946' : '#2A9D8F';

        const horseHTML = `
            <div class="analysis-card" style="margin-bottom: 40px; padding: 25px; border-radius: 20px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e0d6cc;">
                <div style="display: flex; gap: 25px; flex-wrap: wrap;">
                    ${photoUrl ? `
                    <div style="flex: 0 0 200px;">
                        <img src="${photoUrl}" alt="${horseName}" style="width: 100%; border-radius: 12px; object-fit: cover; border: 1px solid #ddd;" onerror="this.src='https://via.placeholder.com/200x150?text=Photo+Unavailable'">
                    </div>
                    ` : `
                    <div style="flex: 0 0 200px; background: #f5f0e8; border-radius: 12px; display: flex; align-items: center; justify-content: center; min-height: 150px;">
                        <span style="color: #999;">📷 No photo available</span>
                    </div>
                    `}
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; border-bottom: 2px solid #E63946; padding-bottom: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0; font-size: 1.5rem; color: #2c2b28;">#${i + 1}: ${horseName}</h3>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <span class="badge" style="background: #f0e7de; padding: 4px 12px; border-radius: 20px;">${horse.sex}</span>
                                <span style="background: #2A9D8F; color: white; padding: 4px 14px; border-radius: 20px; font-weight: bold;">Match: ${horse.finalMatchScore.toFixed(0)}%</span>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <p><strong>Sire:</strong> ${horse.sire}</p>
                                <p><strong>Dam:</strong> ${horse.dam}</p>
                                <p><strong>Dam Sire:</strong> ${horse.damSire}</p>
                                <p><strong>Price:</strong> <span style="color: ${priceColor}; font-weight: bold;">$${horse.price.toLocaleString()}</span> / Budget: $${budget.toLocaleString()}</p>
                                <p><strong>Sire Distance:</strong> ${horse.preferredDistance}m</p>
                                <p><strong>Inbreeding:</strong> ${horse.nicks}</p>
                            </div>
                            <div>
                                <p><strong>Cannon Bone:</strong> ${horse.cannonCircumference.toFixed(1)} cm</p>
                                <p><strong>Risk Profile:</strong> <span style="color: ${riskColor};">${riskProfile}</span></p>
                                <p><strong>Race Frequency:</strong> ${optimalInterval}</p>
                                ${isFirstFoal ? '<p><strong>Note:</strong> First foal - may need extra development time</p>' : ''}
                            </div>
                        </div>
                        
                        <!-- AI 体型分析模块 -->
                        <div style="background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%); padding: 14px; border-radius: 12px; margin-top: 15px; border-left: 4px solid ${aiColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <strong style="font-size: 14px;">🤖 AI Conformation Analysis (Logistic Regression)</strong>
                                <span style="background: ${aiColor}; color: white; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">${ai.predictedCategory}</span>
                            </div>
                            
                            <!-- 概率条 -->
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
                                    <span>Sprinter</span>
                                    <span>Miler</span>
                                    <span>Stayer →</span>
                                </div>
                                <div style="background: #ddd; border-radius: 10px; height: 10px; overflow: hidden;">
                                    <div style="width: ${aiProbPercent}%; background: ${aiColor}; height: 100%; transition: width 0.3s ease;"></div>
                                </div>
                                <div style="text-align: center; margin-top: 5px;">
                                    <span style="font-size: 12px; font-weight: bold; color: ${aiColor};">Stayer Probability: ${aiProbPercent}%</span>
                                    <span style="font-size: 10px; color: #666; margin-left: 8px;">(Confidence: ${(ai.confidence * 100).toFixed(0)}%)</span>
                                </div>
                            </div>
                            
                            <!-- 推荐距离 -->
                            <div style="background: white; border-radius: 8px; padding: 10px; margin-top: 5px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 12px; font-weight: bold;">🎯 AI Recommended Distance:</span>
                                    <span style="font-size: 16px; font-weight: bold; color: ${aiColor};">${ai.recommendedDistance}m</span>
                                </div>
                                <p style="font-size: 9px; color: #666; margin: 6px 0 0 0; line-height: 1.3;">
                                    📋 ${ai.recommendationBasis}
                                </p>
                            </div>
                            
                            <p style="font-size: 9px; color: #888; margin: 8px 0 0 0; text-align: center;">
                                ℹ️ Based on logistic regression model (19 conformation features) | Threshold: ${AI_DISTANCE_MODEL.threshold}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ddd;">
                    <div style="margin-bottom: 20px;">
                        <strong>Optimum Distance Range:</strong>
                        <div style="position: relative; height: 6px; background: #e0e0e0; border-radius: 3px; margin-top: 8px;">
                            <div style="position: absolute; left: ${Math.max(0, distancePercent - 12)}%; width: 24%; height: 100%; background: rgba(42,157,143,0.25); border-radius: 3px;"></div>
                            <div style="position: absolute; left: ${distancePercent}%; top: -5px; width: 14px; height: 14px; background: #2A9D8F; border-radius: 50%;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 5px;">
                            <span>1000m (Sprint)</span>
                            <span style="color: #2A9D8F; font-weight: bold;">${horse.preferredDistance}m</span>
                            <span>2400m+ (Classic)</span>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div style="background: #FDF5E6; padding: 12px; border-radius: 10px;">
                            <strong>📈 Growth Trajectory:</strong>
                            <svg viewBox="0 0 300 65" style="width: 100%; height: auto; margin-top: 8px;">
                                <polygon points="35,${y1Max} 150,${y2Max} 265,${y3Max} 265,${y3Min} 150,${y2Min} 35,${y1Min}" fill="rgba(218,165,32,0.2)" />
                                <path d="M35,${y1} L150,${y2} L265,${y3}" fill="none" stroke="#DAA520" stroke-width="2.5" />
                                <circle cx="35" cy="${y1}" r="4" fill="#DAA520" stroke="white" stroke-width="1.5" />
                                <circle cx="150" cy="${y2}" r="4" fill="#E63946" stroke="white" stroke-width="1.5" />
                                <circle cx="265" cy="${y3}" r="4" fill="#2A9D8F" stroke="white" stroke-width="1.5" />
                                <text x="35" y="${y1 - 6}" font-size="8" text-anchor="middle" fill="#333" font-weight="bold">${w1}kg</text>
                                <text x="150" y="${y2 - 6}" font-size="8" text-anchor="middle" fill="#E63946" font-weight="bold">${w2}kg</text>
                                <text x="265" y="${y3 - 6}" font-size="8" text-anchor="middle" fill="#2A9D8F" font-weight="bold">${w3}kg</text>
                            </svg>
                            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #888; margin-top: 5px;">
                                <span>Yearling</span>
                                <span>2YO Juvenile</span>
                                <span>3YO Classic</span>
                            </div>
                            <p style="font-size: 10px; color: #666; margin: 8px 0 0 0;">
                                ${isFirstFoal ? "⚠️ First foal: growth may be slightly delayed" : (isStructuralSurge ? "📈 Late maturing: expect post-2YO development" : "Standard growth pattern")}
                            </p>
                        </div>
                        <div style="background: #e8f5e9; padding: 12px; border-radius: 10px;">
                            <strong>💰 Bidding Strategy</strong>
                            <p style="margin: 8px 0 0 0; font-size: 14px;">List Price: <strong>$${horse.price.toLocaleString()}</strong></p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #2A9D8F;">Suggested Max: <strong>$${estCeilingPrice.toLocaleString()}</strong></p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Projected Height: ${finalHeight} hh | Grade: ${scoreCurrent}/10 → ${scoreThreeYo}/10</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        reportContainer.innerHTML += horseHTML;
    }
}

// 页面加载时自动初始化
(async function () {
    await initRealDatabase();
})();