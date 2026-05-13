// logic.js

function recommendStallions() {
    // 1. 获取用户输入
    const name = document.getElementById('mareName').value;
    const region = document.getElementById('region').value;
    const budget = document.getElementById('budget').value;

    // 2. 模拟数据库 
    const database = [
        { name: "Kitasan Black", region: "Japan", fee: 40000 },
        { name: "Frankel", region: "Europe", fee: 50000 },
        { name: "Baaeed", region: "Europe", fee: 45000 },
        { name: "Flightline", region: "USA", fee: 60000 },
        { name: "Flightline", region: "USA", fee: 60000 },
        { name: "Arabian Night", region: "USA", fee: 30000 },
        { name: "Audiable", region: "USA", fee: 10000 },
        { name: "Lord Kanaloa", region: "Japan", fee: 30000 },
        { name: "Gold Ship", region: "Japan", fee: 10000 },
        { name: "Pearl Secret", region: "Oceania", fee: 5000 },
        
    ];

    // 3. 简单的筛选逻辑 (比如根据地区和预算过滤)
    const matches = database.filter(s => s.region === region && s.fee <= (budget || 100000));

    // 4. 将结果反馈到页面
    const resultDiv = document.getElementById('recommendation-result');
    if (matches.length > 0) {
        let html = `<h4>Top Matches for ${name}:</h4><ul>`;
        matches.forEach(s => {
            html += `<li><strong>${s.name}</strong> - Fee: $${s.fee}</li>`;
        });
        html += `</ul>`;
        resultDiv.innerHTML = html;
    } else {
        resultDiv.innerHTML = "<p>No matches found for your criteria.</p>";
    }
// 显示隐藏的分析报告模块
    document.getElementById('analysis-report').style.display = "block";

    // 填充数据
    document.getElementById('display-age').innerText = age + " years old";
    document.getElementById('display-coi').innerText = (Math.random() * 4 + 1.2).toFixed(2) + "%";
    
    const maturities = ["Early (2yo)", "Standard (3yo)", "Late (4yo+)"];
    document.getElementById('display-maturity').innerText = maturities[Math.floor(Math.random() * maturities.length)];
    
    const distances = ["Sprint (1200m)", "Mile (1600m)", "Middle (2000m-2400m)"];
    document.getElementById('display-distance').innerText = distances[Math.floor(Math.random() * distances.length)];
    
    document.getElementById('display-physique').innerText = "Solid frame, strong shoulder alignment.";

    // 模拟搜索出的公马结果
    document.getElementById('recommendation-result').innerHTML = `
        <div style="background:#e8f5e9; padding:10px; border-radius:5px; border-left:5px solid #2A9D8F;">
            <strong>Top Match:</strong> Northern Dancer Line Stallion (Mock Result)
        </div>
    `;
}

