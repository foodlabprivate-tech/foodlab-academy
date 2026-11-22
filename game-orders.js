// Игра «Собери заказ»: полка ингредиентов и 10 заказов.
// Состав блюд взят из тех.карт Академии. Зоны: main — в блюдо/бокс, side — отдельно (соусник, контейнер),
// drink — напитки и добавки к заказу.
window.FL_GAME_SHELF = [
  { tab: 'Яйца и завтрак', items: [
    ['fried-egg', '🍳', 'Яичница (1 яйцо)'], ['poached-egg', '🥚', 'Яйцо пашот'], ['yolk', '🟡', 'Яичный желток'],
    ['bacon', '🥓', 'Бекон (ломтик)'], ['hashbrown', '🥔', 'Хашбраун'], ['pancake', '🥞', 'Панкейк'],
    ['toast', '🍞', 'Тост'], ['sourdough', '🥖', 'Хлеб на закваске'], ['cream-cheese', '🧈', 'Сливочный сыр'],
    ['avocado-mash', '🥑', 'Пюре из авокадо'], ['parsley', '🌿', 'Петрушка']
  ]},
  { tab: 'Мясо и рыба', items: [
    ['chicken-thigh', '🍗', 'Куриные бёдра гриль'], ['chicken-breast', '🍗', 'Куриная грудка'], ['chicken-boiled', '🍖', 'Курица отварная'],
    ['strips', '🍤', 'Стрипсы (8 шт)'], ['salmon-steamed', '🐟', 'Лосось на пару'], ['salmon-smoked', '🍣', 'Копчёный лосось']
  ]},
  { tab: 'Овощи и гарнир', items: [
    ['shawarma-salad', '🥬', 'Салат для шаурмы'], ['cucumber', '🥒', 'Огурец'], ['baby-cucumber', '🥒', 'Мини-огурцы'],
    ['tomato', '🍅', 'Помидор'], ['cherry', '🍒', 'Помидоры черри'], ['lettuce', '🥬', 'Листовой салат'],
    ['iceberg', '🥗', 'Салат айсберг'], ['romano', '🥗', 'Салат романо'], ['rucola', '🌱', 'Руккола'],
    ['avocado', '🥑', 'Авокадо'], ['edamame', '🫛', 'Эдамаме'], ['corn', '🌽', 'Сладкая кукуруза'],
    ['broccoli', '🥦', 'Брокколи'], ['mushroom', '🍄', 'Жареные грибы'], ['baby-potato', '🥔', 'Молодой картофель'],
    ['onion', '🧅', 'Лук'], ['fried-onion', '🧅', 'Жареный лук'], ['rice', '🍚', 'Отварной рис']
  ]},
  { tab: 'Тесто, паста, сыр', items: [
    ['lavash', '🫓', 'Лаваш'], ['dough', '⚪', 'Тесто для пиццы'], ['spaghetti', '🍝', 'Спагетти'],
    ['mozzarella', '🧀', 'Моцарелла (порция)'], ['parmesan', '🧀', 'Пармезан'], ['cream', '🥛', 'Сливки'],
    ['croutons', '🍞', 'Сухари'], ['oregano', '🌿', 'Орегано'], ['basil', '🌱', 'Базилик']
  ]},
  { tab: 'Соусы', items: [
    ['white-sauce', '🥣', 'Белый соус (шаурма)'], ['pizza-sauce', '🥫', 'Томатный соус для пиццы'], ['caesar', '🥣', 'Заправка «Цезарь»'],
    ['teriyaki', '🍯', 'Соус терияки'], ['honey-mustard', '🍯', 'Медово-горчичный соус'], ['soy', '🫙', 'Соевый соус'],
    ['olive-oil', '🫒', 'Оливковое масло'], ['sesame', '⚫', 'Кунжут'], ['chili', '🌶️', 'Острый соус']
  ]},
  { tab: 'Напитки', items: [
    ['cappuccino', '☕', 'Капучино'], ['latte', '☕', 'Латте'], ['americano', '☕', 'Американо'],
    ['orange-juice', '🧃', 'Апельсиновый сок'], ['cola', '🥤', 'Coca-Cola'], ['sprite', '🥤', 'Sprite'],
    ['sugar', '🍬', 'Сахар (пакетик)']
  ]}
];

// need: { зона: { id: количество } }; no: что нельзя класть; tip: разбор после проверки
window.FL_GAME_ORDERS = [
  { brand: 'only-eggs', brandName: 'Only Eggs', app: 'GrabFood', id: 'GF-1042',
    lines: ['1× American Breakfast', '1× Cappuccino'], note: 'Cappuccino tanpa gula ya kak 🙏', noteRu: 'Капучино без сахара',
    need: { main: { 'fried-egg': 2, bacon: 2, hashbrown: 1, pancake: 2, toast: 1, parsley: 1 }, drink: { cappuccino: 1 } },
    no: ['sugar'],
    tip: 'American Breakfast по тех.карте: 2 яйца, 2 ломтика бекона, хашбраун, 2 панкейка, тост и петрушка. Гость попросил капучино без сахара — пакетик сахара не кладём.' },
  { brand: 'only-kebab', brandName: 'Only Kebab', app: 'GoFood', id: 'GO-2210',
    lines: ['1× Classic Shawarma', '1× Coca-Cola'], note: 'Tanpa tomat', noteRu: 'Без помидора',
    need: { main: { lavash: 1, 'chicken-thigh': 1, 'white-sauce': 1, 'shawarma-salad': 1, cucumber: 1 }, drink: { cola: 1 } },
    no: ['tomato'],
    tip: 'Classic Shawarma: лаваш, куриные бёдра гриль, белый соус, салат для шаурмы, огурец и помидор. По просьбе гостя помидор убираем — остальное как в тех.карте.' },
  { brand: 'hey-pizza', brandName: 'Hey, Pizza!', app: 'GrabFood', id: 'GF-1077',
    lines: ['1× Pizza Margherita'], note: 'Extra keju mozzarella', noteRu: 'Дополнительная моцарелла',
    need: { main: { dough: 1, 'pizza-sauce': 1, mozzarella: 2, oregano: 1, basil: 1, parmesan: 1, 'olive-oil': 1 } },
    no: [],
    tip: 'Margherita: тесто, томатный соус, моцарелла, орегано, базилик, пармезан, оливковое масло. «Extra keju» — двойная порция моцареллы: 2 порции вместо одной.' },
  { brand: 'hey-pasta', brandName: 'Hey, Pasta!', app: 'GoFood', id: 'GO-2234',
    lines: ['1× Pasta Carbonara', '1× Orange Juice'], note: 'Parmesan dipisah', noteRu: 'Пармезан отдельно',
    need: { main: { spaghetti: 1, bacon: 1, onion: 1, cream: 1, yolk: 1, 'fried-onion': 1 }, side: { parmesan: 1 }, drink: { 'orange-juice': 1 } },
    no: [],
    tip: 'Carbonara: спагетти, бекон, лук, сливки, желток, жареный лук и пармезан. «Dipisah» — значит отдельно: пармезан кладём в отдельный соусник, а не на пасту.' },
  { brand: 'healthy-fit', brandName: 'Healthy Fit', app: 'GrabFood', id: 'GF-1103',
    lines: ['1× Chicken Poke Bowl'], note: 'Saus dipisah ya', noteRu: 'Соус отдельно',
    need: { main: { rice: 1, 'chicken-boiled': 1, lettuce: 1, cherry: 1, 'baby-cucumber': 1, avocado: 1, edamame: 1, corn: 1, sesame: 1 }, side: { teriyaki: 1 } },
    no: [],
    tip: 'Chicken Poke Bowl: рис, отварная курица, листовой салат, черри, мини-огурцы, авокадо, эдамаме, кукуруза, кунжут и соус терияки. Соус по просьбе — в отдельный соусник.' },
  { brand: 'nutria', brandName: 'Nutria', app: 'GoFood', id: 'GO-2258',
    lines: ['1× Caesar Chicken'], note: 'Ayam dipisah, mau dipanaskan sendiri', noteRu: 'Курицу отдельно — гость сам разогреет',
    need: { main: { iceberg: 1, romano: 1, caesar: 1, parmesan: 1, croutons: 1 }, side: { 'chicken-breast': 1 } },
    no: [],
    tip: 'Nutria — тот же бренд-близнец Healthy Fit, блюда одинаковые. Caesar Chicken: айсберг, романо, заправка «Цезарь», пармезан, сухари и куриная грудка. Курицу по просьбе — в отдельный контейнер.' },
  { brand: 'fitbox', brandName: 'FitBox', app: 'GrabFood', id: 'GF-1131',
    lines: ['1× Power Chicken Lunch'], note: 'Tanpa kentang, brokoli double', noteRu: 'Без картофеля, двойная брокколи',
    need: { main: { lettuce: 1, rucola: 1, 'chicken-breast': 1, broccoli: 2, mushroom: 1, edamame: 1, 'honey-mustard': 1 } },
    no: ['baby-potato'],
    tip: 'Power Chicken Lunch: салат, руккола, куриная грудка, молодой картофель, брокколи, грибы, эдамаме и медово-горчичный соус. Картофель убираем, брокколи — две порции.' },
  { brand: 'pick-eat', brandName: 'Pick & Eat', app: 'GoFood', id: 'GO-2290',
    lines: ['Boiled rice 150 g', 'Steamed salmon 60 g', 'Avocado 100 g', 'Edamame 30 g', 'Sweet corn 50 g', 'Soy sauce 50 g'], note: 'Soy sauce dipisah', noteRu: 'Соевый соус отдельно',
    need: { main: { rice: 1, 'salmon-steamed': 1, avocado: 1, edamame: 1, corn: 1 }, side: { soy: 1 } },
    no: [],
    tip: 'В Pick & Eat гость собирает тарелку сам: кладём ровно то, что в чеке, и в порции из конструктора Pick & Eat. Соевый соус — отдельно в соусник.' },
  { brand: 'only-kebab', brandName: 'Only Kebab', app: 'GrabFood', id: 'GF-1164',
    lines: ['1× Royal Size Shawarma', '1× Chicken Strips', '1× Sprite'], note: 'Pedas ya, saus putih dipisah', noteRu: 'Острое, белый соус отдельно',
    need: { main: { lavash: 1, 'chicken-thigh': 1, 'shawarma-salad': 1, cucumber: 1, tomato: 1, chili: 1, strips: 1 }, side: { 'white-sauce': 1 }, drink: { sprite: 1 } },
    no: [],
    tip: 'Royal Size — та же шаурма, только больше порция. «Pedas» — добавить острый соус, «saus putih dipisah» — белый соус в отдельный соусник. Стрипсы и Sprite не забываем.' },
  { brand: 'egg-spot', brandName: 'The Egg Spot', app: 'GoFood', id: 'GO-2311',
    lines: ['1× Avocado Toast Salmon', '1× Latte'], note: 'Tambah 1 telur poached, gula 2 sachet', noteRu: 'Добавить 1 яйцо пашот, 2 пакетика сахара',
    need: { main: { sourdough: 1, 'cream-cheese': 1, 'avocado-mash': 1, 'salmon-smoked': 1, 'poached-egg': 2 }, drink: { latte: 1, sugar: 2 } },
    no: [],
    tip: 'The Egg Spot — бренд-близнец Only Eggs. Avocado Toast Salmon: хлеб на закваске, сливочный сыр, пюре авокадо, копчёный лосось и яйцо пашот. Гость попросил +1 яйцо — всего 2. К латте 2 пакетика сахара.' }
];
