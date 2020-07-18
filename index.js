/* Initial parameters */

function browserCheck() {
    let itIsIE;
    try {itIsIE = !isIE && !!window.StyleMedia} catch {itIsIE = false}
    switch (true) {
        case (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0:
            return "Opera 8.0+";
        case typeof InstallTrigger !== 'undefined':
            return "Firefox 1.0+";
        case /constructor/i.test(window.HTMLElement) || (function (p) {
                    return p.toString() === "[object SafariRemoteNotification]";
                })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)):
            return "Safari 3.0+ [object HTMLElementConstructor]";
        case /*@cc_on!@*/false || !!document.documentMode:
            return "Internet Explorer 6-11";
        case !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime):
            return "Chrome 1 - 79";
        case itIsIE:
            return "Edge 20+";
        case isChrome && (navigator.userAgent.indexOf("Edg") != -1):
            return "Edge";
        case (isChrome || isOpera) && !!window.CSS:
            return "Blink engine";
    }
}

const InitOptimalGlu = 180;
const InitInsGluFactor = 25;
const initInsulin = 0;
const minGlucose = 0;
const maxGlucose = 500;
const minInsulin = 0;
const maxInsulin = 50;
console.log("Browser detected as "+browserCheck());
let style = document.querySelector('[data="dynamicCss"]');
let autoFocusedE;
let focusabl; //Array for all potential elements to include in "Enter" key toggling
let lastIndex = -1; //global for last 'tab' / 'Enter' focus
let visFocussable = [];
let allElements = [];

function noteID4value(slider) { // returns an ID string to match an input value note (used for slider '?' buttons)
    let noteID = 'N' + slider.id.substr(1, 2);
    let sV = slider.value;
    if (sV === "0") {
        return (noteID + "E")
    }
    if (noteID.substr(1, 1) === "G") { // glucose input
        switch (true) {
            case (sV < 70):
                return (noteID + "Y")
            case (sV < 150):
                return (noteID + "L")
            case (sV < 200):
                return (noteID + "O")
            case (sV < 300):
                return (noteID + "H")
            default:
                return (noteID + "V")
        }
    } else { // insulin input
        switch (true) {
            case (sV < 10):
                return (noteID + "L")
            case (sV < 20):
                return (noteID + "M")
            default:
                return (noteID + "H")
        }
    }
}

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
    "SubmitBtnH", "?", "האפשרות לשלוח - כרגע רק בשלב תכנון",
    "NG0E", "Empty Sugar", "אם לא נמדד גלוקוז (סוכר) הבוקר - יש להשאיר ריק. אם כן נמדד, בבקשה לציין התוצאה. (כך נוכל להתאים מינון אינסולין ארוך-טווח)",
    "NG0Y", "Hypo", "זהירות! זוהי רמת סוכר נמוכה באופן מסוכן. יש לתת בזהירות שתיה עם סוכר ולפנות לרופא. חשוב גם להפחית או להפסיק אינסולין ארוך-טווח",
    "NG0L", "Low", "זוהי רמת סוכר נמוכה מדי לטיפול באינסולין. לכן נפחית מינון אינסולין ארוך-טווח",
    "NG0O", "Optimal", "זוהי רמת סוכר מתאימה לטיפול באינסולין ארוך-טווח - במינון של אתמול. (אם יש צורך לרדת במשקל ניתן להפחית צריכת פחמימות במקביל להפחתת מינון)",
    "NG0H", "High", "זוהי רמת סוכר גבוהה. לפני עליה במינון - חשוב לוודא שהמדידה נעשתה בצום, ששתיית המים בכמות טובה (בד''כ 1.5-2.5 ליטרים ביממה), שהופחתו פחמימות ומתוקים מהמזון והשתיה (אלא אם נדרשת עליה במשקל) ושאין זיהום, אלכוהול, עישון או תרופה עודפת הגורמת עליית סוכר. אם זה המצב, נעלה מינון אינסולין ארוך-טווח",
    "NG0V", "VeryHigh", "זוהי רמת סוכר גבוהה באופן מסוכן. יש לפנות לרופא באופן מיידי. בינתיים - רצוי לשתות מים (בזהירות)",
    "NI0E", "Empty Insulin", "אם הוזרק אתמול בבוקר אינסולין קצר-טווח - בבקשה לציין כמה. אם לא - בבקשה להשאיר ריק.",
    "NI0L", "lowDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בבוקר (אם לא הוזרק - בבקשה להשאיר ריק)",
    "NI0M", "mediumDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בבוקר (זהו מינון מעט גבוה, בבקשה לודא שלא נרשם בטעות)",
    "NI0H", "HighDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בבוקר (זהו מינון <i><b>מאד</b></i> גבוה, חשוב לודא שלא נרשם בטעות)",
    "NG1E", "Empty Sugar", "אם לא נמדד גלוקוז (סוכר) אתמול לפני ארוחת צהרים - יש להשאיר ריק. אם כן נמדד, בבקשה לציין התוצאה. (כך נוכל להתאים מינון אינסולין קצר-טווח בבוקר)",
    "NG1Y", "Hypo", "זהירות! זוהי רמת סוכר נמוכה באופן מסוכן. במצב כזה יש לתת בזהירות שתיה עם סוכר ולפנות לרופא. חשוב גם להפחית או להפסיק אינסולין קצר-טווח בבוקר",
    "NG1L", "Low", "זוהי רמת סוכר נמוכה מדי לטיפול באינסולין. לכן נפחית מינון אינסולין קצר-טווח בבוקר",
    "NG1O", "Optimal", "זוהי רמת סוכר מתאימה לטיפול באינסולין קצר-טווח - במינון של אתמול בבוקר. (אם יש צורך לרדת במשקל ניתן להפחית צריכת פחמימות במקביל להפחתת מינון)",
    "NG1H", "High", "זוהי רמת סוכר גבוהה. לפני עליה במינון - חשוב לוודא שהמדידה נעשתה לפני הארוחה, ששתיית המים בכמות טובה (בד''כ 1.5-2.5 ליטרים ביממה), שהופחתו פחמימות ומתוקים מהמזון והשתיה (אלא אם נדרשת עליה במשקל) ושאין זיהום, אלכוהול, עישון או תרופה עודפת הגורמת עליית סוכר. אם זה המצב, נעלה מינון אינסולין קצר-טווח בבוקר",
    "NG1V", "VeryHigh", "זוהי רמת סוכר גבוהה באופן מסוכן הדורשת פניה מיידית לרופא.",
    "NI1E", "Empty Insulin", "אם הוזרק אתמול בצהרים אינסולין קצר-טווח - בבקשה לציין כמה. אם לא - בבקשה להשאיר ריק.",
    "NI1L", "lowDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בצהרים (אם לא הוזרק - בבקשה להשאיר ריק)",
    "NI1M", "mediumDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בצהרים (זהו מינון מעט גבוה, בבקשה לודא שלא נרשם בטעות)",
    "NI1H", "HighDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בצהרים (זהו מינון <i><b>מאד</b></i> גבוה, חשוב לודא שלא נרשם בטעות)",
    "NG2E", "Empty Sugar", "אם לא נמדד גלוקוז (סוכר) אתמול לפני ארוחת ערב - יש להשאיר ריק. אם כן נמדד, בבקשה לציין התוצאה. (כך נוכל להתאים מינון אינסולין קצר-טווח בצהרים)",
    "NG2Y", "Hypo", "זהירות! זוהי רמת סוכר נמוכה באופן מסוכן. במצב כזה יש לתת בזהירות שתיה עם סוכר ולפנות לרופא. חשוב גם להפחית או להפסיק אינסולין קצר-טווח בצהרים",
    "NG2L", "Low", "זוהי רמת סוכר נמוכה מדי לטיפול באינסולין. לכן נפחית מינון אינסולין קצר-טווח בצהרים",
    "NG2O", "Optimal", "זוהי רמת סוכר מתאימה לטיפול באינסולין קצר-טווח - במינון של אתמול בצהרים. (אם יש צורך לרדת במשקל ניתן להפחית צריכת פחמימות במקביל להפחתת מינון)",
    "NG2H", "High", "זוהי רמת סוכר גבוהה. לפני עליה במינון - חשוב לוודא שהמדידה נעשתה לפני הארוחה, ששתיית המים בכמות טובה (בד''כ 1.5-2.5 ליטרים ביממה), שהופחתו פחמימות ומתוקים מהמזון והשתיה (אלא אם נדרשת עליה במשקל) ושאין זיהום, אלכוהול, עישון או תרופה עודפת הגורמת עליית סוכר. אם זה המצב, נעלה מינון אינסולין קצר-טווח בצהרים",
    "NG2V", "VeryHigh", "זוהי רמת סוכר גבוהה באופן מסוכן הדורשת פניה מיידית לרופא.",
    "NI2E", "Empty Insulin", "אם הוזרק אתמול בערב אינסולין קצר-טווח - בבקשה לציין כמה. אם לא - בבקשה להשאיר ריק.",
    "NI2L", "lowDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בערב (אם לא הוזרק - בבקשה להשאיר ריק)",
    "NI2M", "mediumDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בערב (זהו מינון מעט גבוה, בבקשה לודא שלא נרשם בטעות)",
    "NI2H", "HighDose", "כאן מציינים כמה אינסולין קצר-טווח הוזרק אתמול בערב (זהו מינון <i><b>מאד</b></i> גבוה, חשוב לודא שלא נרשם בטעות)",
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

    /* Defining input elements filters*/
    {
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
        slider.value = mirrorText.value || 0;
        slider.force = 0.5;
        let sEvents = ["input", "change"];// removed "touchstart","touchmove","change",
        for (let x = 0; x < sEvents.length; x++) {
            let event = sEvents[x];
            slider.addEventListener(event, function () {
                slider.focus();
                updateNum_Slider();
            }, {passive: false});
        }
        const sBtnHtml = 'type="button" onClick="setS(this)" onmousedown="longTouch(this)" ' +
            'ontouchstart="longTouch(this)" onmouseup="quitTouch()" ontouchend="quitTouch()"'
        slider.insertAdjacentHTML('beforebegin',
            '<input class="sBtn clrBtn" name="clrBtn" value="&times"' + sBtnHtml + ">" +
            '\n<input class="sBtn lessBtn" name="lessBtn" value="-"' + sBtnHtml + ">");
        slider.insertAdjacentHTML('afterend',
            '<input class="sBtn moreBtn" name="moreBtn" value="+"' + sBtnHtml + '>' +
            '\n<input class="sBtn noteBtn" name="noteBtn" value="?" ' + sBtnHtml + ' width="4em"' +
            ' ondblclick="helper(this)">');
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
        case "noteBtn":
            elem.id = noteID4value(elem.previousElementSibling.previousElementSibling);// getElementsByClassName('noteBtn').item(0).id = noteID4value(aE);
            return;
        default:
            return;
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
            return (2 * n - n * n);
        }
        let ddHex = function (n) {  // returns a 2 digit hex representing relative range 0-1
            return ("0" + (Math.round(255 * n).toString(16).toUpperCase())).substr(-2);
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
                GluOffSet = augment(GluOffSet); // v color redder for higher dose
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
        bShadowStyle = '0 0 3px 3px lime';
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
    }, 20000);
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
    oForm.optimalGlucose.value = InitOptimalGlu;
    oForm.glucose_Insulin_Factor.value = InitInsGluFactor;
    autoFocusedE.focus();
}
