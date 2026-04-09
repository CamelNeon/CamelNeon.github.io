(function () {
    const AVERAGE_CARROT_WEIGHT = 0.102;
    const c = 299_792_458;
    const G = 6.674 * Math.pow(10, -11);
    const m_earth = 5.972 * Math.pow(10, 24);
    const r_earth = 6_378_137;

    const inputField = document.getElementById("inputValue");
    const inputUnit = document.getElementById("inputUnit");
    const outputUnit = document.getElementById("outputUnit");
    const inputLabel = document.getElementById("inputLabel");
    const inputValue = document.getElementById("inputValue")
    const copyBtn = document.getElementById('copyBtn');
    let inverted = false;

    const conversions = {
        input: { m: 1, km: 1000, AU: 149597870700 },
        output: { ms: 1, kmh: 3.6, mph: 2.23694, fps: 3.28084 },
    };

    function formatNumber(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    function convert() {
        const inputVal = parseFloat(document.getElementById('inputValue').value.replace(/\s/g, ''));
        const inputUnit = document.getElementById('inputUnit').value;
        const outputUnit = document.getElementById('outputUnit').value;

        if (isNaN(inputVal)) {
            document.getElementById('outputValue').value = "";
            return;
        }

        let result;
        if (!inverted) {
            const h = (inputVal * conversions['input'][inputUnit]);
            const energy = G * AVERAGE_CARROT_WEIGHT * m_earth * h / (r_earth * (r_earth + h));
            const x = energy / (AVERAGE_CARROT_WEIGHT * c ** 2);
            result = c * Math.sqrt(x * (2 + x)) / (1 + x) * conversions['output'][outputUnit];
        }
        else {
            const beta = (inputVal / conversions['output'][inputUnit]) / c;
            if (beta <= 0) {
                result = 0;
            }
            else if (beta >= 1) {
                result = Infinity; // can't exceed light speed
            }
            else {
                const term = beta ** 2 / (1 + Math.sqrt(1 - beta ** 2));
                const energy = AVERAGE_CARROT_WEIGHT * c ** 2 * term;
                const numerator = energy * r_earth ** 2;
                const denominator = G * m_earth * AVERAGE_CARROT_WEIGHT - energy * r_earth;
                if (denominator <= 0) {
                    result = Infinity;
                }
                else {
                    result = numerator / denominator;
                }
            }
        }
        document.getElementById('outputValue').value = formatNumber(result.toFixed(5));
    }

    // Invert everything
    invertBtn.addEventListener("click", () => {
        const inputSelectedValue = inputUnit.value;
        const outputSelectedValue = outputUnit.value;

        // swap full dropdown content
        const tempOptions = inputUnit.innerHTML;
        inputUnit.innerHTML = outputUnit.innerHTML;
        outputUnit.innerHTML = tempOptions;

        // swap selected index to keep consistent selection
        inputUnit.value = outputSelectedValue;
        outputUnit.value = inputSelectedValue;

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
        inputValue.value = formatNumber(inputValue.value.replace(/\s/g, ''));
        convert();
    });
    inputUnit.addEventListener("change", convert);
    outputUnit.addEventListener("change", convert);
})();