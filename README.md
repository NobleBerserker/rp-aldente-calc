# Al Dente — GTA RP Restaurant Calculator

A standalone React + Vite app. Enter desired production quantities and selling prices to calculate crafting batches, ingredient shopping requirements, costs, revenue, and gross profit.

## Run locally

1. Install Node.js 20+.
2. Open a terminal inside this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the address displayed by Vite (typically http://localhost:5173).

To create a static website: `npm run build`. Host the contents of `dist/` on any static website host.

## Important details

- **Finished items** mode: input is the quantity you want to sell. The app rounds the crafting batches up, displaying the extra items. For example, requesting 40 Cokes produces 42, because each craft produces 7.
- **Crafts** mode: input is the number of crafting actions, not finished items.
- Product prices are editable independently; the starting value is $100 per item, **a placeholder, not an actual known menu price**.
- Ingredient purchase prices start at $5 per unit but can be edited.
- Gross profit is expected revenue minus ingredient purchases only, assuming every finished item sells.
- Quantities, prices and budget are automatically saved in your browser's local storage.
- Ingredient names used: Cheese, Tomato, Dough, Meat, Beef, Bean, Cup, Milk, Sugar and Orange.
