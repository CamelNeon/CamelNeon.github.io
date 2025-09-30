(function(){
    const AVERAGE_CARROT_CONSTANT = 32.786885245901639344262295081967;
  
    const form = document.getElementById('convForm');
    const kJInput = document.getElementById('kJ');
    const out = document.getElementById('output');
    const precisionSelect = document.getElementById('precision');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
  
    function formatNumber(n, decimals){
      const opts = {minimumFractionDigits: decimals, maximumFractionDigits: decimals};
      try{
        return Number(n).toLocaleString(undefined, opts);
      }catch(e){
        return Number(n).toFixed(decimals);
      }
    }
  
    function convert(){
      const kJ = Number(kJInput.value);
      const decimals = Number(precisionSelect.value);
      if (!isFinite(kJ)){
        out.textContent = 'Invalid Input';
        return;
      }
      const speed = Math.sqrt(kJ * 1000 * AVERAGE_CARROT_CONSTANT);
      out.textContent = formatNumber(speed, decimals) + ' m/s';
      out.setAttribute('aria-label', formatNumber(speed, decimals) + ' speed');
      return speed;
    }
  
    form.addEventListener('submit', function(e){
      e.preventDefault();
      convert();
    });
  
    copyBtn.addEventListener('click', function(){
      const text = out.textContent.trim();
      if (!text || text === '—' || text === 'Invalid Input') return;
      navigator.clipboard?.writeText(text).then(()=>{
        copyBtn.textContent = 'Copied ✓';
        setTimeout(()=> copyBtn.textContent = 'Copy', 1500);
      }).catch(()=>{
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try{document.execCommand('copy'); copyBtn.textContent='Copied ✓'; setTimeout(()=>copyBtn.textContent='Copy',1500);}catch(e){alert('Impossible to copy')}
        ta.remove();
      });
    });
  
    resetBtn.addEventListener('click', function(){
      kJInput.value = '';
      out.textContent = '—';
      kJInput.focus();
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