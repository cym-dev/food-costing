// Dashboard Analytics JavaScript
class DashboardAnalytics {
  constructor() {
    // Prevent multiple instances
    if (window.dashboardInstance) {
      return window.dashboardInstance;
    }

    this.recipes = this.getRecipesData();
    this.charts = {};
    this.isInitialized = false; // Prevent multiple initializations
    this.chartsCreated = false; // Prevent chart recreation
    this.isInitializingCharts = false; // Prevent concurrent initialization

    // Mark this as the active instance
    window.dashboardInstance = this;

    this.init();
  }

  init() {
    // Prevent multiple initializations
    if (this.isInitialized) return;

    this.updateCurrentTime();
    this.loadOverviewStats();
    this.initializeCharts();
    this.loadRecipePerformance();
    this.loadMarketingRecommendations();
    this.loadCompetitiveAnalysis();
    this.loadCostOptimization();
    this.populatePricingSimulator();
    this.generateSmartAlerts();
    this.calculateForecasts();
    this.bindEvents();

    // Update time every minute
    setInterval(() => this.updateCurrentTime(), 60000);

    this.isInitialized = true;
  }

  bindEvents() {
    // Time range filter for charts
    document.querySelectorAll('input[name="timeRange"]').forEach(radio => {
      radio.addEventListener("change", () => this.updateChartTimeRange());
    });

    // Pricing simulator events with debouncing
    let marginTimeout;
    const targetMarginEl = document.getElementById("targetMargin");
    if (targetMarginEl) {
      targetMarginEl.addEventListener("input", e => {
        document.getElementById("targetMarginValue").textContent =
          e.target.value + "%";
        clearTimeout(marginTimeout);
        marginTimeout = setTimeout(() => {
          this.updatePricingSimulator();
        }, 300);
      });
    }

    const simulatorRecipeEl = document.getElementById("simulatorRecipe");
    if (simulatorRecipeEl) {
      simulatorRecipeEl.addEventListener("change", () => {
        this.updatePricingSimulator();
      });
    }

    let compTimeout;
    const competitorPriceEl = document.getElementById("competitorPrice");
    if (competitorPriceEl) {
      competitorPriceEl.addEventListener("input", () => {
        clearTimeout(compTimeout);
        compTimeout = setTimeout(() => {
          this.updateCompetitiveAnalysis();
        }, 500);
      });
    }

    const marketSegmentEl = document.getElementById("marketSegment");
    if (marketSegmentEl) {
      marketSegmentEl.addEventListener("change", () => {
        this.updateCompetitiveAnalysis();
      });
    }
  }

  updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateString = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    document.getElementById(
      "currentTime"
    ).textContent = `${dateString} ${timeString}`;
  }

  getRecipesData() {
    return JSON.parse(localStorage.getItem("foodCostingRecipes") || "{}");
  }

  loadOverviewStats() {
    const recipes = Object.values(this.recipes);
    const totalRecipes = recipes.length;

    // Calculate average profit margin
    const avgProfitMargin =
      recipes.length > 0
        ? recipes.reduce((sum, recipe) => {
            const costPerServing =
              parseFloat(recipe.totalCost) / recipe.servings;
            const profit = recipe.sellingPrice - costPerServing;
            const margin =
              recipe.sellingPrice > 0
                ? (profit / recipe.sellingPrice) * 100
                : 0;
            return sum + margin;
          }, 0) / recipes.length
        : 0;

    // Calculate average food cost percentage
    const avgFoodCost =
      recipes.length > 0
        ? recipes.reduce((sum, recipe) => {
            const costPerServing =
              parseFloat(recipe.totalCost) / recipe.servings;
            const foodCostPct =
              recipe.sellingPrice > 0
                ? (costPerServing / recipe.sellingPrice) * 100
                : 0;
            return sum + foodCostPct;
          }, 0) / recipes.length
        : 0;

    // Calculate revenue projection
    const dailySales = 50; // Default assumption
    const avgSellingPrice =
      recipes.length > 0
        ? recipes.reduce((sum, recipe) => sum + recipe.sellingPrice, 0) /
          recipes.length
        : 0;
    const monthlyRevenue = dailySales * avgSellingPrice * 30;

    // Update display
    this.animateCounter("totalRecipes", totalRecipes);
    this.animateCounter("avgProfitMargin", avgProfitMargin.toFixed(1), "%");
    this.animateCounter("avgFoodCost", avgFoodCost.toFixed(1), "%");
    this.animateCounter(
      "revenueProjection",
      monthlyRevenue.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
      })
    );

    // Growth indicators (simulated)
    document.getElementById("recipeGrowth").textContent = "+12.5%";
    document.getElementById("profitGrowth").textContent = "+5.2%";
    document.getElementById("foodCostChange").textContent = "-3.1%";
  }

  animateCounter(elementId, targetValue, suffix = "") {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const duration = 1000;
    const increment = targetValue / (duration / 16);

    let currentValue = startValue;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }

      if (suffix === "%") {
        element.textContent = currentValue.toFixed(1) + suffix;
      } else if (elementId === "revenueProjection") {
        element.textContent = currentValue.toLocaleString("en-PH", {
          style: "currency",
          currency: "PHP",
        });
      } else {
        element.textContent = Math.floor(currentValue) + suffix;
      }
    }, 16);
  }

  initializeCharts() {
    // Prevent multiple chart initialization with stronger guards
    if (this.chartsCreated || this.isInitializingCharts) return;

    this.isInitializingCharts = true;

    try {
      // Destroy existing charts completely to prevent memory leaks and loops
      Object.keys(this.charts).forEach(key => {
        if (
          this.charts[key] &&
          typeof this.charts[key].destroy === "function"
        ) {
          this.charts[key].destroy();
        }
      });

      // Clear charts object completely
      this.charts = {};

      // Initialize new charts with error handling
      setTimeout(() => {
        try {
          this.initProfitabilityChart();
          // this.initCategoryChart(); // Commented out due to infinite loop issue
          this.initForecastChart();

          // Mark charts as created only after successful initialization
          this.chartsCreated = true;
        } catch (error) {
          console.error("Error initializing charts:", error);
        } finally {
          this.isInitializingCharts = false;
        }
      }, 100);
    } catch (error) {
      console.error("Error in chart initialization:", error);
      this.isInitializingCharts = false;
    }
  }

  initProfitabilityChart() {
    const ctx = document.getElementById("profitabilityChart").getContext("2d");

    // Generate sample data for the last 30 days
    const labels = [];
    const profitData = [];
    const costData = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );

      // Simulate profit margin trend
      const baseProfit = 45;
      const variation = Math.sin(i * 0.1) * 10 + Math.random() * 5;
      profitData.push(Math.max(20, baseProfit + variation));

      // Simulate food cost trend
      const baseCost = 35;
      const costVariation = Math.cos(i * 0.1) * 5 + Math.random() * 3;
      costData.push(Math.max(25, baseCost + costVariation));
    }

    this.charts.profitability = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Profit Margin %",
            data: profitData,
            borderColor: "#28a745",
            backgroundColor: "rgba(40, 167, 69, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Food Cost %",
            data: costData,
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 80,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
      },
    });
  }

  // COMMENTED OUT DUE TO INFINITE LOOP ISSUE
  // initCategoryChart() {
  //   const ctx = document.getElementById("categoryChart");
  //   if (!ctx || this.charts.category) return; // Prevent error if element doesn't exist or chart already exists

  //   const recipes = Object.values(this.recipes);

  //   // Categorize recipes by type - updated for coffee shop
  //   const categories = {
  //     "Hot Coffee": 0,
  //     "Iced Coffee": 0,
  //     "Hot Non-Coffee": 0,
  //     "Iced Non-Coffee": 0,
  //     "Specialty Drinks": 0,
  //   };

  //   // Categorize based on actual recipe data
  //   if (recipes.length > 0) {
  //     recipes.forEach(recipe => {
  //       const name = recipe.name.toLowerCase();
  //       if (
  //         name.includes("hot") &&
  //         (name.includes("coffee") ||
  //           name.includes("americano") ||
  //           name.includes("latte") ||
  //           name.includes("mocha"))
  //       ) {
  //         categories["Hot Coffee"]++;
  //       } else if (
  //         name.includes("iced") &&
  //         (name.includes("coffee") ||
  //           name.includes("americano") ||
  //           name.includes("latte") ||
  //           name.includes("mocha"))
  //       ) {
  //         categories["Iced Coffee"]++;
  //       } else if (
  //         name.includes("hot") &&
  //         (name.includes("chocolate") ||
  //           name.includes("cocoa") ||
  //           name.includes("matcha"))
  //       ) {
  //         categories["Hot Non-Coffee"]++;
  //       } else if (
  //         name.includes("iced") &&
  //         (name.includes("chocolate") ||
  //           name.includes("cocoa") ||
  //           name.includes("matcha"))
  //       ) {
  //         categories["Iced Non-Coffee"]++;
  //       } else if (
  //         name.includes("coffee") ||
  //         name.includes("americano") ||
  //         name.includes("latte") ||
  //         name.includes("mocha")
  //       ) {
  //         // Default coffee drinks (assume iced if not specified)
  //         categories["Iced Coffee"]++;
  //       } else if (
  //         name.includes("chocolate") ||
  //         name.includes("cocoa") ||
  //         name.includes("matcha") ||
  //         name.includes("strawberry")
  //       ) {
  //         // Non-coffee specialty drinks
  //         categories["Iced Non-Coffee"]++;
  //       } else {
  //         categories["Specialty Drinks"]++;
  //       }
  //     });
  //   } else {
  //     // Default distribution for demo
  //     categories["Hot Coffee"] = 5;
  //     categories["Iced Coffee"] = 8;
  //     categories["Hot Non-Coffee"] = 4;
  //     categories["Iced Non-Coffee"] = 6;
  //     categories["Specialty Drinks"] = 2;
  //   }

  //   const data = Object.values(categories);
  //   const labels = Object.keys(categories);
  //   const colors = ["#8B4513", "#4169E1", "#FF6347", "#32CD32", "#FF69B4"];

  //   // Use a one-time initialization flag for this specific chart
  //   if (ctx.hasAttribute("data-chart-initialized")) return;
  //   ctx.setAttribute("data-chart-initialized", "true");

  //   try {
  //     // Create chart with minimal configuration to prevent loops
  //     this.charts.category = new Chart(ctx, {
  //       type: "doughnut",
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             data: data,
  //             backgroundColor: colors,
  //             borderWidth: 2,
  //             borderColor: "#fff",
  //           },
  //         ],
  //       },
  //       options: {
  //         responsive: true,
  //         maintainAspectRatio: false,
  //         interaction: {
  //           intersect: false,
  //         },
  //         plugins: {
  //           legend: {
  //             display: false,
  //           },
  //           tooltip: {
  //             enabled: true,
  //           },
  //         },
  //         animation: false, // Completely disable animations
  //         animations: false, // Also disable this property
  //         transitions: {
  //           active: {
  //             animation: {
  //               duration: 0,
  //             },
  //           },
  //         },
  //       },
  //     });

  //     // Create legend synchronously, not with setTimeout
  //     this.createCategoryLegend(labels, data, colors);
  //   } catch (error) {
  //     console.error("Error creating category chart:", error);
  //     // Remove the initialization flag if chart creation failed
  //     ctx.removeAttribute("data-chart-initialized");
  //   }
  // }

  // COMMENTED OUT DUE TO PIE CHART INFINITE LOOP ISSUE
  // createCategoryLegend(labels, data, colors) {
  //   const legendContainer = document.getElementById("categoryLegend");
  //   if (!legendContainer) return; // Prevent error if element doesn't exist

  //   // Stronger prevention of multiple legend creation
  //   if (
  //     legendContainer.hasAttribute("data-legend-created") ||
  //     legendContainer.children.length > 0
  //   )
  //     return;

  //   try {
  //     // Clear existing legend completely
  //     legendContainer.innerHTML = "";

  //     labels.forEach((label, index) => {
  //       // Only add items that have data
  //       if (data[index] > 0) {
  //         const legendItem = document.createElement("div");
  //         legendItem.className = "legend-item";
  //         legendItem.innerHTML = `
  //           <div class="legend-color" style="background-color: ${colors[index]}"></div>
  //           <div class="legend-text">${label}</div>
  //           <div class="legend-value">${data[index]}</div>
  //         `;
  //         legendContainer.appendChild(legendItem);
  //       }
  //     });

  //     // Mark legend as created with timestamp to track creation
  //     legendContainer.setAttribute(
  //       "data-legend-created",
  //       Date.now().toString()
  //     );
  //   } catch (error) {
  //     console.error("Error creating legend:", error);
  //   }
  // }

  initForecastChart() {
    const ctx = document.getElementById("forecastChart").getContext("2d");

    // Generate forecast data for next 12 months
    const labels = [];
    const forecastData = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      labels.push(date.toLocaleDateString("en-US", { month: "short" }));

      // Simulate revenue forecast with growth trend
      const baseRevenue = 50000;
      const growth = 1 + i * 0.05; // 5% monthly growth
      const seasonality = 1 + Math.sin(((i + 3) * Math.PI) / 6) * 0.2; // Seasonal variation
      forecastData.push(baseRevenue * growth * seasonality);
    }

    this.charts.forecast = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Projected Revenue (₱)",
            data: forecastData,
            backgroundColor: "rgba(0, 123, 255, 0.8)",
            borderColor: "#007bff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "₱" + (value / 1000).toFixed(0) + "K";
              },
            },
          },
        },
      },
    });
  }

  loadRecipePerformance() {
    const recipes = Object.values(this.recipes);

    // Sort by profitability
    const topRecipes = recipes
      .map(recipe => {
        const costPerServing = parseFloat(recipe.totalCost) / recipe.servings;
        const profit = recipe.sellingPrice - costPerServing;
        const profitMargin =
          recipe.sellingPrice > 0 ? (profit / recipe.sellingPrice) * 100 : 0;
        const foodCostPct =
          recipe.sellingPrice > 0
            ? (costPerServing / recipe.sellingPrice) * 100
            : 0;

        return {
          ...recipe,
          profitMargin,
          foodCostPct,
          potential: this.calculatePotential(profitMargin, foodCostPct),
        };
      })
      .sort((a, b) => b.profitMargin - a.profitMargin)
      .slice(0, 5);

    const attentionRecipes = recipes
      .map(recipe => {
        const costPerServing = parseFloat(recipe.totalCost) / recipe.servings;
        const profit = recipe.sellingPrice - costPerServing;
        const profitMargin =
          recipe.sellingPrice > 0 ? (profit / recipe.sellingPrice) * 100 : 0;
        const foodCostPct =
          recipe.sellingPrice > 0
            ? (costPerServing / recipe.sellingPrice) * 100
            : 0;

        let issue = "";
        let impact = "";
        let action = "";

        if (profitMargin < 20) {
          issue = "Low Profit";
          impact = "High";
          action = "Increase Price";
        } else if (foodCostPct > 40) {
          issue = "High Food Cost";
          impact = "Medium";
          action = "Optimize Ingredients";
        } else if (profitMargin < 30) {
          issue = "Below Target";
          impact = "Low";
          action = "Review Pricing";
        }

        return {
          ...recipe,
          profitMargin,
          foodCostPct,
          issue,
          impact,
          action,
        };
      })
      .filter(recipe => recipe.issue)
      .slice(0, 5);

    this.populateRecipeTable("topRecipesTable", topRecipes, "top");
    this.populateRecipeTable(
      "attentionRecipesTable",
      attentionRecipes,
      "attention"
    );
  }

  calculatePotential(profitMargin, foodCostPct) {
    if (profitMargin >= 50 && foodCostPct <= 30) return "Excellent";
    if (profitMargin >= 35 && foodCostPct <= 35) return "Good";
    if (profitMargin >= 25 && foodCostPct <= 40) return "Average";
    return "Poor";
  }

  populateRecipeTable(tableId, recipes, type) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = "";

    if (recipes.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center text-muted">No data available</td></tr>';
      return;
    }

    recipes.forEach(recipe => {
      const row = document.createElement("tr");

      if (type === "top") {
        row.innerHTML = `
                    <td>${recipe.name}</td>
                    <td><span class="badge ${this.getProfitBadgeClass(
                      recipe.profitMargin
                    )}">${recipe.profitMargin.toFixed(1)}%</span></td>
                    <td><span class="badge ${this.getCostBadgeClass(
                      recipe.foodCostPct
                    )}">${recipe.foodCostPct.toFixed(1)}%</span></td>
                    <td><span class="performance-${recipe.potential.toLowerCase()}">${
          recipe.potential
        }</span></td>
                `;
      } else {
        row.innerHTML = `
                    <td>${recipe.name}</td>
                    <td><span class="badge bg-warning">${
                      recipe.issue
                    }</span></td>
                    <td><span class="badge ${
                      recipe.impact === "High"
                        ? "bg-danger"
                        : recipe.impact === "Medium"
                        ? "bg-warning"
                        : "bg-info"
                    }">${recipe.impact}</span></td>
                    <td><button class="btn btn-sm btn-primary" onclick="dashboard.fixRecipe('${
                      recipe.name
                    }')">${recipe.action}</button></td>
                `;
      }

      tbody.appendChild(row);
    });
  }

  getProfitBadgeClass(margin) {
    if (margin >= 50) return "badge-profit-high";
    if (margin >= 30) return "badge-profit-medium";
    return "badge-profit-low";
  }

  getCostBadgeClass(cost) {
    if (cost <= 30) return "badge-cost-low";
    if (cost <= 40) return "badge-cost-medium";
    return "badge-cost-high";
  }

  loadMarketingRecommendations() {
    const container = document.getElementById("marketingRecommendations");
    const recipes = Object.values(this.recipes);

    const recommendations = [
      {
        title: "Bundle High-Profit Items",
        description:
          "Create combo meals featuring your highest-margin recipes to increase average transaction value.",
        priority: "high",
        impact: "25% revenue increase",
        action: "Create bundles",
      },
      {
        title: "Promote Premium Items",
        description:
          "Focus marketing efforts on items with 40%+ profit margins during peak hours.",
        priority: "high",
        impact: "15% margin improvement",
        action: "Adjust menu placement",
      },
      {
        title: "Seasonal Menu Optimization",
        description:
          "Introduce seasonal variations of top-performing recipes to maintain interest.",
        priority: "medium",
        impact: "10% sales boost",
        action: "Plan seasonal menu",
      },
      {
        title: "Value Perception Strategy",
        description:
          "Highlight ingredient quality and preparation methods for premium-priced items.",
        priority: "medium",
        impact: "5% price tolerance",
        action: "Update descriptions",
      },
      {
        title: "Cross-Selling Opportunities",
        description:
          "Train staff to suggest complementary items that improve overall profitability.",
        priority: "low",
        impact: "8% transaction value",
        action: "Staff training",
      },
    ];

    container.innerHTML = recommendations
      .map(
        rec => `
            <div class="recommendation-card priority-${rec.priority}">
                <h6><i class="fas fa-lightbulb"></i> ${rec.title}</h6>
                <p class="mb-2">${rec.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge">${rec.impact}</span>
                    <button class="btn btn-light btn-sm" onclick="dashboard.implementRecommendation('${rec.title}')">
                        ${rec.action}
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  loadCompetitiveAnalysis() {
    this.updateCompetitiveAnalysis();
  }

  updateCompetitiveAnalysis() {
    const container = document.getElementById("competitiveInsights");
    const competitorPrice = parseFloat(
      document.getElementById("competitorPrice").value || 0
    );
    const marketSegment = document.getElementById("marketSegment").value;

    if (competitorPrice === 0) {
      container.innerHTML =
        '<p class="text-muted">Enter competitor price to see analysis</p>';
      return;
    }

    const recipes = Object.values(this.recipes);
    const avgPrice =
      recipes.length > 0
        ? recipes.reduce((sum, recipe) => sum + recipe.sellingPrice, 0) /
          recipes.length
        : 0;

    const priceComparison = avgPrice - competitorPrice;
    const percentageDiff =
      competitorPrice > 0 ? (priceComparison / competitorPrice) * 100 : 0;

    let recommendation = "";
    let strategy = "";

    if (percentageDiff > 20) {
      recommendation =
        "Your prices are significantly higher. Consider value justification or price adjustment.";
      strategy = "premium";
    } else if (percentageDiff > 5) {
      recommendation =
        "Your prices are moderately higher. Emphasize quality and service.";
      strategy = "premium";
    } else if (percentageDiff < -20) {
      recommendation =
        "Your prices are much lower. There may be room for price increases.";
      strategy = "value";
    } else if (percentageDiff < -5) {
      recommendation =
        "Your prices are competitive. Good positioning for market penetration.";
      strategy = "competitive";
    } else {
      recommendation = "Your prices are well-aligned with competitors.";
      strategy = "aligned";
    }

    container.innerHTML = `
            <div class="competitive-card">
                <h6>Price Comparison</h6>
                <p>Your Avg: ₱${avgPrice.toFixed(
                  2
                )} vs Competitor: ₱${competitorPrice.toFixed(2)}</p>
                <p>Difference: ${
                  percentageDiff > 0 ? "+" : ""
                }${percentageDiff.toFixed(1)}%</p>
            </div>
            <div class="alert alert-info">
                <strong>Recommendation:</strong><br>
                ${recommendation}
            </div>
            <div class="mt-3">
                <h6>Market Positioning Strategy:</h6>
                <div class="position-${
                  strategy === "premium"
                    ? "premium"
                    : strategy === "value"
                    ? "budget"
                    : "mid"
                }">
                    ${
                      strategy.charAt(0).toUpperCase() + strategy.slice(1)
                    } Positioning
                </div>
            </div>
        `;
  }

  loadCostOptimization() {
    const container = document.getElementById("optimizationSuggestions");
    const recipes = Object.values(this.recipes);

    const suggestions = [
      {
        title: "Bulk Purchasing",
        description: "Negotiate better rates for high-volume ingredients",
        savings: "10-15%",
        difficulty: "Easy",
      },
      {
        title: "Seasonal Sourcing",
        description: "Adjust menu based on seasonal ingredient availability",
        savings: "8-12%",
        difficulty: "Medium",
      },
      {
        title: "Portion Control",
        description: "Standardize portions to reduce waste and control costs",
        savings: "5-8%",
        difficulty: "Easy",
      },
      {
        title: "Supplier Diversification",
        description: "Find alternative suppliers for key ingredients",
        savings: "3-7%",
        difficulty: "Medium",
      },
      {
        title: "Ingredient Substitution",
        description:
          "Replace expensive ingredients with cost-effective alternatives",
        savings: "15-25%",
        difficulty: "Hard",
      },
    ];

    container.innerHTML = suggestions
      .map(
        suggestion => `
            <div class="optimization-card">
                <h6>${suggestion.title}</h6>
                <p class="mb-2">${suggestion.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="savings">Save ${suggestion.savings}</span>
                    <span class="badge bg-light text-dark">${suggestion.difficulty}</span>
                </div>
            </div>
        `
      )
      .join("");
  }

  populatePricingSimulator() {
    const select = document.getElementById("simulatorRecipe");
    const recipes = Object.values(this.recipes);

    select.innerHTML = '<option value="">Choose recipe...</option>';
    recipes.forEach(recipe => {
      const option = document.createElement("option");
      option.value = recipe.name;
      option.textContent = recipe.name;
      select.appendChild(option);
    });
  }

  updatePricingSimulator() {
    const recipeName = document.getElementById("simulatorRecipe").value;
    const targetMargin = parseFloat(
      document.getElementById("targetMargin").value
    );

    if (!recipeName) {
      document.getElementById("recommendedPrice").textContent = "₱0.00";
      document.getElementById("marketPositioning").innerHTML =
        '<p class="text-muted">Select a recipe</p>';
      return;
    }

    const recipe = this.recipes[recipeName];
    if (!recipe) return;

    const costPerServing = parseFloat(recipe.totalCost) / recipe.servings;
    const recommendedPrice = costPerServing / (1 - targetMargin / 100);

    document.getElementById(
      "recommendedPrice"
    ).textContent = `₱${recommendedPrice.toFixed(2)}`;

    // Market positioning based on price
    let positioning = "";
    if (recommendedPrice < 100) {
      positioning = '<div class="position-budget">Budget Market</div>';
    } else if (recommendedPrice < 300) {
      positioning = '<div class="position-mid">Mid-Range Market</div>';
    } else if (recommendedPrice < 500) {
      positioning = '<div class="position-premium">Premium Market</div>';
    } else {
      positioning = '<div class="position-luxury">Luxury Market</div>';
    }

    document.getElementById("marketPositioning").innerHTML = positioning;
  }

  calculateForecasts() {
    const dailySales = parseInt(
      document.getElementById("dailySales").value || 50
    );
    const seasonalFactor = parseFloat(
      document.getElementById("seasonalFactor").value || 1
    );
    const recipes = Object.values(this.recipes);

    const avgPrice =
      recipes.length > 0
        ? recipes.reduce((sum, recipe) => sum + recipe.sellingPrice, 0) /
          recipes.length
        : 150; // Default average price

    const adjustedDailySales = dailySales * seasonalFactor;
    const dailyRevenue = adjustedDailySales * avgPrice;
    const weeklyRevenue = dailyRevenue * 7;
    const monthlyRevenue = dailyRevenue * 30;
    const annualRevenue = dailyRevenue * 365;

    document.getElementById(
      "dailyRevenue"
    ).textContent = `₱${dailyRevenue.toLocaleString()}`;
    document.getElementById(
      "weeklyRevenue"
    ).textContent = `₱${weeklyRevenue.toLocaleString()}`;
    document.getElementById(
      "monthlyRevenue"
    ).textContent = `₱${monthlyRevenue.toLocaleString()}`;
    document.getElementById(
      "annualRevenue"
    ).textContent = `₱${annualRevenue.toLocaleString()}`;
  }

  generateSmartAlerts() {
    const container = document.getElementById("smartAlerts");
    const alerts = [
      {
        type: "success",
        title: "Profit Goal Achieved",
        message: "Your average profit margin is above the 40% target.",
        icon: "fas fa-check-circle",
      },
      {
        type: "warning",
        title: "Ingredient Price Alert",
        message:
          "Chicken prices increased by 8% this week. Consider menu adjustments.",
        icon: "fas fa-exclamation-triangle",
      },
      {
        type: "info",
        title: "Seasonal Opportunity",
        message:
          "Summer ingredients are becoming more affordable. Update seasonal menu.",
        icon: "fas fa-info-circle",
      },
      {
        type: "danger",
        title: "Low Margin Recipe",
        message:
          "3 recipes have profit margins below 20%. Review pricing immediately.",
        icon: "fas fa-times-circle",
      },
    ];

    container.innerHTML = alerts
      .map(
        alert => `
            <div class="alert-smart alert-${alert.type}">
                <div class="d-flex align-items-center">
                    <i class="${alert.icon} me-2"></i>
                    <div>
                        <strong>${alert.title}</strong><br>
                        <small>${alert.message}</small>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Action handlers
  implementRecommendation(title) {
    alert(
      `Implementing: ${title}\n\nThis would open a detailed action plan in a real application.`
    );
  }

  fixRecipe(recipeName) {
    if (confirm(`Open recipe "${recipeName}" for optimization?`)) {
      // In a real app, this would navigate to the recipe editor
      window.location.href = `index.html?recipe=${encodeURIComponent(
        recipeName
      )}`;
    }
  }

  updateChartTimeRange() {
    const selectedRange = document.querySelector(
      'input[name="timeRange"]:checked'
    ).id;
    // In a real application, this would update the chart data based on the selected time range
    console.log("Updating chart for time range:", selectedRange);
  }
}

// Global functions for buttons
function generateReport() {
  alert(
    "Generating comprehensive business report...\n\nThis would create a detailed PDF report with all analytics and recommendations."
  );
}

function exportDashboard() {
  const data = {
    timestamp: new Date().toISOString(),
    recipes: JSON.parse(localStorage.getItem("foodCostingRecipes") || "{}"),
    analytics: {
      // Add analytics data here
    },
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `dashboard_export_${
    new Date().toISOString().split("T")[0]
  }.json`;
  link.click();
}

function shareInsights() {
  if (navigator.share) {
    navigator.share({
      title: "Food Costing Insights",
      text: "Check out my restaurant profitability insights!",
      url: window.location.href,
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    const text = "Food Costing Dashboard Insights - " + window.location.href;
    navigator.clipboard.writeText(text).then(() => {
      alert("Dashboard link copied to clipboard!");
    });
  }
}

function calculateForecasts() {
  if (window.dashboard) {
    window.dashboard.calculateForecasts();
  }
}

// Initialize dashboard when page loads
window.addEventListener("load", () => {
  // Prevent multiple instances with stronger guards
  if (window.dashboard || window.dashboardInstance) {
    return;
  }

  // Only initialize if we're on the dashboard page and elements exist
  const categoryChart = document.getElementById("categoryChart");
  const profitChart = document.getElementById("profitabilityChart");

  if (categoryChart && profitChart) {
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      if (!window.dashboard && !window.dashboardInstance) {
        window.dashboard = new DashboardAnalytics();
      }
    }, 250);
  }
});
