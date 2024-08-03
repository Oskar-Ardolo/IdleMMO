drop view if exists Recipes;
CREATE VIEW Recipes AS
SELECT 
id, Name, Quality, Rarity, RecipeResult, VendorValue
FROM items_data
WHERE Type = 'Recipe';
