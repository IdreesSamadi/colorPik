//selectors
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const hexText = document.querySelectorAll(".color h2");
const lockBtns = document.querySelectorAll(".lock");
const adjustBtns = document.querySelectorAll(".adjust");
const sliders = document.querySelectorAll('.sliders [type="range"]');
const copyPopup = document.querySelector(".copy-container");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainer = document.querySelectorAll(".sliders");
let initialColors;

//event listeners
generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", (e) => {
    updateColor(e);
  });
});

colorDivs.forEach((colorDiv, index) => {
  colorDiv.addEventListener("change", () => {
    updateTextUI(index);
  });
});

hexText.forEach((hexText) => {
  hexText.addEventListener("click", () => {
    copyToClipboard(hexText);
  });
});

copyPopup.addEventListener("transitionend", () => {
  const popupBox = copyPopup.children[0];
  popupBox.classList.remove("active");
  copyPopup.classList.remove("active");
});

adjustBtns.forEach((adjustBtn, index) => {
  adjustBtn.addEventListener("click", (e) => {
    openAdjustSliders(e, index);
  });
});

closeAdjustments.forEach((closeAdj, index) => {
  closeAdj.addEventListener("click", () => {
    sliderContainer[index].classList.remove("active");
  });
});

lockBtns.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});

//functions
function generateHex() {
  return chroma.random();
}
function randomColors() {
  initialColors = [];
  colorDivs.forEach((colorDiv, index) => {
    randomColor = generateHex();

    if (colorDiv.classList.contains("locked")) {
      initialColors.push(colorDiv.children[0].innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    colorDiv.style.backgroundColor = randomColor;

    //hexText[index].innerText = randomColor.hex();
    colorDiv.children[0].innerText = randomColor;
    checkTextContrast(randomColor, colorDiv.children[0]);
    checkTextContrast(randomColor, lockBtns[index]);
    checkTextContrast(randomColor, adjustBtns[index]);

    const sliders = colorDiv.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    colorizeSliders(randomColor, hue, brightness, saturation);
  });
  resetInput();
}

function checkTextContrast(color, text) {
  const colorLuminance = chroma(color).luminance();
  if (colorLuminance <= 0.5) {
    text.style.color = "white";
  } else {
    text.style.color = "black";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  const lowSat = chroma(color).set("hsl.s", 0);
  const highSat = chroma(color).set("hsl.s", 1);
  const satScale = chroma.scale([lowSat, color, highSat]);

  saturation.style.backgroundImage = `linear-gradient(to right, ${satScale(
    0
  )}, ${satScale(1)})`;

  const midBright = chroma(color).set("hsl.l", 0.5);
  const brightScale = chroma.scale(["black", midBright, "white"]);
  brightness.style.backgroundImage = `linear-gradient(to right, ${brightScale(
    0
  )},${brightScale(0.5)},${brightScale(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75, 75, 204),rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function updateColor(e) {
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-brightness") ||
    e.target.getAttribute("data-saturation");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  bgColor = initialColors[index];

  color = chroma(bgColor)
    .set("hsl.h", hue.value)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value);

  colorDivs[index].style.background = color;
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const hexText = activeDiv.children[0];
  hexText.innerText = color.hex();
  checkTextContrast(color, hexText);
  checkTextContrast(color, lockBtns[index]);
  checkTextContrast(color, adjustBtns[index]);
}

function resetInput() {
  const inputSliders = document.querySelectorAll(".sliders input");
  inputSliders.forEach((inputSlider) => {
    if (inputSlider.name === "hue") {
      const hueColor = initialColors[inputSlider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      inputSlider.value = Math.floor(hueValue);
    }
    if (inputSlider.name === "saturation") {
      const saturationColor =
        initialColors[inputSlider.getAttribute("data-saturation")];
      const saturationValue = chroma(saturationColor).hsl()[1];
      inputSlider.value = Math.floor(saturationValue * 100) / 100;
    }
    if (inputSlider.name === "brightness") {
      const brightnessColor =
        initialColors[inputSlider.getAttribute("data-brightness")];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      inputSlider.value = Math.floor(brightnessValue * 100) / 100;
    }
  });
}

function copyToClipboard(hexText) {
  //hack to copy text to clipboard
  const textArea = document.createElement("textarea");
  textArea.value = hexText.innerText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  const popupBox = copyPopup.children[0];
  popupBox.classList.add("active");
  copyPopup.classList.add("active");
}

function openAdjustSliders(e, index) {
  sliderContainer[index].classList.toggle("active");
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

//============================================================
//                    Save and localStorage
//===========================================================
const saveBtn = document.querySelector(".save");
const libraryBtn = document.querySelector(".library");
const savePopup = document.querySelector(".save-container");
const libraryPopup = document.querySelector(".library-container");
const closeSaveWin = document.querySelector(".close-save");
const closeLibraryWin = document.querySelector(".close-library");
const submitSaveBtn = document.querySelector(".submit-save");
const saveNameInput = document.querySelector(".save-name");
let savedPalettes = [];

saveBtn.addEventListener("click", () => {
  savePopup.classList.toggle("active");
});

closeSaveWin.addEventListener("click", () => {
  savePopup.classList.remove("active");
});

submitSaveBtn.addEventListener("click", (e) => {
  savePalette(e);
});
libraryBtn.addEventListener("click", () => {
  libraryPopup.classList.toggle("active");
});
closeLibraryWin.addEventListener("click", closeLibrary);

function closeLibrary() {
  libraryPopup.classList.remove("active");
}

function savePalette(e) {
  savePopup.classList.remove("active");
  const name = saveNameInput.value;
  const colors = [];
  hexText.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }
  const paletteObj = { name: name, colors: colors, num: paletteNr };
  savedPalettes.push(paletteObj);

  //save to local storage
  saveToLocalStorage(paletteObj);

  saveNameInput.value = "";

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");

  paletteObj.colors.forEach((Color) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = Color;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.num);
  paletteBtn.innerText = "select";

  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInput();
  });
  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryPopup.children[0].appendChild(palette);
}

function saveToLocalStorage(paletteObj) {
  let localPallets;
  if (localStorage.getItem("palettes") === null) {
    localPallets = [];
  } else {
    localPallets = JSON.parse(localStorage.getItem("palettes"));
  }
  localPallets.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPallets));
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPallets = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      //generate the palette for library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.num);
      paletteBtn.innerText = "select";

      //attach event to the btn
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInput();
      });
      //append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryPopup.children[0].appendChild(palette);
    });
  }
}
getLocal();
randomColors();
//console.log(initialColors[0].hex());
