/* Initial parameters */
const InitOptimalGlu = 180;
const InitInsGluFactor = 25;
const initInsulin = 0;
const minGlucose = 0;
const maxGlucose = 500;
const minInsulin = 0;
const maxInsulin = 50;
let style = document.querySelector('[data="dynamicCss"]');
let autoFocusedE;
let focusabl; //Array for all potential elements to include in "Enter" key toggling
let lastIndex = -1; //global for last 'tab' / 'Enter' focus
let visFocussable = [];
let allElements = [];

/* Dictionary - Trios of: "id", "hebrew text", "hebrew help",... */
let Dict = [
    "Insulin_Glucose_Header", "אאינסולין היום לפי אתמול", "",
    "disclaimer", "מחשבון - לא תחליף ליעוץ רפואי", "לפרטים: דר ניר צבר TSABAR.NIR@GMAIL.COM",
    "LG0", "סוכר שנמדד <i><b>היום</b></i> בבוקר", "סוכר (גלוקוז) שנמדד במד-סוכר (גלוקומטר) <i><b>היום</b></i> הבוקר בצום",
    "LI0", "אינסולין שניתן <i><b>אתמול</b></i> בבוקר", "כמה יחידות אינסולין קצר-טווח הוזרקו אתמול בבוקר?",
    "LG1", "סוכר שנמדד <i><b>אתמול</b></i> בצהרים", "סוכר (גלוקוז) שנמדד במד-סוכר (גלוקומטר) בצהרים אתמול",
    "LI1", "אינסולין שניתן <i><b>אתמול</b></i> בצהרים", "אינסולין קצר טווח שניתן בצהרים אתמול",
    "LG2", "סוכר שנמדד <i><b>אתמול</b></i> בערב", "סוכר (גלוקוז) שנמדד במד-סוכר (גלוקומטר) בערב אתמול",
    "LI2", "אינסולין <i><b>ארוך-טווח</b></i>", "כמה אינסולין ארוך-טווח הוזרק אתמול ?",
    "Optimal_glucose", "רמת סוכר אופטימלית", "את רמת הסוכר האופטימלית יש להתאים לרמת הסיכון לנפילות סוכר, לגיל ולמצב התפקודי",
    "GIR", "תיקון סוכר ליחידת אינסולין", "מספר גבוה כאן יביא לתיקון אינסולין מתון יותר",
    "gItiptxt", "את רמת הסוכר האופטימלית יש להתאים לגיל ומצב תפקודי", "רמת הסוכר האופטימלית בטיפול תרופתי גבוהה יותר ככל שהגיל עולה או המצב התפקודי יורד. בסוכרת מסוג 2 עדיף להפחית סוכר באמצעות תזונה נכונה מאשר באמצעות תרופות",
    "LO0", "אינסולין מחושב להבוקר", "החישוב נותן הערכה בלבד ובהנחה שהתנאים לא השתנו מאתמול",
    "LO1", "אינסולין מחושב לצהרים", "החישוב נותן הערכה בלבד ובהנחה שהתנאים לא השתנו מאתמול",
    "LO2", "אינסולין ארוך-טווח מחושב", "החישוב נותן הערכה בלבד ובהנחה שהתנאים לא השתנו מאתמול",
    "CalcBtn", "חשב", "סימן '?' מופיע כאשר חסר נתון מתאים של סוכר",
    "CalcBtnH", "?", "סימן '?' מופיע כאשר חסר נתון מתאים של סוכר",
    "ZeroBtn", "איפוס", "לחיצה לאיפוס מלא. לאתחול מחדש - ניתן לרענן את הדף",
    "ZeroBtnH", "?", "לחיצה לאיפוס מלא. לאתחול מחדש - ניתן לרענן את הדף",
    "SubmitBtn", "שלח", "אופס... עובד על זה...",
    "SubmitBtnH", "?", "האפשרות לשלוח - כרגע רק בשלב תכנון"
];

function tP(tID, isHelp) { /* Hebrew text placement. Use an html.element parameter*/
    for (let x = 0; x < Dict.length; x += 3) {
        if (Dict[x] === tID.id) {
            if (isHelp) {
                return Dict[x + 2]
            } else {
                tID.innerHTML = Dict[x + 1];
                if (tID.tagName === "INPUT" && (tID.type === "button" || tID.type === "submit")) { //with single '=' is true also for "submit"
                    tID.setAttribute("value", Dict[x + 1]);
                }
                break;
            }
        }
    }
}

function formInit(iForm) {
    /* Initialization of form parameters*/
    autoFocusedE = iForm.glucose0;
    autoFocusedE.autofocus = "true";
    iForm.glucose0.value = 0;
    iForm.glucose1.value = 0;
    iForm.glucose2.value = 0;
    iForm.insulin0.value = initInsulin;
    iForm.insulin1.value = initInsulin;
    iForm.insulinLong.value = initInsulin;
    iForm.optimalGlucose.value = InitOptimalGlu;
    iForm.glucose_Insulin_Factor.value = InitInsGluFactor;

    /* Initialization of form texts*/
    let txtArray = document.getElementById("outer").querySelectorAll(".input_txt, .has_tip");
    for (let i = 0; i < txtArray.length; i++) {
        let tElem = txtArray[i];
        tP(tElem, false);
        if (tElem.nodeName !== "INPUT") {
            tElem.setAttribute('ondblclick', 'helper(this)'); //Putting helper popups
        }
    }

    /* Defining input elements filters*/{
        let tElems = iForm.querySelectorAll(".inGlu, .inIns, [name='optimalGlucose'], [name='glucose_Insulin_Factor']");
        for (let i = 0; i < tElems.length; i++) {
            let tElem = tElems[i];
            tElem.setAttribute("type", "tel");
            if (tElem.classList.contains("inIns")) {
                tElem.setAttribute("min", minInsulin);
                tElem.setAttribute("max", maxInsulin);
                setFilterInput(tElem,
                    function (value) {
                        return /(^$)|(^[0-9]{1,2}$)/.test(value);
                    })
            } else {
                setFilterInput(tElem,
                    function (value) {
                        return /^$|^[0-9]{1,3}$/.test(value)
                    })
                if (tElem.classList.contains("inGlu")) {
                    tElem.setAttribute("min", minGlucose);
                    tElem.setAttribute("max", maxGlucose);
                }
            }
            tElem.focus();
            updateNum_Slider();
        }

        // Restrict input at the given textbox to the given inputFilter function.
        function setFilterInput(textbox, inputFilter) {
            let Events = ["change", "input", "keydown", "select", "contextmenu", "paste", "animationstart", "onkeydown", "onkeyup", "mousedown", "mouseup", "drop", "touchstart", "drag"];//"onmouseleave", "select", "contextmenu", "paste", "animationstart", "change", "onkeydown", "onkeyup", "mousedown", "mouseup", "drop", "touchstart", "drag"
            for (let i = 0; i < Events.length; i++) {
                let event = Events[i];
                textbox.addEventListener(event, function () {
                    if (inputFilter(this.value)) {
                        if (this.value !== "") {
                            this.value = Number(this.value);
                        }
                        this.oldValue = this.value;
                        try {
                            this.oldSelectionStart = this.selectionStart;
                            this.oldSelectionEnd = this.selectionEnd;
                        } catch (e) {
                        }
                    } else if (this.hasOwnProperty("oldValue")) {
                        this.value = this.oldValue;
                        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                    } else {
                        this.value = this.min;
                    }
                    updateNum_Slider();
                }, {passive: false})
            }
        }
    }
    window.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && document.activeElement.type !== "button") {
            event.preventDefault();
            updateNum_Slider();
            GoNext();
        }
    })

    let sliders = this.document.querySelectorAll("[type='range']");
    // set sliders' attributes and events
    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        let mirrorText = document.getElementById(slider.getAttribute("mirr"));
        slider.min = mirrorText.min;
        slider.max = mirrorText.max;
        slider.defaultValue = mirrorText.min;
        slider.value = mirrorText.value;
        let sEvents = ["change", "touchstart", "touchmove", "input"];
        for (let x = 0; x < sEvents.length; x++) {
            let event = sEvents[x];
            slider.addEventListener(event, function () {
                slider.focus();
                updateNum_Slider();
            }, {passive: false});
        }
        const sBtnHtml = 'type="button"  style="background-color:darkgreen;width:2em;' +
            'border-color:darkgreen;box-shadow: 1px 1px 1px lightgreen, 0 0 1px #0d0d0d;color:lightgreen;font-weight:bolder"' +
            ' onClick="setS(this)" onmousedown="longTouch(this)" ' +
            'ontouchstart="longTouch(this)" onmouseup="quitTouch()" ontouchend="quitTouch()">'
        slider.insertAdjacentHTML('beforebegin',
            '<input class="clrBtn" name="clrBtn" value="&times"' + sBtnHtml +
            '<input class="lessBtn" name="lessBtn" value="-"' + sBtnHtml);
        slider.insertAdjacentHTML('afterend',
            '<input class="moreBtn" name="moreBtn" value="+"' + sBtnHtml);
    }

    /*all potential elements to include in "Enter" key toggling */
    {
        focusabl = Array.from(
            document.querySelectorAll(
                'button:not([disabled]), ' +
                'input[type=text]:not([disabled]), ' +
                'input[tabindex]:not([disabled]):not([tabindex="-1"])'
            )
        );
    }
    allElements = Array.from(document.querySelectorAll("*"));
    autoFocusedE.focus();
} // end of formInit here //
//----------------------//

// For IE compatibility: Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
    Array.from = (function () {
        let toStr = Object.prototype.toString;
        let isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        let toInteger = function (value) {
            let number = Number(value);
            if (isNaN(number)) {
                return 0;
            }
            if (number === 0 || !isFinite(number)) {
                return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        let maxSafeInteger = Math.pow(2, 53) - 1;
        let toLength = function (value) {
            let len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            let C = this;

            // 2. Let items be ToObject(arrayLike).
            let items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            let mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            let T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            let len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            let A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            let k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            let kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}

function GoNext() {
//add all elements we want to include in our selection
    if (document.activeElement) {
        visFocussable = Array.prototype.filter.call(focusabl, function (element) {
            //check for visibility while always include the current activeElement
            return element.offsetWidth > 0 && element.offsetHeight > 0 || element === document.activeElement
        });
        let index = visFocussable.indexOf(document.activeElement);
        if (index === -1) {
            let i = allElements.indexOf(document.activeElement);
            while (i > 0 && i !== allElements.indexOf(visFocussable[lastIndex])) {
                i--;
            }
            allElements[i].focus();
            index = visFocussable.indexOf(document.activeElement);
        }
        if (index > -1) {
            let nextElement = visFocussable[index + 1] || visFocussable[0];
            nextElement.focus();
            lastIndex = visFocussable.indexOf(nextElement);
        }
    }
}

let timeOut, interval;

function longTouch(elem) {
    timeOut = setTimeout(function () {
        interval = setInterval(function () {
            setS(elem);
        }, 50);
    }, 500);
}

function quitTouch() {
    if (timeOut) clearTimeout(timeOut);
    if (interval) clearInterval(interval);
}

function setS(elem) {
    let sliderE;
    switch (elem.name) {
        case "clrBtn":
            sliderE = elem.nextElementSibling.nextElementSibling;
            sliderE.value = 0;
            break;
        case "lessBtn":
            sliderE = elem.nextElementSibling;
            sliderE.value--;
            break;
        case "moreBtn":
            sliderE = elem.previousElementSibling;
            sliderE.value++;
            break;
        default:
        // code block
    }
    sliderE.focus();
    updateNum_Slider();
}

// Set range value according to number, or vice versa; refreshes input elements
function updateNum_Slider() {
    outStyle(false);
    let aE = document.activeElement;
    if (aE.hasAttribute("mirr")) {
        let aMirrorE = document.getElementById(aE.getAttribute("mirr"));
        if (!aE.value) {
            aE.value = 0;
        }
        aMirrorE.value = aE.value;

        if (aE.id.substr(0, 1) === "T") {
            let switchE = aE;
            aE = aMirrorE;
            aMirrorE = switchE;
        }
        if (aE.value === "0") {
            aMirrorE.value = ""
        }
        colorCode(aE);

        let iElements = document.getElementById("outer").querySelectorAll("input");
        for (let i = 0; i < iElements.length; i++) {
            iElements[i].value = iElements[i].value;// Needed for refreshing style after undetected (webkit\autofill ?) changes
        }
    }
}

function colorCode(e) {
    let cC = "#00FF00";
    if (e.value === "0") {
        cC = 'grey';
    } else {
        let augment = function (n) { // returns a hyperbole
            return (2*n-n*n);
        }
        let ddHex = function (n) {  // returns a 2 digit hex representing relative range 0-1
            return ("0" + (Math.round(255 * n).toString(16).
                    toUpperCase())).substr(-2);
        }
        switch (e.id.substr(0, 2)) {  // checks id for clues:
            case "SI":                        // if Insulin slider input
                cC = ddHex(Number(e.value) / maxInsulin);
                cC = "#" + cC + "FF00";            // color yellower for higher dose
                break;
            case "SG":                       // if Glucose slider input
                let GluOffSet = Number(e.value) - InitOptimalGlu;
                if (GluOffSet > 0) {
                    GluOffSet = GluOffSet / (maxGlucose - InitOptimalGlu);
                } else {
                    GluOffSet = GluOffSet / (minGlucose - InitOptimalGlu);
                }
                GluOffSet = augment (GluOffSet);
                cC = "#" + ddHex(GluOffSet) + ddHex(1 - GluOffSet) + "00";
                break;
            default:
            // code block
        }
    }
    style.innerHTML = 'input[type="range"]#' + e.id + '::-webkit-slider-thumb { border-color:' + cC + '}';
}

function outStyle(isFresh) {
    let bShadowStyle = 'none';
    let tShadowStyle = 'none';
    if (isFresh) {
        bShadowStyle = '3px 3px 3px lightgreen';
        tShadowStyle = '2px 2px 2px black';
    }
    let outBoxes = Array.from(document.querySelectorAll(".outItem, .outItem input"));
    for (let i = 0; i < outBoxes.length; i++) {
        outBoxes[i].style.boxShadow = bShadowStyle;
        outBoxes[i].style.textShadow = tShadowStyle;
    }
}

function show_tip(etip) { /*. Use an html.element parameter*/
    if (!etip.nextElementSibling) {
        etip.insertAdjacentHTML('afterend', '<p name="e_Tip" id="e_tip"></p>');
        let sTip = etip.nextElementSibling;
        sTip.innerHTML = tP(etip, true);
        sTip.addEventListener('dblclick', function () {
            hide_tip()
        });
    }
}

function hide_tip() {
    setTimeout(function () {
        let hTip = document.getElementById("e_Tip");
        if (hTip !== null) {
            hTip.style.color = "transparent";
            let fs = window.getComputedStyle(hTip).getPropertyValue("height");
            let fsN = Number(fs.slice(0, fs.length - 2));
            let i = 100;
            let t = setInterval(frame, 4);

            function frame() {
                if (i < 0) {
                    clearInterval(t);
                    hTip.style.height = fsN + "px";
                    hTip.parentElement.removeChild(hTip);
                } else {
                    i--;
                    fs = fsN * i / 100 + "px";
                    hTip.style.height = fs;
                }
            }
        }
    }, 800);
}

// When the user clicks the trigger, open the modal
let fader;
let htimer;

function helper(helpE) {
    helpE.style.borderColor = "lightgreen";
    // Get the help text by it's ID and place it in
    document.getElementById("helpText").innerHTML =
        tP(helpE, true);
    // Get the modal and display it
    let modal = document.getElementById("myModal");
    modal.style.display = "block";
    modal.style.opacity = "1.0";
    modal.onclick = function () {
        clearInterval(fader);
        clearTimeout(htimer);
        fadeOut(modal, helpE);
    };
    htimer = setTimeout(function () {
        fadeOut(modal, helpE);
    }, 2000);
}

function fadeOut(fElem, hID) {
    fader = setInterval(function () {
        if (!fElem.style.opacity) {
            fElem.style.opacity = "1.0";
        }
        if (fElem.style.opacity > 0) {
            fElem.style.opacity -= "0.1";
        } else {
            clearInterval(fader);
            fElem.style.display = "none";
            fElem.style.opacity = "1";
            hID.style.borderColor = "";
        }
    }, 50);
}

function insulinDelta(glucose) {
    let delta = "?";
    let giF = document.getElementById("glucose_Insulin_Factor").value;
    if (glucose !== "") {
        if (giF > 0) {
            delta = (glucose - document.getElementById("optimalGlucose").value) / giF;
        }
    }
    return delta;
}

function correctedInsulin(insulinDose) {
    if (isNaN(insulinDose)) {
        return "?";
    } else {
        if (insulinDose < 0) {
            return 0;
        } else {
            return insulinDose.toFixed(0);
        }
    }
}

function updateCalculator(this_form) {
    let ri0 = Number(this_form.insulin0.value) + insulinDelta(this_form.glucose1.value);
    this_form.rInsulin0.value = correctedInsulin(ri0);
    this_form.SubmitBtn.focus();
    this_form.rInsulin0.focus();// to ensure displaying
    let ri1 = Number(this_form.insulin1.value) + insulinDelta(this_form.glucose2.value);
    this_form.rInsulin1.value = correctedInsulin(ri1);
    let ri2 = Number(this_form.insulinLong.value) + insulinDelta(this_form.glucose0.value);
    this_form.rInsulin2.value = correctedInsulin(ri2);
    outStyle(true);
}

function clearForm(oForm) {
    oForm.reset();
    autoFocusedE.focus();
}
