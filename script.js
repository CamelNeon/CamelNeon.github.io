(function(){
    const KM_TO_MILES = 0.62137119223733;
  
    const form = document.getElementById('convForm');
    const kmInput = document.getElementById('km');
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
      const km = Number(kmInput.value);
      const decimals = Number(precisionSelect.value);
      if (!isFinite(km)){
        out.textContent = 'Entrée invalide';
        return;
      }
      const miles = km * KM_TO_MILES;
      out.textContent = formatNumber(miles, decimals) + ' mi';
      out.setAttribute('aria-label', formatNumber(miles, decimals) + ' miles');
      return miles;
    }
  
    form.addEventListener('submit', function(e){
      e.preventDefault();
      convert();
    });
  
    copyBtn.addEventListener('click', function(){
      const text = out.textContent.trim();
      if (!text || text === '—' || text === 'Entrée invalide') return;
      navigator.clipboard?.writeText(text).then(()=>{
        copyBtn.textContent = 'Copié ✓';
        setTimeout(()=> copyBtn.textContent = 'Copier', 1500);
      }).catch(()=>{
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try{document.execCommand('copy'); copyBtn.textContent='Copié ✓'; setTimeout(()=>copyBtn.textContent='Copier',1500);}catch(e){alert('Impossible de copier')}
        ta.remove();
      });
    });
  
    resetBtn.addEventListener('click', function(){
      kmInput.value = '';
      out.textContent = '—';
      kmInput.focus();
    });
  
    let typingTimer;
    kmInput.addEventListener('input', function(){
      clearTimeout(typingTimer);
      typingTimer = setTimeout(()=>{
        if (kmInput.value.trim() !== '') convert();
      }, 400);
    });
  
    kmInput.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){
        e.preventDefault(); convert();
      }
    });
  })();