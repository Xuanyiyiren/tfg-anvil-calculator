import { calculateResults } from "./calculator.js";

function createActionImage(action) {
  const img = document.createElement("img");
  img.src = `../res/${action}.png`;
  img.alt = action;
  img.title = action.charAt(0).toUpperCase() + action.slice(1);
  img.classList.add("result-icon");
  return img;
}

function applyTooltipToIcon(iconElement) {
  const action = iconElement.getAttribute("data-action");

  if (action) {
    iconElement.title = action.charAt(0).toUpperCase() + action.slice(1);
    return;
  }

  if (action === "") {
    iconElement.title = "None";
  }
}

function collectInstructions() {
  const instructions = [];

  document.querySelectorAll(".instruction-set").forEach((set) => {
    const actionElement = set.querySelector(".action-icon");
    const action = actionElement.getAttribute("data-action");
    const priority = set.querySelector(".priority").value;

    if (action && priority) {
      instructions.push({ action, priority });
    }
  });

  return instructions;
}

function renderResults(setupActions, finalInstructions) {
  const setupContainer = document.getElementById("setup-actions");
  const finalContainer = document.getElementById("final-actions");

  setupContainer.innerHTML = "";
  finalContainer.innerHTML = "";

  setupActions.forEach((action) => {
    setupContainer.appendChild(createActionImage(action));
  });

  finalInstructions.forEach((instruction) => {
    finalContainer.appendChild(createActionImage(instruction.action));
  });

  document.getElementById("result").classList.add("visible");
}

function resetPage() {
  document.getElementById("target-value").value = "";

  document.querySelectorAll(".instruction-set").forEach((set) => {
    const actionIcon = set.querySelector(".action-icon");
    actionIcon.src = "../res/empty.png";
    actionIcon.setAttribute("data-action", "");
    actionIcon.title = "None";

    const prioritySelect = set.querySelector(".priority");
    if (prioritySelect) {
      prioritySelect.selectedIndex = 0;
    }
  });

  document.getElementById("result").classList.remove("visible");
  document.getElementById("setup-actions").innerHTML = "";
  document.getElementById("final-actions").innerHTML = "";
}

function setupInstructionListener(selector) {
  const icon = document.querySelector(`${selector} .action-icon`);
  const container = document.querySelector(".container");
  const popup = document.getElementById("action-popup");
  const popupContent = document.querySelector(".action-popup-content");
  const header = document.querySelector(".app-header");

  icon.addEventListener("click", function handleIconClick() {
    const currentIcon = this;
    popup.classList.remove("hidden");
    container.classList.add("blurred");

    document.querySelectorAll(".popup-action-icon").forEach((popupIcon) => {
      popupIcon.onclick = null;
    });

    document.querySelectorAll(".popup-action-icon").forEach((popupIcon) => {
      applyTooltipToIcon(popupIcon);

      popupIcon.onclick = function handlePopupSelection() {
        currentIcon.src = this.src;
        currentIcon.setAttribute("data-action", this.getAttribute("data-action"));
        applyTooltipToIcon(currentIcon);
        closePopup();
      };
    });

    function handleOutsideClick(event) {
      if (
        !popupContent.contains(event.target) &&
        !icon.contains(event.target) &&
        !header.contains(event.target)
      ) {
        closePopup();
      }
    }

    function closePopup() {
      popup.classList.add("hidden");
      container.classList.remove("blurred");
      document.removeEventListener("click", handleOutsideClick);
    }

    document.addEventListener("click", handleOutsideClick);
    document.getElementById("close-popup").onclick = closePopup;
  });

  applyTooltipToIcon(icon);
}

function initializeInstructionListeners() {
  document.querySelectorAll(".popup-action-icon").forEach((popupIcon) => {
    applyTooltipToIcon(popupIcon);
  });

  setupInstructionListener(".instruction-set-1");
  setupInstructionListener(".instruction-set-2");
  setupInstructionListener(".instruction-set-3");
}

function bindCalculator() {
  document.getElementById("calculate-button").addEventListener("click", () => {
    const targetValue = parseInt(document.getElementById("target-value").value, 10);
    const instructions = collectInstructions();
    const { setupActions, finalInstructions } = calculateResults(targetValue, instructions);

    renderResults(setupActions, finalInstructions);
  });
}

export function initializeUi() {
  resetPage();
  initializeInstructionListeners();
  bindCalculator();
}
