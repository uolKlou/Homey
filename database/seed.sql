-- Starting data for Homey: 2 test accounts, 12 shops, 24 dishes.
-- Both test accounts use the password Test1234 (stored hashed, never in plain text).

INSERT INTO sellers (seller_id, name, category, city, photo_url) VALUES
  (1, 'Sugar & Saffron', 'Sweets', 'Riyadh', 'img/sellers/1.jpg'),
  (2, 'The Warm Plate', 'Dinner', 'Riyadh', 'img/sellers/2.jpg'),
  (3, 'Morning Basket', 'Breakfast', 'Riyadh', 'img/sellers/3.jpg'),
  (4, 'Blue Coast Kitchen', 'Sea food', 'Jeddah', 'img/sellers/4.jpg'),
  (5, 'Honey Date House', 'Sweets', 'Jeddah', 'img/sellers/5.jpg'),
  (6, 'Rice & Spice Kitchen', 'Dinner', 'Riyadh', 'img/sellers/6.jpg'),
  (7, 'Sunrise Pantry', 'Breakfast', 'Medinah', 'img/sellers/7.jpg'),
  (8, 'Desert Rose Kitchen', 'Dinner', 'Medinah', 'img/sellers/8.jpg'),
  (9, 'The Sweet Corner', 'Sweets', 'Riyadh', 'img/sellers/9.jpg'),
  (10, 'Green Basket', 'Vegetables', 'Jeddah', 'img/sellers/10.jpg'),
  (11, 'Olive & Thyme', 'Vegetables', 'Medinah', 'img/sellers/11.jpg'),
  (12, 'Tamees & Tea', 'Breakfast', 'Riyadh', 'img/sellers/12.jpg');

INSERT INTO users (user_id, name, email, password_hash, user_role, seller_id) VALUES
  (1, 'Sara', 'sara@example.com', 'scrypt$202ae731d012dcc9add566225b253902$caa9f0cd2777777d12033e17eddaf93ebc2a35820de7b96e3cad7dfd923e07fb5c3defed5db1e6dc2db136f44e8bcfcbd62cb56b1659a3be6fb09fe688cad03c', 'customer', NULL),
  (2, 'Sugar & Saffron', 'chef@example.com', 'scrypt$49e89474d3b017c56a7d9fa619c669e9$592cb7e4f276b56b95246bfde3197771005e1e9546d1853eea4fd83dacae71bf7c3d8ae9d82b9a588b77209d5597832c87170780b1c27cbd56e7b08fdfae59bb', 'seller', 1);

INSERT INTO listings (listing_id, seller_id, name, price, description, photo_url, city) VALUES
  (1, 1, 'Date maamoul (12 pieces)', 45, 'Soft semolina cookies filled with dates.', NULL, 'Riyadh'),
  (2, 1, 'Luqaimat box', 30, 'Crispy dumplings with date syrup.', NULL, 'Riyadh'),
  (3, 2, 'Chicken kabsa', 55, 'Spiced rice with chicken, serves two.', NULL, 'Riyadh'),
  (4, 2, 'Lamb mandi', 85, 'Slow-cooked lamb over smoky rice.', NULL, 'Riyadh'),
  (5, 3, 'Foul with fresh bread', 18, 'Fava beans with olive oil and lemon.', NULL, 'Riyadh'),
  (6, 3, 'Shakshuka pan', 25, 'Eggs in spiced tomato sauce.', NULL, 'Riyadh'),
  (7, 4, 'Grilled hammour', 70, 'Fresh fish with lemon and herbs.', NULL, 'Jeddah'),
  (8, 4, 'Shrimp rice', 60, 'Rice cooked with shrimp and tomato.', NULL, 'Jeddah'),
  (9, 5, 'Basbousa tray', 40, 'Semolina cake soaked in syrup.', NULL, 'Jeddah'),
  (10, 5, 'Qatayef (10 pieces)', 35, 'Stuffed pancakes with cream or nuts.', NULL, 'Jeddah'),
  (11, 6, 'Margoog stew', 50, 'Vegetable and lamb stew with thin dough.', NULL, 'Riyadh'),
  (12, 6, 'Saleeg', 48, 'Creamy rice cooked in broth with chicken.', NULL, 'Riyadh'),
  (13, 7, 'Balaleet', 22, 'Sweet vermicelli topped with an omelette.', NULL, 'Medinah'),
  (14, 7, 'Mutabbaq (4 pieces)', 28, 'Pan-fried stuffed pastry.', NULL, 'Medinah'),
  (15, 8, 'Jareesh', 42, 'Crushed wheat cooked with yogurt and ghee.', NULL, 'Medinah'),
  (16, 8, 'Harees', 45, 'Slow-cooked wheat and chicken porridge.', NULL, 'Medinah'),
  (17, 9, 'Kunafa tray', 65, 'Warm cheese pastry with syrup.', NULL, 'Riyadh'),
  (18, 9, 'Date and coffee cake', 38, 'Moist cake with Arabic coffee flavour.', NULL, 'Riyadh'),
  (19, 10, 'Stuffed grape leaves', 32, 'Rice and herb rolls, about 20 pieces.', NULL, 'Jeddah'),
  (20, 10, 'Fattoush bowl', 20, 'Fresh salad with crispy bread.', NULL, 'Jeddah'),
  (21, 11, 'Hummus and mutabal set', 24, 'Two dips with warm bread.', NULL, 'Medinah'),
  (22, 11, 'Stuffed zucchini', 36, 'Zucchini filled with spiced rice.', NULL, 'Medinah'),
  (23, 12, 'Tamees bread with eggs', 20, 'Fresh tamees bread with cheese and eggs.', NULL, 'Riyadh'),
  (24, 12, 'Cheese sambousek (12)', 30, 'Crispy cheese pastries, ready to fry.', NULL, 'Riyadh');
