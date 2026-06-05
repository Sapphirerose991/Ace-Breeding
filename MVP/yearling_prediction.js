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
    const sireDistance = horse.preferredDistanceAvg || 1600;
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

    // 使用平均距离进行判断
    const sireDistanceAvg = horse.preferredDistanceAvg || 1600;
    const sireDistanceStr = horse.preferredDistance || "1600";

    // 推荐距离逻辑
    let recommendedDistance;

    if (isLongDistance) {
        if (sireDistanceAvg >= 2000) {
            // 解析原始区间
            if (sireDistanceStr.includes("-")) {
                const maxDist = sireDistanceStr.split("-")[1];
                recommendedDistance = `2000 - ${maxDist}`;
            } else {
                recommendedDistance = `2000 - ${sireDistanceStr}`;
            }
        } else {
            recommendedDistance = `2000`;
        }
    } else {
        recommendedDistance = sireDistanceStr;
    }

    return {
        isLongDistance: isLongDistance,
        predictedCategory: isLongDistance ? "Stayer (≥2000m)" : "Sprinter/Miler (<2000m)",
        recommendedDistance: recommendedDistance,
        sireDistance: sireDistanceStr
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
    const sireDistances = {
        "Kitasan Black": "2000-3200",
        "Equinox": "2000-2500",
        "Lord Kanaloa": "1200-1600",
        "Contrail": "2000-3000",
        "Kizuna": "2400",
        "Epiphaneia": "2400-3000",
        "Maurice": "1600-2000",
        "Drefong": "1200-1400",
        "Admire Mars": "1600",
        "Salios": "1600",
        "Chrysoberyl": "1800-2000",
        "Leontes": "1600",
        "Silver State": "1600-2000",
        "Rey de Oro": "2000-2400",
        "Saturnalia": "2000",
        "Nadal": "1800",
        "Bricks and Mortar": "1600-2400",
        "Isla Bonita": "2000",
        "Big Arthur": "1200",
        "Fierement": "3000-3200",
        "Suave Richard": "2000-2400",
        "Efforia": "2000-2500",
        "Glory Vase": "2400",
        "Mickey Isle": "1600",
        "Al Ain": "2000",
        "Le Vent Se Leve": "1600-2000",
        "Pinatubo": "1400-1600",
        "Orfevre": "2000-3000",
        "Mind Your Biscuits": "1200",
        "Indy Champ": "1600",
        "World Premiere": "3000-3200",
        "Asia Express": "1600",
        "Gold Dream": "1600-2000",
        "Gold Ship": "2000-3200",
        "Frankel": "1400-2100",
        "Justify": "1600-2400",
        "Mehmas": "1200",
        "Tower of London": "1200-1600",
        "Snitzel": "1100",
        "Hitotsu": "1600-2500",
        "Home Affairs": "1000-1200",
        "Russian Revolution": "1100",
        "So You Think": "1400-2100",
        "Wild Ruler": "1000",
        "Pierata": "1400",
        "Ole Kirk": "1400-1600",
        "Harry Angel": "1200",
        "Farnan": "1200",
        "Written Tycoon": "1200",
        "Trapeze Artist": "1200-1400",
        "Extreme Choice": "1000-1200",
        "Super Seth": "1600",
        "Starspangledbanner": "1100-1600",
        "Brave Smash": "1200-1400",
        "All Too Hard": "1400-1600",
        "Spirit of Boom": "1200-1350",
        "Hellbent": "1200",
        "Stay Inside": "1200",
        "Capitalist": "1200",
        "Satono Aladdin": "1600",
        "Profondo": "2000",
        "Lope de Vega": "1600-2100",
        "I Am Invincible": "1100-1200",
        "The Autumn Sun": "1400-2000",
        "Castelvecchio": "1600-2000",
        "Pierro": "1200-1600",
        "Anamoe": "1000-2000",
        "Bivouac": "1200-1400",
        "Wootton Bassett": "1400",
        "Better Than Ready": "1200",
        "Toronado": "1600",
        "Cosmic Force": "1200",
        "Siyouni": "1400",
        "Best of Bordeaux": "1100-1200",
        "Jacquinot": "1200-1400",
        "Cool Aza Beel": "1200",
        "Tiger of Malay": "1200-1400",
        "Street Boss": "1200-1400",
        "Too Darn Hot": "1400-1600"
    };
    return sireDistances[sire] || "1600";
}

// 辅助函数: 根据种公马和性别获取优选距离（用于计算）
function getPreferredDistanceForHorse(sire, sex) {
    const distanceStr = inferPreferredDistance(sire);
    let minDist, maxDist;

    // 解析距离区间
    if (distanceStr.includes("-")) {
        const parts = distanceStr.split("-");
        minDist = parseInt(parts[0]);
        maxDist = parseInt(parts[1]);
    } else {
        // 单值距离
        minDist = maxDist = parseInt(distanceStr);
    }

    // 根据性别调整
    if (sex === "Filly") {
        // Filly 的最大距离是 sire 的 0.8 倍
        maxDist = Math.floor(maxDist * 0.8);
        minDist = Math.floor(minDist * 0.8);
        if (minDist === maxDist) {
            return `${maxDist}`;
        }
        return `${minDist}-${maxDist}`;
    }

    // Colt 返回原始区间
    return distanceStr;
}

// 获取用于匹配计算的平均距离（数字）
function getAverageDistanceForMatching(sire, sex) {
    const distanceStr = getPreferredDistanceForHorse(sire, sex);

    if (distanceStr.includes("-")) {
        const parts = distanceStr.split("-");
        const minDist = parseInt(parts[0]);
        const maxDist = parseInt(parts[1]);
        // 返回区间中点用于匹配计算
        return Math.floor((minDist + maxDist) / 2);
    } else {
        return parseInt(distanceStr);
    }
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
                preferredDistance: getPreferredDistanceForHorse(sire, sex),
                preferredDistanceAvg: getAverageDistanceForMatching(sire, sex),
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
                preferredDistance: getPreferredDistanceForHorse(sire, sex),
                preferredDistanceAvg: getAverageDistanceForMatching(sire, sex),
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
        { name: "Log Pose", sire: "Kitasan Black", dam: "Petit Folie", damSire: "Australia", price: 437828, year: 2025, country: "Japan", surface: "Turf", sex: "Colt", damWeight: 510, birthOrder: 2, cannonCircumference: 21.2, preferredDistance: "2400", preferredDistanceAvg: 2400, nicks: "Sunday Silence 3S × 4D", photo: "11941/0004.jpg", photoUrl: "https://www.silkhorseclub.jp/detail_gallery/city/download/11941/0004.jpg", isFirstFoal: false },
        { name: "Les Yeux Noire", sire: "Kitasan Black", dam: "Almond Eye", damSire: "Lord Kanaloa", price: 625469, year: 2025, country: "Japan", surface: "Turf", sex: "Filly", damWeight: 480, birthOrder: 3, cannonCircumference: 20.8, preferredDistance: "1920", preferredDistanceAvg: 1920, nicks: "Sunday Silence 3S × 4D", photo: "11939/0014.jpg", photoUrl: "https://www.silkhorseclub.jp/detail_gallery/city/download/11939/0014.jpg", isFirstFoal: false }
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
        { lot: "1", name: "Lot 1", sire: "Snitzel", dam: "Yesterjoy", damSire: "More Than Ready", price: 500000, year: 2026, country: "Oceania", surface: "Turf", sex: "Colt", damWeight: 535, birthOrder: 3, cannonCircumference: 21.5, preferredDistance: "1100", preferredDistanceAvg: 1100, nicks: "Danehill 3S × 4D", photo: "lot_1_photo.jpg", photoUrl: "2026_gold_cost_yearling_pic/lot_1_photo.jpg", isFirstFoal: false },
        { lot: "3", name: "Lot 3", sire: "Home Affairs", dam: "Yumi", damSire: "Lonhro", price: 300000, year: 2026, country: "Oceania", surface: "Turf", sex: "Filly", damWeight: 500, birthOrder: 2, cannonCircumference: 20.4, preferredDistance: "800-960", preferredDistanceAvg: 880, nicks: "Fastnet Rock 4S × 4D", photo: "lot_3_photo.jpg", photoUrl: "2026_gold_cost_yearling_pic/lot_3_photo.jpg", isFirstFoal: false }
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
// 2. 筛选与排序算法 - 修复距离权重失效、实现按距离严选并按价格降序
// ==========================================================================
async function fetchFilteredAndSortedYearlings(region, budget, targetDistance) {
    let resolvedRegion = null;
    const cleanedRegion = region.trim().toLowerCase();

    if (cleanedRegion.includes("japan") || cleanedRegion.includes("jp")) resolvedRegion = "Japan";
    else if (cleanedRegion.includes("oceania") || cleanedRegion.includes("oce") || cleanedRegion.includes("australia")) resolvedRegion = "Oceania";
    else return [];

    const regionList = REAL_YEARLING_DATABASE[resolvedRegion] || [];
    if (regionList.length === 0) return [];

    // 第一步：初筛基础预算
    let filteredList = regionList.filter(horse => horse.price <= budget);
    if (filteredList.length === 0) return [];

    // 辅助函数：根据目标核心距离(targetDistance)，定义其严格能接受的距离上下限
    // Sprinter (1200m) -> 允许 1000m-1400m
    // Miler (1600m) -> 允许 1400m-1700m (包含部分长短英里)
    // Middle-distance (2000m) -> 允许 1700m-2300m
    // Stayer (2400m) -> 允许 2300m 及以上
    function isDistanceMatch(horseAvg, target) {
        if (target <= 1300) { // Sprinter
            return horseAvg >= 1000 && horseAvg <= 1450;
        } else if (target > 1300 && target <= 1700) { // Miler
            return horseAvg > 1400 && horseAvg <= 1750;
        } else if (target > 1700 && target <= 2100) { // Middle-distance
            return horseAvg > 1700 && horseAvg <= 2300;
        } else { // Stayer (>=2400m)
            return horseAvg >= 2300;
        }
    }

    // 第二步：打分与分类
    const mappedList = filteredList.map(horse => {
        const horseAvg = horse.preferredDistanceAvg || 1600;

        // 判断是否符合该类别的距离区间
        const perfectDistanceMatch = isDistanceMatch(horseAvg, targetDistance);

        // 核心得分设计逻辑：
        // 1. 如果距离吻合，基础分给 10000 分，确保跨维度压制不符合距离的马
        // 2. 在距离吻合的池子里，价格越高（越接近预算），附加分越高
        // 3. 如果是第一胎，扣减微量分数作为软性避坑参考
        let baseScore = perfectDistanceMatch ? 10000 : 0;

        // 距离的绝对偏离度连续惩罚（用于同级内的平滑微调）
        const distDelta = Math.abs(horseAvg - targetDistance);
        const distanceFineTunePenalty = (distDelta / 100) * 5;

        // 价格加成项：价格越高越靠前 (price / budget 范围在 0 ~ 1)
        const priceBonus = (horse.price / budget) * 100;

        let matchScore = baseScore + priceBonus - distanceFineTunePenalty;

        if (horse.isFirstFoal === true) {
            matchScore -= 2; // 微量惩罚
        }

        // 用于前端卡片显示的百分比：计算它在符合条件池子里的相对平滑百分比
        let displayMatchPercent = 50 + ((horse.price / budget) * 45);
        if (!perfectDistanceMatch) {
            displayMatchPercent = Math.max(10, 45 - (distDelta / 20)); // 不合距离的显示低匹配度
        }

        return {
            ...horse,
            finalMatchScore: matchScore, // 供底层逻辑精确定序使用
            displayMatchScore: Math.min(99, Math.floor(displayMatchPercent)) // 供前端卡片UI渲染漂亮数值
        };
    });

    // 第三步：排序（finalMatchScore高的在前）
    return mappedList.sort((a, b) => b.finalMatchScore - a.achScore ? b.finalMatchScore - a.finalMatchScore : b.finalMatchScore - a.finalMatchScore);
}

// ==========================================================================
// 3. 核心报告渲染引擎 (已修复 Sire's Distance 区间和绿条溢出问题)
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

        const avgDistance = horse.preferredDistanceAvg || 1600;

        // 🌟 核心修改 1：直接获取该父系的真实原始区间文本 (如 "2400-3000")，避免被 Filly 的逻辑缩减为单值
        const rawSireDistance = inferPreferredDistance(horse.sire);
        const displaySireDistanceRange = rawSireDistance.includes('m') ? rawSireDistance : rawSireDistance + 'm';

        // 计算进度条位置：0-2400m 映射到 0-100%
        let distancePercent = ((avgDistance - 1000) / 1400) * 100;
        distancePercent = Math.min(95, Math.max(5, distancePercent));

        // 🌟 核心修改 2：精密计算绿条左侧起点，防止向左溢出，并配合下方的 overflow: hidden 完美闭环
        let highlightLeft = Math.max(0, distancePercent - 12);
        if (highlightLeft + 24 > 100) {
            highlightLeft = 76; // 强行锁死最大右边界
        }

        const dotLeftPercent = distancePercent;

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

        const aiColor = ai.isLongDistance ? '#E63946' : '#2A9D8F';
        const displayDistance = horse.preferredDistance ? horse.preferredDistance + 'm' : 'N/A';

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
                                <span style="background: #2A9D8F; color: white; padding: 4px 14px; border-radius: 20px; font-weight: bold;">Match: ${horse.displayMatchScore}%</span>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <p><strong>Sire:</strong> ${horse.sire}</p>
                                <p><strong>Dam:</strong> ${horse.dam}</p>
                                <p><strong>Dam Sire:</strong> ${horse.damSire}</p>
                                <p><strong>Price:</strong> <span style="color: ${priceColor}; font-weight: bold;">$${horse.price.toLocaleString()}</span> / Budget: $${budget.toLocaleString()}</p>
                                <p><strong>Sire Distance:</strong> ${displaySireDistanceRange}</p>
                                <p><strong>Inbreeding:</strong> ${horse.nicks}</p>
                            </div>
                            <div>
                                <p><strong>Cannon Bone:</strong> ${horse.cannonCircumference.toFixed(1)} cm</p>
                                <p><strong>Risk Profile:</strong> <span style="color: ${riskColor};">${riskProfile}</span></p>
                                <p><strong>Race Frequency:</strong> ${optimalInterval}</p>
                                ${isFirstFoal ? '<p><strong>Note:</strong> First foal - may need extra development time</p>' : ''}
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 100%); padding: 14px; border-radius: 12px; margin-top: 15px; border-left: 4px solid ${aiColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <strong style="font-size: 14px;">🤖 AI Conformation Analysis</strong>
                                <span style="background: ${aiColor}; color: white; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">${ai.predictedCategory}</span>
                            </div>
                            
                            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="font-size: 12px; font-weight: bold;">🎯 AI Predicted Distance:</span>
                                    <span style="font-size: 16px; font-weight: bold; color: ${aiColor};">${ai.recommendedDistance}m</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 12px; font-weight: bold;">🐎 Sire's Distance Range:</span>
                                    <span style="font-size: 14px; font-weight: bold; color: #b5651e;">${displaySireDistanceRange}</span>
                                </div>
                            </div>
                            
                           <div style="margin-top: 8px;">
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px;">
                                <span>Sprinter</span>
                                <span>Miler</span>
                                <span>Stayer →</span>
                            </div>
                            <div style="position: relative; margin: 12px 12px;">
                                
                                <div style="height: 8px; background: #e0e0e0; border-radius: 4px; position: relative; overflow: hidden;">
                                    <div style="position: absolute; left: ${highlightLeft}%; width: 24%; height: 100%; background: rgba(42,157,143,0.3); border-radius: 4px;"></div>
                                </div>
                                
                                <div style="position: absolute; 
                                            left: ${dotLeftPercent}%; 
                                            top: 50%; 
                                            transform: translate(-50%, -50%); 
                                            width: 14px; 
                                            height: 14px; 
                                            background: #2A9D8F; 
                                            border-radius: 50%; 
                                            border: 2px solid white; 
                                            box-shadow: 0 1px 3px rgba(0,0,0,0.2); 
                                            z-index: 10;">
                                </div>
                                
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px; padding: 0 8px;">
                                <span>1000m</span>
                                <span style="color: #2A9D8F; font-weight: bold;">${displaySireDistanceRange}</span>
                                <span>2400m+</span>
                            </div>
                            <p style="font-size: 9px; color: #666; margin: 8px 0 0 0; text-align: center;">
                                📋 Optimum distance based on sire history: ${displaySireDistanceRange}
                            </p>
                        </div>
                                                    
                            <p style="font-size: 8px; color: #aaa; margin: 8px 0 0 0; text-align: center;">
                                Based on logistic regression model (19 conformation features)
                            </p>
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
            </div>
        `;
        reportContainer.innerHTML += horseHTML;
    }
}