function predictBreeding() {
    const stallionName = document.getElementById('stallionName').value;
    if (!stallionName) {
        alert("Please enter a Stallion Name");
        return;
    }

    const report = document.getElementById('breeding-analysis-report');
    report.style.display = "block";
    report.className = "analysis-card"; // 确保应用了样式

    // 模拟数据生成
    const mockData = {
        sire: "Galileo",
        fee: document.getElementById('budget')?.value || "TBA",
        coiRisk: "Moderate (High COI in specific line-breeding)",
        nicks: "Danehill, Pivotal, Sunday Silence lines"
    };

    report.innerHTML = `
        <h3 class="red">AI Breeding Prediction: ${stallionName}</h3>
        
        <div class="two-columns">
            <div class="left">
                <h4 class="yellow">Comparison with Sire (${mockData.sire})</h4>
                <p><strong>Composition:</strong> More compact frame, higher muscle density.</p>
                <p><strong>Winning Distance:</strong> Shifted (-200m) compared to Sire.</p>
                <p><strong>Strike Length:</strong> 7.2m (Slightly shorter than Sire's 7.5m).</p>
                <p><strong>Health Risks:</strong> Lower risk of respiratory issues.</p>
            </div>

            <div class="left">
                <h4 class="yellow">Comparison with Successor Peers</h4>
                <p><strong>Winning Distance:</strong> Top 15% in Middle-distance group.</p>
                <p><strong>Strike Length:</strong> Above average consistency.</p>
                <p><strong>Breeding Fee:</strong> Competitive ($${mockData.fee}).</p>
                <p><strong>Health Risks:</strong> Excellent bone density scores.</p>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

        <h4 class="green">Offspring Predictions</h4>
        <p><strong>Composition:</strong> 65% chance of inheriting the "Speed-type" physique.</p>
        <p><strong>Distance & Health:</strong> Optimized for 1600m-2000m; Low colic risk profile.</p>

        <div class="one-column" style="background: #f9f9f9;">
            <h4 class="red">Simulated Performance (100 Mares Pool)</h4>
            <p>Based on a 100-mare pedigree pool, the estimated <strong>A+ Grade Nicks</strong> probability is <strong>22%</strong>.</p>
            <p><strong>Recommended Nicks (Sire Side):</strong> ${mockData.nicks}</p>
            <p><strong>Recommended Nicks (Dam Side):</strong> Sadler's Wells, Mr. Prospector descendants.</p>
        </div>
    `;
}