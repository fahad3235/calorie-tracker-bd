(function (global) {
  'use strict';
  // Bangladeshi food database \u2014 APPROXIMATE values per serving, for personal
  // tracking only. Values are typical cookbook averages, not lab measurements.
  // Users can add custom foods with their own numbers.
  // Fields: id, en, bn, serving, kcal, protein, carbs, fat (per serving).
  var FOODS = [
    { id: 'rice', en: 'Plain Rice', bn: '\u09ad\u09be\u09a4', serving: '1 cup cooked', kcal: 200, protein: 4, carbs: 44, fat: 0.5 },
    { id: 'roti', en: 'Roti', bn: '\u09b0\u09c1\u099f\u09bf', serving: '1 piece', kcal: 120, protein: 3, carbs: 22, fat: 2 },
    { id: 'paratha', en: 'Paratha', bn: '\u09aa\u09b0\u09cb\u099f\u09be', serving: '1 piece', kcal: 220, protein: 4, carbs: 26, fat: 11 },
    { id: 'dal', en: 'Dal (Lentil Soup)', bn: '\u09a1\u09be\u09b2', serving: '1 bowl', kcal: 150, protein: 8, carbs: 22, fat: 3 },
    { id: 'chicken-curry', en: 'Chicken Curry', bn: '\u09ae\u09c1\u09b0\u0997\u09bf\u09b0 \u09a4\u09b0\u0995\u09be\u09b0\u09bf', serving: '1 serving', kcal: 280, protein: 25, carbs: 6, fat: 17 },
    { id: 'beef-curry', en: 'Beef Curry', bn: '\u0997\u09b0\u09c1\u09b0 \u09a4\u09b0\u0995\u09be\u09b0\u09bf', serving: '1 serving', kcal: 350, protein: 26, carbs: 4, fat: 25 },
    { id: 'fish-curry', en: 'Fish Curry (Rui)', bn: '\u09ae\u09be\u099b\u09c7\u09b0 \u09a4\u09b0\u0995\u09be\u09b0\u09bf (\u09b0\u09c1\u0987)', serving: '1 serving', kcal: 220, protein: 20, carbs: 4, fat: 13 },
    { id: 'fried-fish', en: 'Fried Fish', bn: '\u09ad\u09be\u099c\u09be \u09ae\u09be\u099b', serving: '1 piece', kcal: 280, protein: 22, carbs: 6, fat: 18 },
    { id: 'egg-boiled', en: 'Boiled Egg', bn: '\u09b8\u09bf\u09a6\u09cd\u09a7 \u09a1\u09bf\u09ae', serving: '1 egg', kcal: 70, protein: 6, carbs: 0.5, fat: 5 },
    { id: 'egg-omelette', en: 'Egg Omelette', bn: '\u09a1\u09bf\u09ae \u09ad\u09be\u099c\u09bf', serving: '1 egg', kcal: 140, protein: 6, carbs: 1, fat: 12 },
    { id: 'veg-mix', en: 'Mixed Vegetables', bn: '\u09ae\u09bf\u0995\u09cd\u09b8\u09a1 \u09b8\u09ac\u099c\u09bf', serving: '1 bowl', kcal: 120, protein: 3, carbs: 15, fat: 5 },
    { id: 'alu-bhorta', en: 'Alu Bhorta', bn: '\u0986\u09b2\u09c1 \u09ad\u09b0\u09cd\u09a4\u09be', serving: '1 serving', kcal: 150, protein: 2, carbs: 20, fat: 7 },
    { id: 'biryani', en: 'Chicken Biryani', bn: '\u099a\u09bf\u0995\u09c7\u09a8 \u09ac\u09bf\u09b0\u09bf\u09af\u09bc\u09be\u09a8\u09bf', serving: '1 plate', kcal: 550, protein: 22, carbs: 65, fat: 22 },
    { id: 'khichuri', en: 'Khichuri', bn: '\u0996\u09bf\u099a\u09c1\u09a1\u09bc\u09bf', serving: '1 plate', kcal: 400, protein: 10, carbs: 55, fat: 17 },
    { id: 'noodles', en: 'Noodles', bn: '\u09a8\u09c1\u09a1\u09b2\u09b8', serving: '1 bowl', kcal: 320, protein: 7, carbs: 45, fat: 13 },
    { id: 'singara', en: 'Singara', bn: '\u09b8\u09bf\u0999\u09cd\u0997\u09be\u09b0\u09be', serving: '1 piece', kcal: 150, protein: 3, carbs: 16, fat: 8 },
    { id: 'samosa', en: 'Samosa', bn: '\u09b8\u09ae\u09c1\u099a\u09be', serving: '1 piece', kcal: 180, protein: 3, carbs: 18, fat: 10 },
    { id: 'bhapa-pitha', en: 'Bhapa Pitha', bn: '\u09ad\u09be\u09aa\u09be \u09aa\u09bf\u09a0\u09be', serving: '1 piece', kcal: 180, protein: 3, carbs: 30, fat: 5 },
    { id: 'jilapi', en: 'Jilapi', bn: '\u099c\u09bf\u09b2\u09be\u09aa\u09bf', serving: '1 piece', kcal: 150, protein: 1, carbs: 22, fat: 6 },
    { id: 'mishti', en: 'Mishti (Roshogolla)', bn: '\u09ae\u09bf\u09b7\u09cd\u099f\u09bf (\u09b0\u09b8\u0997\u09cb\u09b2\u09cd\u09b2\u09be)', serving: '1 piece', kcal: 120, protein: 2, carbs: 26, fat: 2 },
    { id: 'banana', en: 'Banana', bn: '\u0995\u09b2\u09be', serving: '1 medium', kcal: 105, protein: 1, carbs: 27, fat: 0.5 },
    { id: 'mango', en: 'Mango', bn: '\u0986\u09ae', serving: '1 cup', kcal: 100, protein: 1, carbs: 25, fat: 0.5 },
    { id: 'milk', en: 'Milk', bn: '\u09a6\u09c1\u09a7', serving: '1 glass (250 ml)', kcal: 150, protein: 8, carbs: 12, fat: 8 },
    { id: 'tea-milk', en: 'Tea with Milk & Sugar', bn: '\u099a\u09be (\u09a6\u09c1\u09a7+\u099a\u09bf\u09a8\u09bf)', serving: '1 cup', kcal: 80, protein: 1, carbs: 10, fat: 4 },
    { id: 'tea-plain', en: 'Tea without Sugar', bn: '\u099a\u09be (\u099a\u09bf\u09a8\u09bf \u099b\u09be\u09a1\u09bc\u09be)', serving: '1 cup', kcal: 5, protein: 0, carbs: 1, fat: 0 },
    { id: 'coffee-milk', en: 'Coffee with Milk & Sugar', bn: '\u0995\u09ab\u09bf (\u09a6\u09c1\u09a7+\u099a\u09bf\u09a8\u09bf)', serving: '1 cup', kcal: 90, protein: 1, carbs: 12, fat: 4 },
    { id: 'soft-drink', en: 'Soft Drink', bn: '\u0995\u09cb\u09ae\u09b2 \u09aa\u09be\u09a8\u09c0\u09af\u09bc', serving: '250 ml', kcal: 105, protein: 0, carbs: 27, fat: 0 },
    { id: 'orange-juice', en: 'Orange Juice', bn: '\u0995\u09ae\u09b2\u09be\u09b0 \u09b0\u09b8', serving: '1 glass', kcal: 110, protein: 1, carbs: 26, fat: 0.5 },
    { id: 'bread', en: 'Bread', bn: '\u09aa\u09be\u0989\u09b0\u09c1\u099f\u09bf', serving: '2 slices', kcal: 160, protein: 5, carbs: 28, fat: 2 },
    { id: 'butter', en: 'Butter', bn: '\u09ae\u09be\u0996\u09a8', serving: '1 tbsp', kcal: 100, protein: 0, carbs: 0, fat: 12 },
    { id: 'doi', en: 'Yogurt (Doi)', bn: '\u09a6\u0987', serving: '1 cup', kcal: 150, protein: 6, carbs: 14, fat: 7 },
    { id: 'salad', en: 'Salad', bn: '\u09b8\u09be\u09b2\u09be\u09a6', serving: '1 bowl', kcal: 50, protein: 1, carbs: 8, fat: 2 },
    { id: 'chotpoti', en: 'Chotpoti', bn: '\u099a\u099f\u09aa\u099f\u09bf', serving: '1 bowl', kcal: 300, protein: 10, carbs: 45, fat: 10 },
    { id: 'fuchka', en: 'Fuchka', bn: '\u09ab\u09c1\u099a\u0995\u09be', serving: '6 pieces', kcal: 300, protein: 5, carbs: 40, fat: 14 },
    { id: 'haleem', en: 'Haleem', bn: '\u09b9\u09be\u09b2\u09bf\u09ae', serving: '1 bowl', kcal: 350, protein: 18, carbs: 30, fat: 15 },
    { id: 'tehari', en: 'Tehari', bn: '\u09a4\u09c7\u09b9\u09be\u09b0\u09bf', serving: '1 plate', kcal: 500, protein: 18, carbs: 60, fat: 20 },
    { id: 'fried-chicken', en: 'Fried Chicken', bn: '\u09ab\u09cd\u09b0\u09be\u0987\u09a1 \u099a\u09bf\u0995\u09c7\u09a8', serving: '1 piece', kcal: 320, protein: 20, carbs: 12, fat: 21 },
    { id: 'fries', en: 'French Fries', bn: '\u09ab\u09cd\u09b0\u09c7\u099e\u09cd\u099a \u09ab\u09cd\u09b0\u09be\u0987', serving: 'medium', kcal: 350, protein: 4, carbs: 45, fat: 17 },
    { id: 'ice-cream', en: 'Ice Cream', bn: '\u0986\u0987\u09b8\u0995\u09cd\u09b0\u09bf\u09ae', serving: '1 scoop', kcal: 150, protein: 2, carbs: 18, fat: 8 },
    { id: 'cake', en: 'Cake', bn: '\u0995\u09c7\u0995', serving: '1 slice', kcal: 280, protein: 3, carbs: 38, fat: 13 },
    { id: 'biscuits', en: 'Biscuits', bn: '\u09ac\u09bf\u09b8\u09cd\u0995\u09c1\u099f', serving: '2 pieces', kcal: 110, protein: 1, carbs: 15, fat: 4 },
    { id: 'peanuts', en: 'Peanuts', bn: '\u09ac\u09be\u09a6\u09be\u09ae', serving: '1 handful', kcal: 160, protein: 7, carbs: 5, fat: 14 },
    { id: 'coconut-water', en: 'Coconut Water', bn: '\u09a1\u09be\u09ac\u09c7\u09b0 \u09aa\u09be\u09a8\u09bf', serving: '1 glass', kcal: 45, protein: 0, carbs: 11, fat: 0 }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = FOODS;
  else global.FOODS = FOODS;
})(typeof window !== 'undefined' ? window : globalThis);
