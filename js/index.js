type="text/javascript"

  /* Initial parameters */
let InitOptimalGlu = 180;
let InitInsGluFactor = 18;
let initInsulin = 0;

 /* Dictionary - Trios of: "id", "hebrew text", "hebrew help",... */
let Dict = [
  "Insulin_Glucose_Header","אינסולין היום לפי אתמול","",
  "disclaimer","מחשבון - לא תחליף ליעוץ רפואי","לפרטים: דר ניר צבר  TSABAR.NIR@GMAIL.COM",
  "Glucose_measured_today_morning","סוכר שנמדד <i><b>היום</b></i> בבוקר","סוכר שנמדד <i><b>היום</b></i> הבוקר בצום",
  "Insulin_given_yesterday_morning","אינסולין שניתן אתמול בבוקר","כמה יחידות אינסולין הוזרקו אתמול בבוקר?",
  "Glucose_measured_yesterday_noon","סוכר שנמדד אתמול בצהרים","סוכר שנמדד בצהרים אתמול",
  "Insulin_given_yesterday_noon","אינסולין שניתן אתמול בצהרים","אינסולין שניתן בצהרים אתמול",
  "Glucose_measured_yesterday_evening","סוכר שנמדד אתמול בערב","סוכר שנמדד בערב אתמול",
  "Insulin_given_yesterday_evening","אינסולין שניתן אתמול בערב","כמה אינסולין הוזרק בערב אתמול ?",
  "Optimal_glucose","רמת סוכר אופטימלית","את רמת הסוכר האופטימלית יש להתאים לרמת הסיכון לנפילות סוכר, לגיל ולמצב התפקודי",
  "GIR","תיקון סוכר ליחידת אינסולין","מספר גבוה יביא לתיקון עדין יותר",
  "gItiptxt","את רמת הסוכר האופטימלית יש להתאים לגיל ומצב תפקודי","רמת הסוכר האופטימלית בטיפול תרופתי גבוהה יותר ככל שהגיל עולה או המצב התפקודי יורד. בסוכרת מסוג 2 עדיף להפחית סוכר באמצעות תזונה נכונה מאשר באמצעות תרופות",
  "rI0t","אינסולין מחושב להבוקר","החישוב נותן הערכה בלבד ובהנחה שהתנאים לא השתנו מאתמול",
  "rI1t","אינסולין מחושב לצהרים","החישוב נותן הערכה בלבד ובהנחה שהתנאים לא השתנו מאתמול",
  "rI2t","אינסולין ארוך-טווח מחושב","החישוב נותן הערכה בלבד ובהנחה שהתנאים לא השתנו מאתמול" ,
  "CalcBtn","חשב","סימן '?' מופיע כאשר חסר נתון מתאים של סוכר",
  "CalcBtnH","?","סימן '?' מופיע כאשר חסר נתון מתאים של סוכר",
  "ZeroBtn","איפוס","לחיצה לאיפוס מלא. לאתחול מחדש - ניתן לרענן את הדף",
  "ZeroBtnH","?","לחיצה לאיפוס מלא. לאתחול מחדש - ניתן לרענן את הדף",
  "SubmitBtn","שלח","אופס... עובד על זה...",
  "SubmitBtnH","?","האפשרות לשלוח - כרגע רק בשלב תכנון"
  ];

function tP (tID) { /* Hebrew text placement. Use an html.element parameter*/
  ttext=Dict[Dict.findIndex(x=>x===tID.id)+1];
  tID.innerHTML = ttext;
  if (tID.type === "button") {
    tID.setAttribute("value", ttext);
  }
}
function tPHelp (thID) { /* Hebrew Help Tips placement. Use an html.element parameter*/
  htext=Dict[Dict.findIndex(x=>x===thID.id)+2];
  return htext;
}

function formInit(iForm) {

  /* Initialization of form parameters*/
  iForm.glucose0.value = initInsulin;
  iForm.glucose1.value = initInsulin;
  iForm.glucose2.value = "";
  iForm.insulin0.value = initInsulin;
  iForm.insulin1.value = initInsulin;
  iForm.insulin2.value = initInsulin;
  iForm.optimalGlucose.value = InitOptimalGlu;
  iForm.glucose_Insulin_Factor.value = InitInsGluFactor;

  /* Initialization of form texts*/
  let TxtElmnts = document.getElementById("outer").
                  querySelectorAll(".input_txt, .has_tip");
  for (let i = 0; i < TxtElmnts.length; i++) {
    let tElem = TxtElmnts[i];
    tP(tElem); // <= Placing the correct texts
    if (tElem.nodeName !== "INPUT") {
      tElem.setAttribute('onclick','helper(this.id)'); //Putting helper popups
    }
  }
}

function show_tip(e_id) { /*. Use an html.element.id parameter*/
  etip = document.getElementById(e_id);
  if (etip.nextSibling.id==null) {
    etip.insertAdjacentHTML("afterend", '<p id="e_Tip" font-size="inherit"></p>');
    e_Tip.innerHTML=tPHelp(etip);
    e_Tip.addEventListener("mouseout", hide_tip);
  }
}

function hide_tip() {
  setTimeout(function() {
    hTip=document.getElementById("e_Tip");
    hTip.style.color = "transparent";
    let fs = window.getComputedStyle(hTip).getPropertyValue("height");
    let fsN = Number(fs.slice(0,fs.length-2));
    let i = 100;
    let t = setInterval(frame, 4);
    function frame() {
      if (i < 0) {
        clearInterval(t);
        hTip.style.height = fsN+"px";
        hTip.remove();
    } else {
        i --;
        fs = fsN*i/100+"px";
        hTip.style.height = fs;
      }
    }
  }, 800);
}

// When the user clicks the trigger, open the modal
var fader;
var htimer;
function helper(helpID) {
  document.getElementById(helpID).style.borderColor = "lightgreen";
  // Get the help text by it's ID and place it in
  help_tP = tPHelp(document.getElementById(helpID));
  document.getElementById("helpText").innerHTML = help_tP;
  // Get the modal and display it
  let modal = document.getElementById("myModal");
  modal.style.display = "block";
  modal.style.opacity = 1.0;
  modal.onclick = function() {
    clearInterval(fader);
    clearTimeout(htimer);
    fadeOut(modal,helpID);
  };
  htimer = setTimeout(function() {
    fadeOut(modal,helpID);
  }, 2000);
}
function fadeOut(fElem, hID) {
  //clearInterval(fader);
  let fader = setInterval(function () {
    if (!fElem.style.opacity) {
        fElem.style.opacity = 1;
    }
    if (fElem.style.opacity > 0) {
        fElem.style.opacity -= 0.1;
    } else {
        clearInterval(fader);
        fElem.style.display = "none";
        fElem.style.opacity = 1;
        document.getElementById(hID).style.borderColor = "green";
    }
  }, 50);
}

function insulinDelta(glucose, igForm) {
  let delta = 0;
  delta = (glucose - igForm.optimalGlucose.value) / (igForm.glucose_Insulin_Factor.value);
  if (glucose === "") {delta = "?"}
  return delta;
}

function correctedInsulin(insulinDose) {
  if (isNaN(insulinDose)) {
    return "?";
  } else {
    if (insulinDose < 0) {
      return 0;}
    else {
      return insulinDose.toFixed(0);
    }
  }
}

function update(this_form) {
  let ri0 = Number(this_form.insulin0.value) + insulinDelta(this_form.glucose1.value, this_form);
  this_form.rInsulin0.value = correctedInsulin(ri0);
  let ri1 = Number(this_form.insulin1.value) + insulinDelta(this_form.glucose2.value, this_form);
  this_form.rInsulin1.value = correctedInsulin(ri1);
  let ri2 = Number(this_form.insulin2.value) + insulinDelta(this_form.glucose0.value, this_form);
  this_form.rInsulin2.value = correctedInsulin(ri2);
}

function check_data(t_form) {
/* t_form.glucose_Insulin_Factor.style.color="yellow";*/
  if (Number(t_form.glucose_Insulin_Factor.value<=0)) {
    t_form.glucose_Insulin_Factor.value = InitInsGluFactor;
    show_remark(t_form.gItiptxt);
  }
}

function clearForm(oForm) {
  oForm.reset();
}

</script>
