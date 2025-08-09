// Food Costing Calculator JavaScript
class FoodCostingCalculator {
  constructor() {
    this.ingredients = [];
    this.currentRecipe = null;
    this.isCalculating = false; // Prevent recursion
    this.autoSaveTimer = null; // For debounced auto-save
    this.init();
  }

  init() {
    this.loadSavedRecipes();
    this.addIngredient(); // Add first ingredient row
    this.bindEvents();
  }

  bindEvents() {
    // Auto-save on input changes (debounced to prevent loops)
    let autoSaveTimeout;
    document.addEventListener("input", e => {
      if (
        e.target.matches("#recipeName, #servings, #sellingPrice, #laborCost")
      ) {
        // Clear previous timeout to debounce
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
          this.autoSave();
        }, 1000); // Wait 1 second before auto-saving
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        this.saveRecipe();
      }
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        this.newRecipe();
      }
    });
  }

  // Ingredient Management
  addIngredient() {
    const table = document.getElementById("ingredientsTable");
    const rowIndex = table.rows.length;
    const row = table.insertRow();
    row.className = "ingredient-row adding";

    row.innerHTML = `
            <td>
                <input type="text" class="form-control ingredient-name" placeholder="Ingredient name" 
                       onchange="calculator.calculateCosts()" list="ingredientsList">
                <datalist id="ingredientsList">
                    <option value="Flour">
                    <option value="Sugar">
                    <option value="Butter">
                    <option value="Eggs">
                    <option value="Milk">
                    <option value="Salt">
                    <option value="Baking Powder">
                    <option value="Vanilla Extract">
                    <option value="Chocolate Chips">
                    <option value="Olive Oil">
                    <option value="Onions">
                    <option value="Garlic">
                    <option value="Tomatoes">
                    <option value="Chicken Breast">
                    <option value="Ground Beef">
                    <option value="Rice">
                    <option value="Pasta">
                    <option value="Cheese">
                    <option value="Lettuce">
                    <option value="Carrots">
                </datalist>
            </td>
            <td>
                <input type="number" class="form-control ingredient-quantity" step="0.01" min="0" 
                       placeholder="0" onchange="calculator.calculateCosts()">
            </td>
            <td>
                <select class="form-select ingredient-unit" onchange="calculator.calculateCosts()">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="piece">piece</option>
                    <option value="dozen">dozen</option>
                </select>
            </td>
            <td>
                <input type="number" class="form-control ingredient-cost" step="0.01" min="0" 
                       placeholder="0.00" onchange="calculator.calculateCosts()">
            </td>
            <td>
                <span class="badge bg-primary ingredient-total">₱0.00</span>
            </td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="calculator.removeIngredient(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

    setTimeout(() => {
      row.classList.remove("adding");
    }, 100);
  }

  removeIngredient(button) {
    const row = button.closest("tr");
    row.classList.add("removing");

    setTimeout(() => {
      row.remove();
      this.calculateCosts();
    }, 300);
  }

  // Cost Calculations
  calculateCosts() {
    // Prevent recursion by checking if already calculating
    if (this.isCalculating) return;
    this.isCalculating = true;

    const rows = document.querySelectorAll("#ingredientsTable tr");
    let totalIngredientCost = 0;

    rows.forEach(row => {
      const quantity = parseFloat(
        row.querySelector(".ingredient-quantity")?.value || 0
      );
      const cost = parseFloat(
        row.querySelector(".ingredient-cost")?.value || 0
      );
      const total = quantity * cost;

      const totalElement = row.querySelector(".ingredient-total");
      if (totalElement) {
        totalElement.textContent = `₱${total.toFixed(2)}`;
        totalElement.classList.add("cost-updated");
        setTimeout(() => totalElement.classList.remove("cost-updated"), 500);
      }

      totalIngredientCost += total;
    });

    const laborCost = parseFloat(
      document.getElementById("laborCost").value || 0
    );
    const servings = parseInt(document.getElementById("servings").value || 1);

    const totalCost = totalIngredientCost + laborCost;
    const costPerServing = totalCost / servings;

    // Update display
    this.updateCostDisplay("totalCost", totalCost);
    this.updateCostDisplay("costPerServing", costPerServing);

    this.calculateProfitability();

    // Reset the calculating flag
    this.isCalculating = false;

    // Auto-save with debounce
    this.debouncedAutoSave();
  }

  calculateProfitability() {
    const sellingPrice = parseFloat(
      document.getElementById("sellingPrice").value || 0
    );
    const costPerServing = parseFloat(
      document.getElementById("costPerServing").textContent.replace("₱", "") ||
        0
    );

    if (sellingPrice > 0) {
      const profit = sellingPrice - costPerServing;
      const profitMargin = (profit / sellingPrice) * 100;
      const foodCostPercentage = (costPerServing / sellingPrice) * 100;

      document.getElementById(
        "profitMargin"
      ).textContent = `${profitMargin.toFixed(1)}%`;
      document.getElementById(
        "foodCostPercentage"
      ).textContent = `${foodCostPercentage.toFixed(1)}%`;

      // Color coding for profitability
      const marginElement = document.getElementById("profitMargin");
      const costElement = document.getElementById("foodCostPercentage");

      if (profitMargin >= 60) {
        marginElement.className = "text-success";
      } else if (profitMargin >= 30) {
        marginElement.className = "text-warning";
      } else {
        marginElement.className = "text-danger";
      }

      if (foodCostPercentage <= 30) {
        costElement.className = "text-success";
      } else if (foodCostPercentage <= 40) {
        costElement.className = "text-warning";
      } else {
        costElement.className = "text-danger";
      }
    } else {
      document.getElementById("profitMargin").textContent = "0%";
      document.getElementById("foodCostPercentage").textContent = "0%";
    }
  }

  updateCostDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    element.textContent = `₱${value.toFixed(2)}`;
    element.classList.add("cost-updated");
    setTimeout(() => element.classList.remove("cost-updated"), 500);
  }

  // Recipe Management
  newRecipe() {
    if (confirm("Start a new recipe? Unsaved changes will be lost.")) {
      this.clearForm();
      this.currentRecipe = null;
      this.showMessage("New recipe started", "success");
    }
  }

  // Debounced auto-save to prevent loops
  debouncedAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.autoSave();
    }, 500);
  }

  saveRecipe() {
    const recipeName = document.getElementById("recipeName").value.trim();

    if (!recipeName) {
      this.showMessage("Please enter a recipe name", "danger");
      return;
    }

    const recipe = this.getRecipeData();
    const recipes = this.getSavedRecipes();

    recipes[recipeName] = recipe;
    localStorage.setItem("foodCostingRecipes", JSON.stringify(recipes));

    this.currentRecipe = recipeName;
    this.loadSavedRecipes();
    this.showMessage(`Recipe "${recipeName}" saved successfully!`, "success");
  }

  loadRecipe() {
    const recipes = this.getSavedRecipes();
    const recipeNames = Object.keys(recipes);

    if (recipeNames.length === 0) {
      this.showMessage("No saved recipes found", "info");
      return;
    }

    let recipesList = '<div class="list-group">';
    recipeNames.forEach(name => {
      const recipe = recipes[name];
      const lastModified = new Date(recipe.lastModified).toLocaleDateString();
      recipesList += `
                <button class="list-group-item list-group-item-action" onclick="calculator.selectRecipe('${name}')">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${name}</h6>
                        <small class="text-muted">${lastModified}</small>
                    </div>
                    <p class="mb-1">Servings: ${recipe.servings} | Cost: ₱${recipe.totalCost}</p>
                    <small class="text-muted">${recipe.ingredients.length} ingredients</small>
                </button>
            `;
    });
    recipesList += "</div>";

    document.getElementById("recipesList").innerHTML = recipesList;
    new bootstrap.Modal(document.getElementById("loadRecipeModal")).show();
  }

  selectRecipe(recipeName) {
    const recipes = this.getSavedRecipes();
    const recipe = recipes[recipeName];

    if (recipe) {
      this.loadRecipeData(recipe);
      this.currentRecipe = recipeName;

      // Hide the modal safely
      const modalElement = document.getElementById("loadRecipeModal");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        // Fallback: create new instance and hide
        const modal = new bootstrap.Modal(modalElement);
        modal.hide();
      }

      this.showMessage(
        `Recipe "${recipeName}" loaded successfully!`,
        "success"
      );
    }
  }

  deleteRecipe(recipeName) {
    if (
      confirm(`Delete recipe "${recipeName}"? This action cannot be undone.`)
    ) {
      const recipes = this.getSavedRecipes();
      delete recipes[recipeName];
      localStorage.setItem("foodCostingRecipes", JSON.stringify(recipes));
      this.loadSavedRecipes();
      this.showMessage(`Recipe "${recipeName}" deleted`, "info");
    }
  }

  getRecipeData() {
    const rows = document.querySelectorAll("#ingredientsTable tr");
    const ingredients = [];

    rows.forEach(row => {
      const name = row.querySelector(".ingredient-name")?.value || "";
      const quantity = parseFloat(
        row.querySelector(".ingredient-quantity")?.value || 0
      );
      const unit = row.querySelector(".ingredient-unit")?.value || "";
      const cost = parseFloat(
        row.querySelector(".ingredient-cost")?.value || 0
      );

      if (name && quantity > 0) {
        ingredients.push({ name, quantity, unit, cost });
      }
    });

    return {
      name: document.getElementById("recipeName").value,
      servings: parseInt(document.getElementById("servings").value || 1),
      sellingPrice: parseFloat(
        document.getElementById("sellingPrice").value || 0
      ),
      laborCost: parseFloat(document.getElementById("laborCost").value || 0),
      ingredients: ingredients,
      totalCost: document
        .getElementById("totalCost")
        .textContent.replace("₱", ""),
      lastModified: new Date().toISOString(),
    };
  }

  loadRecipeData(recipe) {
    document.getElementById("recipeName").value = recipe.name;
    document.getElementById("servings").value = recipe.servings;
    document.getElementById("sellingPrice").value = recipe.sellingPrice;
    document.getElementById("laborCost").value = recipe.laborCost;

    // Clear existing ingredients
    document.getElementById("ingredientsTable").innerHTML = "";

    // Load ingredients
    recipe.ingredients.forEach(ingredient => {
      this.addIngredient();
      const rows = document.querySelectorAll("#ingredientsTable tr");
      const lastRow = rows[rows.length - 1];

      lastRow.querySelector(".ingredient-name").value = ingredient.name;
      lastRow.querySelector(".ingredient-quantity").value = ingredient.quantity;
      lastRow.querySelector(".ingredient-unit").value = ingredient.unit;
      lastRow.querySelector(".ingredient-cost").value = ingredient.cost;
    });

    this.calculateCosts();
  }

  clearForm() {
    document.getElementById("recipeName").value = "";
    document.getElementById("servings").value = "1";
    document.getElementById("sellingPrice").value = "";
    document.getElementById("laborCost").value = "0";
    document.getElementById("ingredientsTable").innerHTML = "";
    this.addIngredient();
    this.calculateCosts();
  }

  // LocalStorage Management
  getSavedRecipes() {
    return JSON.parse(localStorage.getItem("foodCostingRecipes") || "{}");
  }

  loadSavedRecipes() {
    const recipes = this.getSavedRecipes();
    const container = document.getElementById("savedRecipes");

    if (Object.keys(recipes).length === 0) {
      container.innerHTML = '<p class="text-muted small">No saved recipes</p>';
      return;
    }

    let html = "";
    Object.keys(recipes).forEach(name => {
      const recipe = recipes[name];
      html += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <span onclick="calculator.selectRecipe('${name}')" style="cursor: pointer;">${name}</span>
                    <button class="btn btn-outline-danger btn-sm" onclick="calculator.deleteRecipe('${name}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
    });

    container.innerHTML = html;
  }

  autoSave() {
    const recipeName = document.getElementById("recipeName").value.trim();
    if (recipeName && this.currentRecipe === recipeName) {
      // Auto-save current recipe
      const recipe = this.getRecipeData();
      const recipes = this.getSavedRecipes();
      recipes[recipeName] = recipe;
      localStorage.setItem("foodCostingRecipes", JSON.stringify(recipes));
    }

    // Save current state
    const currentState = this.getRecipeData();
    localStorage.setItem(
      "foodCostingCurrentState",
      JSON.stringify(currentState)
    );
  }

  loadAutoSave() {
    const currentState = localStorage.getItem("foodCostingCurrentState");
    if (currentState) {
      const state = JSON.parse(currentState);
      this.loadRecipeData(state);
    }
  }

  // Utility Functions
  exportData() {
    const recipes = this.getSavedRecipes();
    const dataStr = JSON.stringify(recipes, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = "food_costing_recipes.json";
    link.click();

    this.showMessage("Recipes exported successfully!", "success");
  }

  importData() {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedData = JSON.parse(e.target.result);

          // Validate the imported data structure
          if (typeof importedData !== "object" || importedData === null) {
            throw new Error("Invalid file format: Expected JSON object");
          }

          // Check if it's a valid recipes format
          const isValidFormat = Object.values(importedData).every(
            recipe =>
              recipe &&
              typeof recipe.name === "string" &&
              Array.isArray(recipe.ingredients) &&
              typeof recipe.servings === "number"
          );

          if (!isValidFormat) {
            throw new Error("Invalid recipes format: Missing required fields");
          }

          // Ask user if they want to merge or replace
          const shouldMerge = confirm(
            `Import ${Object.keys(importedData).length} recipes?\n\n` +
              "Click OK to MERGE with existing recipes\n" +
              "Click Cancel to REPLACE all existing recipes"
          );

          let existingRecipes = {};
          if (shouldMerge) {
            existingRecipes = this.getSavedRecipes();
          }

          // Merge or replace recipes
          const finalRecipes = { ...existingRecipes, ...importedData };

          // Save to localStorage
          localStorage.setItem(
            "foodCostingRecipes",
            JSON.stringify(finalRecipes)
          );

          // Refresh the UI
          this.loadSavedRecipes();

          const importCount = Object.keys(importedData).length;
          const totalCount = Object.keys(finalRecipes).length;

          this.showMessage(
            `Successfully imported ${importCount} recipes! Total recipes: ${totalCount}`,
            "success"
          );
        } catch (error) {
          console.error("Import error:", error);
          this.showMessage(`Import failed: ${error.message}`, "danger");
        }
      };

      reader.readAsText(file);
    });

    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  clearAllData() {
    if (confirm("Clear all saved recipes? This action cannot be undone.")) {
      localStorage.removeItem("foodCostingRecipes");
      localStorage.removeItem("foodCostingCurrentState");
      this.loadSavedRecipes();
      this.clearForm();
      this.showMessage("All data cleared", "info");
    }
  }

  printRecipe() {
    window.print();
  }

  exportToPDF() {
    // This would require a PDF library like jsPDF
    this.showMessage("PDF export feature coming soon!", "info");
  }

  showMessage(message, type = "info") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = "20px";
    alertDiv.style.right = "20px";
    alertDiv.style.zIndex = "9999";
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 5000);
  }
}

// Initialize the calculator
const calculator = new FoodCostingCalculator();

// Global functions for HTML onclick events
function addIngredient() {
  calculator.addIngredient();
}

function newRecipe() {
  calculator.newRecipe();
}

function saveRecipe() {
  calculator.saveRecipe();
}

function loadRecipe() {
  calculator.loadRecipe();
}

function exportData() {
  calculator.exportData();
}

function importData() {
  calculator.importData();
}

function clearAllData() {
  calculator.clearAllData();
}

function printRecipe() {
  calculator.printRecipe();
}

function exportToPDF() {
  calculator.exportToPDF();
}

// Load auto-saved state on page load
window.addEventListener("load", () => {
  calculator.loadAutoSave();
});

// Auto-save before page unload
window.addEventListener("beforeunload", () => {
  calculator.autoSave();
});
