const fs = require('fs');
let page = fs.readFileSync('frontend/app/page.tsx', 'utf8');

// 1. Add Imports
if (!page.includes('DynamicBackground')) {
    page = page.replace('import dynamic from "next/dynamic";', `import dynamic from "next/dynamic";\nimport BeautifulWeather from "./components/BeautifulWeather";\nimport { ForecastDisaster, TrendChart } from "./components/RaincloudFeatures";\nimport DynamicBackground from "./components/DynamicBackground";`);
}

// 2. Wrap return with DynamicBackground
const conditionLine = `\n  const condition = weather?.current?.cloud_cover > 50 ? "Cloudy" : weather?.current?.rain > 0 ? "Rain" : "Sunny";\n\n  return (\n    <DynamicBackground condition={condition}>\n      <div className="min-h-screen pb-20 pt-8 px-4 sm:px-8">`;

page = page.replace(/return \(\s*<div className="min-h-screen bg-slate-50 pb-20 pt-8 sm:px-8">/, conditionLine);
page = page.replace(/<\/div>\s*\);\s*\}\s*$/, '      </div>\n    </DynamicBackground>\n  );\n}\n');

// 3. Replace the Weather Section
const weatherSectionRegex = /\{\/\* ====================================\s*WEATHER\s*==================================== \*\/\}[\s\S]*?(?=\{\/\* ====================================\s*RISK TREND\s*==================================== \*\/)/;
const newWeatherSection = `
        {/* ====================================
            WEATHER & TRENDS
        ==================================== */}
        <div className="max-w-4xl mx-auto">
          <BeautifulWeather weather={weather} weatherLoading={weatherLoading} locationName="Himachal Pradesh (Regional Avg)" />
          <ForecastDisaster risk={risk} loading={loading} />
          <TrendChart weather={weather} />
        </div>
`;
page = page.replace(weatherSectionRegex, newWeatherSection);

// 4. Also fix some global styling if needed (e.g., text colors from slate-900 to white)
// This is risky to do blindly globally, so we'll just fix the header.
page = page.replace(/text-slate-900/g, 'text-white');
page = page.replace(/text-slate-500/g, 'text-white/70');
page = page.replace(/bg-white/g, 'bg-black/40 backdrop-blur-md border-white/10 text-white');

fs.writeFileSync('frontend/app/page.tsx', page, 'utf8');
console.log("Updated page.tsx!");
