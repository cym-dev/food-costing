# Food Costing Calculator

A comprehensive web-based food costing calculator built with Bootstrap and JavaScript that helps restaurants, caterers, and food businesses calculate ingredient costs, recipe profitability, and manage recipes with local storage persistence.

## Features

### 🧮 Cost Calculations

- **Dynamic Ingredient Management**: Add/remove ingredients with real-time cost calculations
- **Cost Per Serving**: Automatically calculates cost per serving based on total servings
- **Labor Cost Integration**: Include labor costs in total recipe cost
- **Profit Margin Analysis**: Calculate profit margins and food cost percentages
- **Real-time Updates**: All calculations update instantly as you modify ingredients

### 💾 Data Persistence

- **Local Storage**: All recipes saved in browser's local storage
- **Auto-save**: Current recipe state automatically saved as you type
- **Recipe Management**: Save, load, and delete multiple recipes
- **Data Export**: Export all recipes as JSON file
- **Import Functionality**: Import previously exported recipe data

### 🎨 User Interface

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Bootstrap 5**: Modern, clean interface with smooth animations
- **Dark Sidebar**: Professional sidebar with recipe management
- **Color-coded Metrics**: Visual indicators for profitability (green/yellow/red)
- **Print Support**: Print-friendly recipe layouts

### ⚡ Advanced Features

- **Ingredient Suggestions**: Autocomplete with common ingredients
- **Multiple Units**: Support for various measurement units (kg, g, lb, oz, cups, tbsp, etc.)
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+N for new recipe
- **Cost Summary Cards**: Visual display of key metrics
- **Animation Effects**: Smooth transitions and hover effects

## How to Use

### Getting Started

1. Open `index.html` in your web browser
2. Enter a recipe name in the "Recipe Information" section
3. Set the number of servings and any labor costs
4. Add ingredients using the "Add Ingredient" button

### Adding Ingredients

1. Click "Add Ingredient" to create a new row
2. Enter ingredient name (autocomplete suggestions available)
3. Input quantity and select appropriate unit
4. Enter unit cost (cost per unit of measurement)
5. Total cost for that ingredient will be calculated automatically

### Recipe Management

- **Save Recipe**: Click "Save Recipe" to store in local storage
- **Load Recipe**: Click "Load Recipe" to open saved recipes
- **New Recipe**: Start fresh with "New Recipe" button
- **Auto-save**: Changes are automatically saved as you work

### Cost Analysis

The calculator provides several key metrics:

- **Total Cost**: Sum of all ingredient and labor costs
- **Cost Per Serving**: Total cost divided by number of servings
- **Profit Margin**: Percentage profit if selling price is entered
- **Food Cost %**: Percentage of selling price that goes to food costs

### Profitability Guidelines

- **Good Profit Margin**: 60%+ (Green)
- **Acceptable Margin**: 30-60% (Yellow)
- **Low Margin**: <30% (Red)

- **Good Food Cost**: <30% (Green)
- **Acceptable Food Cost**: 30-40% (Yellow)
- **High Food Cost**: >40% (Red)

## Technical Details

### Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with animations and responsive design
- **Bootstrap 5**: UI framework for responsive components
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **Font Awesome**: Icons for enhanced UI
- **Local Storage API**: Browser-based data persistence

### File Structure

```
calculator/
├── index.html          # Main application file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

### Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Data Storage

All data is stored locally in your browser using the Local Storage API:

- **Key**: `foodCostingRecipes` - Stores all saved recipes
- **Key**: `foodCostingCurrentState` - Stores current working recipe for auto-recovery

## Customization

### Adding New Ingredient Suggestions

Edit the `<datalist>` in `index.html` to add more ingredient suggestions:

```html
<datalist id="ingredientsList">
  <option value="Your Ingredient">
    <!-- Add more options here -->
  </option>
</datalist>
```

### Modifying Units

Edit the unit dropdown in the `addIngredient()` function in `script.js`:

```javascript
<option value="your-unit">your-unit</option>
```

### Styling Changes

Modify `styles.css` to change colors, fonts, or layout:

```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

## Keyboard Shortcuts

- **Ctrl + S**: Save current recipe
- **Ctrl + N**: Start new recipe
- **Enter**: Move to next input field
- **Tab**: Navigate between form fields

## Tips for Best Results

1. **Accurate Measurements**: Use consistent units for better calculations
2. **Include All Costs**: Don't forget labor, utilities, and overhead costs
3. **Regular Updates**: Update ingredient costs regularly for accuracy
4. **Test Portions**: Verify serving sizes match your actual portions
5. **Backup Data**: Export your recipes regularly as backup

## Troubleshooting

### Data Not Saving

- Ensure JavaScript is enabled in your browser
- Check if browser supports Local Storage
- Try clearing browser cache and refreshing

### Calculations Not Updating

- Verify all numeric fields have valid numbers
- Check for JavaScript console errors
- Ensure all required fields are filled

### Mobile Display Issues

- App is responsive but works best on tablets and desktops
- Portrait mode recommended for mobile devices
- Zoom out if table appears cramped

## Future Enhancements

- PDF export functionality
- Ingredient database with average costs
- Recipe scaling (multiply/divide servings)
- Cost history tracking
- Multi-currency support
- Cloud storage integration
- Recipe sharing features
- Nutritional information
- Photo attachments for recipes

## License

This project is open source and available under the MIT License.

## Support

For questions or support, please refer to the documentation or create an issue in the project repository.
