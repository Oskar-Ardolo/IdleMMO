drop table if exists ingredients;
CREATE TABLE `ingredients` (`RecipeId` VARCHAR(100) NOT NULL , `ItemId` VARCHAR(100) NOT NULL , `Count` INT NOT NULL , PRIMARY KEY (`RecipeId`, `ItemId`)) ENGINE = InnoDB;
truncate table ingredients;
LOAD DATA INFILE '/var/lib/mysql-files/ingredients.csv'
INTO TABLE ingredients
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@id, ItemId, Count, RecipeId);



drop table if exists items_data;
CREATE TABLE `items_data` (`Name` VARCHAR(255) NULL , `Type` VARCHAR(255) NULL , `VendorValue` VARCHAR(255) NULL , `id` VARCHAR(255) NOT NULL , `Quality` VARCHAR(255) NULL , `Rarity` VARCHAR(255) NULL , `MaximumUses` VARCHAR(255) NULL , `ForgeLevelRequired` VARCHAR(255) NULL , `RecipeResult` VARCHAR(255) NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
truncate table items_data;
LOAD DATA INFILE '/var/lib/mysql-files/items.csv'
INTO TABLE items_data
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;