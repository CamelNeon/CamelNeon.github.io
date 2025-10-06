(function () {
  const AVERAGE_CARROT_WEIGTH = 0.102;

  const inputField = document.getElementById("inputValue");
  const inputUnit = document.getElementById("inputUnit");
  const outputUnit = document.getElementById("outputUnit");
  const inputLabel = document.getElementById("inputLabel");
  const inputValue = document.getElementById("inputValue")
  const copyBtn = document.getElementById('copyBtn');
  let inverted = false;

  const conversions = {
    input: { J: 1, kJ: 1000, t: 4184000000000 },
    output: { ms: 1, kmh: 3.6, mph: 2.23694, fps: 3.28084 },
  };

  function formatNumber(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}

  function convert() {
    const inputVal = parseFloat(document.getElementById('inputValue').value.replace(/\s/g,''));
    const inputUnit = document.getElementById('inputUnit').value;
    const outputUnit = document.getElementById('outputUnit').value;

    if (isNaN(inputVal)) {
      document.getElementById('outputValue').value = "";
      return;
    }

    let result;
    if (!inverted) {
      result = Math.sqrt((inputVal * conversions['input'][inputUnit] * 2) / AVERAGE_CARROT_WEIGTH) * conversions['output'][outputUnit];
    }
    else {
      result = ((AVERAGE_CARROT_WEIGTH * (inputVal / conversions['output'][inputUnit]) ** 2) / 2) / conversions['input'][outputUnit];
    }
    document.getElementById('outputValue').value = formatNumber(result.toFixed(2));
  }

  // Invert everything
  invertBtn.addEventListener("click", () => {
    // swap full dropdown content
    const tempOptions = inputUnit.innerHTML;
    inputUnit.innerHTML = outputUnit.innerHTML;
    outputUnit.innerHTML = tempOptions;

    // swap selected index to keep consistent selection
    const tempSelected = inputUnit.selectedIndex;
    inputUnit.selectedIndex = outputUnit.selectedIndex;
    outputUnit.selectedIndex = tempSelected;

    // swap labels
    const tempLabel = inputLabel.textContent;
    inputLabel.textContent = outputLabel.textContent;
    outputLabel.textContent = tempLabel;

    inverted = !inverted;

    convert();
  });

  copyBtn.addEventListener("click", () => {
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
  inputField.addEventListener('input', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (inputField.value.trim() !== '') convert();
    }, 400);
  });

  inputField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault(); convert();
    }
  });

  inputValue.addEventListener("input", () => {
    inputValue.value = formatNumber(inputValue.value.replace(/\s/g,''));
    convert();
  });
  inputUnit.addEventListener("change", convert);
  outputUnit.addEventListener("change", convert);
})();