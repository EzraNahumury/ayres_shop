USE `ayres_shop`;

-- Product images (using Unsplash for placeholder)
INSERT INTO `product_images` (`product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`) VALUES
(1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', 'Essential Cotton Tee - Front', 0, 1),
(1, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop', 'Essential Cotton Tee - Back', 1, 0),
(2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop', 'Oversized Linen Shirt - Front', 0, 1),
(2, 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&h=800&fit=crop', 'Oversized Linen Shirt - Detail', 1, 0),
(3, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop', 'Tailored Wide Leg Trousers - Front', 0, 1),
(3, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop', 'Tailored Wide Leg Trousers - Side', 1, 0),
(4, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop', 'Relaxed Chino Pants - Front', 0, 1),
(4, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop', 'Relaxed Chino Pants - Detail', 1, 0),
(5, 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600&h=800&fit=crop', 'Wool Blend Overcoat - Front', 0, 1),
(5, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop', 'Wool Blend Overcoat - Side', 1, 0),
(6, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop', 'Midi Wrap Dress - Front', 0, 1),
(6, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop', 'Midi Wrap Dress - Detail', 1, 0),
(7, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 'Leather Minimal Belt - Front', 0, 1),
(8, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop', 'Canvas Tote Bag - Front', 0, 1),
(8, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop', 'Canvas Tote Bag - Detail', 1, 0);
