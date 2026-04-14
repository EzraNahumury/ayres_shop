-- Seed default couriers for ayres_shop
-- Run once after import ayres_shop.sql
USE `ayres_shop`;

INSERT IGNORE INTO `couriers` (`name`, `code`, `is_active`) VALUES
  ('JNE',          'jne',     1),
  ('J&T Express',  'jnt',     1),
  ('SiCepat',      'sicepat', 1),
  ('Anteraja',     'anteraja',1),
  ('Pos Indonesia','pos',     1),
  ('GoSend',       'gosend',  1),
  ('GrabExpress',  'grab',    1);
