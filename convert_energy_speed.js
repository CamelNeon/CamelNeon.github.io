(function(){
    const AVERAGE_CARROT_WEIGTH = 0.102;
  
    const kJInput = document.getElementById('kJ');
    const out = document.getElementById('output');
    const copyBtn = document.getElementById('copyBtn');
  
    function formatNumber(n, decimals){
      const opts = {minimumFractionDigits: decimals, maximumFractionDigits: decimals};
      try{
        return Number(n).toLocaleString(undefined, opts);
      }catch(e){
        return Number(n).toFixed(decimals);
      }
    }
  
    const conversions = {
      input: {J: 1, kJ: 1000, t: 4184000000000},
      output: {ms:1, kmh: 3.6, mph: 2.23694, fps: 3.28084},
      Km: { Km: 1, Miles: 0.621371, Meters: 1000, Feet: 3280.84 },
      Miles: { Km: 1.60934, Miles: 1, Meters: 1609.34, Feet: 5280 },
      Meters: { Km: 0.001, Miles: 0.000621371, Meters: 1, Feet: 3.28084 },
      Feet: { Km: 0.0003048, Miles: 0.000189394, Meters: 0.3048, Feet: 1 }
    };
    
    function convert() {
      const inputVal = parseFloat(document.getElementById('inputValue').value);
      const inputUnit = document.getElementById('inputUnit').value;
      const outputUnit = document.getElementById('outputUnit').value;
    
      if (isNaN(inputVal)) {
        document.getElementById('outputValue').value = "";
        return;
      }
    
      const result = Math.sqrt((inputVal * conversions['input'][inputUnit] * 2) / AVERAGE_CARROT_WEIGTH) * conversions['output'][outputUnit];
      document.getElementById('outputValue').value = result.toFixed(2);
    }
    
    document.getElementById("inputValue").addEventListener("input", convert);
    document.getElementById("inputUnit").addEventListener("change", convert);
    document.getElementById("outputUnit").addEventListener("change", convert);
    
    document.getElementById("invertBtn").addEventListener("click", () => {
      const inputUnit = document.getElementById("inputUnit").value;
      const outputUnit = document.getElementById("outputUnit").value;
    
      document.getElementById("inputUnit").value = outputUnit;
      document.getElementById("outputUnit").value = inputUnit;
    
      convert();
    });
    
    document.getElementById("copyBtn").addEventListener("click", () => {
      const outputVal = document.getElementById("outputValue").value;
      if (outputVal) {
        navigator.clipboard.writeText(outputVal);
        alert("Result copied to clipboard!");
      }
    });
    
    document.getElementById("resetBtn").addEventListener("click", () => {
      document.getElementById("inputValue").value = "";
      document.getElementById("outputValue").value = "";
    });
  
    let typingTimer;
    kJInput.addEventListener('input', function(){
      clearTimeout(typingTimer);
      typingTimer = setTimeout(()=>{
        if (kJInput.value.trim() !== '') convert();
      }, 400);
    });
  
    kJInput.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){
        e.preventDefault(); convert();
      }
    });
  })();