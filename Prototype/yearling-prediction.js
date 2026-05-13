function yearlingRecommendations() {
    const budget = document.getElementById('Budget').value;
    const distance = document.getElementById('Expected distance')?.value || "N/A";
    const reportContainer = document.getElementById('yearling-report-container');

    if (budget === "N/A") {
        alert("Please enter your budget first.");
        return;
    }

    // 显示容器
    reportContainer.style.display = "block";
    reportContainer.innerHTML = `<h2 class="red" style="text-align:center;">Top 5 Recommended Yearlings Under $${budget}</h2>`;

    // 模拟 5 匹马的数据
    const yearlings = [
        { dam: "Urban Sea", year: 2025, country: "Ireland", surface: "Turf" },
        { dam: "Kind", year: 2025, country: "UK", surface: "Turf" },
        { dam: "Miyoshi", year: 2025, country: "Japan", surface: "Dirt/Turf" },
        { dam: "Zenyatta", year: 2025, country: "USA", surface: "Dirt" },
        { dam: "Winx", year: 2025, country: "Australia", surface: "Turf" }
    ];

    yearlings.forEach((horse, index) => {
        const horseName = `${horse.dam} ${horse.year}`;
        const coi = (Math.random() * 4 + 1.5).toFixed(2); // 模拟 COI
        
        const horseHTML = `
            <div class="analysis-card" style="margin-bottom: 40px; padding: 25px; border: 1px solid #ddd; border-radius: 15px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <h3 class="green" style="border-bottom: 2px solid #2A9D8F; display: block;">#${index + 1}: ${horseName}</h3>
                
                <div class="two-columns">
                    <div class="left">
                        <h4 class="yellow">Pedigree & Origins</h4>
                        <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 11px;">
                            [ 5-Generation Pedigree Map ]<br>
                            S: Galileo > Sadler's Wells > Northern Dancer...<br>
                            D: ${horse.dam} > ...
                        </div>
                        <p style="font-size: 10px; color: #E63946; margin-top: 5px;">
                            ⭐ <i>Upgrade to PREMIUM for 9-Generation Pedigree & Nicks analysis.</i>
                        </p>
                        <p><strong>Production Country:</strong> ${horse.country}</p>
                        <p><strong>COI (Inbreeding):</strong> ${coi}%</p>
                    </div>

                    <div class="left">
                        <h4 class="yellow">AI Performance Predictions</h4>
                        <p><strong>Expected Distance:</strong> ${distance}</p>
                        <p><strong>Surface Preference:</strong> ${horse.surface}</p>
                        <p><strong>Maturity:</strong> ${Math.random() > 0.5 ? "Early (2yo)" : "Classic (3yo+)"}</p>
                        <p><strong>Health Risk Prediction:</strong> Low (Score: 9.4/10)</p>
                    </div>
                </div>

                <div class="one-column" style="background: #fff8e1; border-left: 5px solid #DAA520; margin-top: 15px;">
                    <h4 style="margin-top:0;">3-Year-Old Physical Projection</h4>
                    <p><strong>Expected Weight:</strong> ${Math.floor(Math.random() * 50 + 470)}kg - ${Math.floor(Math.random() * 50 + 520)}kg</p>
                    <p><strong>Composition:</strong> High muscularity in hindquarters, balanced frame, estimated height 16.2hh.</p>
                    <p><strong>Expected Racing Career:</strong> Group Level potential; durable constitution for 15+ starts.</p>
                </div>
            </div>
        `;
        reportContainer.innerHTML += horseHTML;
    });
}