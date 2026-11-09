(function () {
// Банк вопросов академии. Один источник для теста и для редактора в админке.
// Вопрос: k — тип (one, many, order, photoOrder, photo, plate), c — карта,
// t — текст, o — варианты, a — индексы верных, s — верный порядок, g — тема.

const CARD = {
  amer: ['American Breakfast', 'Тех.карта - American Breakfast.dc.html', 'bf'],
  engl: ['English Breakfast', 'Тех.карта - English Breakfast.dc.html', 'bf'],
  farm: ['Farmers Breakfast', 'Тех.карта - Farmers Breakfast.dc.html', 'bf'],
  keto: ['Keto Breakfast', 'Тех.карта - Keto Breakfast.dc.html', 'bf'],
  shak: ['Shakshuka Eggs', 'Тех.карта - Shakshuka Eggs.dc.html', 'bf'],
  avsa: ['Avocado Toast Salmon', 'Тех.карта - Avocado Toast Salmon.dc.html', 'bf'],
  grsc: ['Greek Scramble', 'Тех.карта - Greek Scramble.dc.html', 'bf'],
  yggr: ['Yogurt Granola', 'Тех.карта - Yogurt Granola.dc.html', 'bf'],
  pmarg: ['Pizza Margherita', 'Тех.карта - Pizza Margherita.dc.html', 'pizza'],
  ppep: ['Pizza Pepperoni', 'Тех.карта - Pizza Pepperoni.dc.html', 'pizza'],
  pham: ['Pizza Ham Mushroom', 'Тех.карта - Pizza Ham Mushroom.dc.html', 'pizza'],
  ptruf: ['Pizza Truffle Triple Cheese', 'Тех.карта - Pizza Truffle Triple Cheese.dc.html', 'pizza'],
  ppine: ['Pizza Pineapple Shrimp', 'Тех.карта - Pizza Pineapple Shrimp.dc.html', 'pizza'],
  pcarb: ['Pasta Carbonara', 'Тех.карта - Pasta Carbonara.dc.html', 'pasta'],
  pbol: ['Pasta Bolognese', 'Тех.карта - Pasta Bolognese.dc.html', 'pasta'],
  ppesto: ['Pasta Salmon Pesto', 'Тех.карта - Pasta Salmon Pesto.dc.html', 'pasta'],
  pmed: ['Penne Mediterranean', 'Тех.карта - Penne Mediterranean.dc.html', 'pasta'],
  cesp: ['Espresso', 'Тех.карта - Espresso.dc.html', 'coffee'],
  camer: ['Americano', 'Тех.карта - Americano.dc.html', 'coffee'],
  ccap: ['Cappuccino', 'Тех.карта - Cappuccino.dc.html', 'coffee'],
  clat: ['Latte', 'Тех.карта - Latte.dc.html', 'coffee'],
  cflat: ['Flat White', 'Тех.карта - Flat White.dc.html', 'coffee'],
  rules: ['Правила кухни', 'Тех.карта - American Breakfast.dc.html', 'hyg'],
  std: ['Гигиена и стандарты', '', 'hyg'],
  agg: ['Доставка: Grab, GoJek, Runchise', '', 'agg'],
  sop02: ['SOP 02 · Makanan Sudah Siap', 'Стандарты - SOP.dc.html#sop02', 'sop'],
  sop04: ['SOP 04 · Out of Stock', 'Стандарты - SOP.dc.html#sop04', 'oos'],
  sop01: ['SOP 01 · Write Off', 'Стандарты - SOP.dc.html#sop01', 'wo']
};

const Q = [
  { k: 'one', c: 'amer', t: 'Сколько яиц идёт в порцию American Breakfast?',
    o: ['1 pcs', '2 pcs', '3 pcs', '4 pcs'], a: [1] },

  { k: 'many', c: 'amer', t: 'Что входит в порцию American Breakfast?', h: 'Верных ответов несколько',
    o: ['Fried eggs 2 pcs', 'Bacon 2 ломтика', 'Hash brown 1 pcs', 'Pancake 2 pcs', 'Toast bread 1 slice', 'Sausage small 2 pcs', 'Red bean in tomato 40 g', 'Avocado 1/2'], a: [0,1,2,3,4] },

  { k: 'order', c: 'amer', t: 'Собери порядок шагов: яйца и бекон',
    o: ['add oil and salt', 'start fry 2 eggs with low fire', 'fry 2 slice bacon', 'bacon need fry until crispy', 'bacon need to dry without oil (with napkins)'], s: [2,0,4,1,3] },

  { k: 'one', c: 'engl', t: 'Сколько Red bean in tomato в English Breakfast?',
    o: ['20 g', '40 g', '60 g', '80 g'], a: [1] },

  { k: 'many', c: 'engl', t: 'Из чего собирается салат в English Breakfast?', h: 'Верных ответов несколько',
    o: ['Salad latucce 10 g', 'White cabbage 10 g', 'Red cabbage 10 g', 'Rucola 10 g', 'Spinach 10 g'], a: [0,1,2] },

  { k: 'order', c: 'engl', t: 'Собери порядок шагов English Breakfast',
    o: ['need to fry 2 eggswitl low fire', 'need to fry 2 slice bacon', 'small sausages need to cut little bit', 'need to fry bacon and sausage', 'after frying need to dry'], s: [3,1,4,0,2] },

  { k: 'one', c: 'farm', t: 'Сколько яиц в Farmers Breakfast?',
    o: ['1 pcs', '2 pcs', '3 pcs', '4 pcs'], a: [2] },

  { k: 'many', c: 'farm', t: 'Что есть в составе Farmers Breakfast?', h: 'Верных ответов несколько',
    o: ['Baby potato 80 g', 'Onion 20 g', 'Bell peppers mix yellow + green + red', 'Garlic 5 g', 'Broccoli 120 g', 'Avocado 240 g', 'Hash brown 1 pcs'], a: [0,1,2,3] },

  { k: 'order', c: 'farm', t: 'В каком порядке закладывают ингредиенты в Farmers Breakfast?',
    o: ['start with bacon and sausage', 'need to add baby potato', 'need to add little bit salt', 'need to add onion', 'need to add all mix bell peppers'], s: [4,2,0,3,1] },

  { k: 'one', c: 'shak', t: 'Сколько Sauce sha-shuka идёт в фольгированную форму?',
    o: ['150 g', '200 g', '250 g', '300 g'], a: [2] },

  { k: 'one', c: 'shak', t: 'Сколько минут пропаривается Shakshuka Eggs?',
    o: ['3 минуты', '6 минут', '9 минут', '12 минут'], a: [1] },

  { k: 'one', c: 'shak', t: 'Сколько яиц добавляют в Shakshuka Eggs?',
    o: ['2 pcs', '3 pcs', '4 pcs', '5 pcs'], a: [1] },

  { k: 'order', c: 'avsa', t: 'Собери Avocado Toast Salmon по слоям',
    o: ['prepare toast (sourdough 1 slice 80 gr)', 'spread cream cheese 40 gr to toast', 'spread mashed avocado 120 gr', 'put smoked salmon 80 gr', 'add 1 pouched egg and ready'], s: [1,3,0,4,2] },

  { k: 'one', c: 'avsa', t: 'Какой хлеб в Avocado Toast Salmon?',
    o: ['Toast bread 1 slice 65 g', 'Sourdough bread 1 slice 80 g', 'Brioche 1 slice', 'Ciabatta 80 g'], a: [1] },

  { k: 'one', c: 'grsc', t: 'Что по карте делают на старте скрэмбла из 3 яиц в Greek Scramble?',
    o: ['Соль не добавлять', 'Добавить соль 1 g', 'Добавить соль и чёрный перец', 'Добавить соль после фету'], a: [0] },

  { k: 'one', c: 'grsc', t: 'Сколько Greek feta cheese в Greek Scramble?',
    o: ['30 g', '40 g', '50 g', '70 g'], a: [2] },

  { k: 'one', c: 'keto', t: 'Авокадо в Keto Breakfast — брутто и нетто?',
    o: ['240 g / 240 g', '240 g / 120 g (50%)', '120 g / 60 g (50%)', '240 g / 180 g (25%)'], a: [1] },

  { k: 'order', c: 'yggr', t: 'Собери Yogurt Granola',
    o: ['put greek yogurt 200 gr', 'add granola choklat 40 gr', 'slice mango 30 gr', 'pour honey 40 gr'], s: [2,0,3,1] },

  { k: 'one', c: 'rules', t: 'Что делают с беконом, панкейками и хашбрауном после обжарки?',
    o: ['Полить маслом сверху', 'Обсушить от масла салфетками', 'Убрать в холодильник', 'Оставить на сковороде до подачи'], a: [1] },

  { k: 'one', c: 'rules', t: 'На каком огне жарят яйца в завтраках по тех.картам?',
    o: ['На сильном огне', 'На медленном огне (low fire)', 'На среднем огне', 'Без разницы'], a: [1] },

  { k: 'photo', c: 'amer', t: 'Какое блюдо на фото подачи?', imgId: 'fin-hero',
    ph: 'Фото подачи American Breakfast', slot: 'test-bf-photo-1',
    o: ['English Breakfast', 'American Breakfast', 'Farmers Breakfast', 'Keto Breakfast'], a: [1], g: 'bfv' },

  { k: 'photoOrder', c: 'amer', t: 'Собери по фото: яйца и бекон', h: 'Фото с кухни — поставь кадры в порядок работы',
    o: ['масло и соль на сковороду', 'жарить 2 яйца на медленном огне', 'обжарить 2 ломтика бекона', 'бекон до хруста', 'бекон обсушить салфетками'],
    img: ['fin-s1', 'fin-s2', 'fin-s3', 'fin-s8', 'fin-s10'], s: [2,0,4,1,3], g: 'bfv' },

  { k: 'photoOrder', c: 'amer', t: 'Собери по фото: панкейки', h: 'Фото с кухни — поставь кадры в порядок работы',
    o: ['полуфабрикат панкейка', 'обжарить 2 шт панкейков', 'обжарить с двух сторон', 'обсушить салфетками'],
    img: ['fin-s4', 'fin-s5', 'fin-s7', 'fin-s11'], s: [2,0,3,1], g: 'bfv' },

  // ── Пицца ──────────────────────────────────────────────────────────────
  { k: 'one', c: 'pmarg', t: 'Сколько Pizza Dough (S/F) идёт на любую пиццу?',
    o: ['250 g', '300 g', '350 g', '400 g'], a: [2] },

  { k: 'one', c: 'pmarg', t: 'Сколько Mozzarella в Pizza Margherita?',
    o: ['50 g', '60 g', '80 g', '100 g'], a: [2] },

  { k: 'one', c: 'pmarg', t: 'Какой соус в Pizza Margherita?',
    o: ['White Pizza sauce (S/F) 100 g', 'Tomato Pizza sauce (S/F) 100 g', 'Pesto sauce 30 g', 'Bolognese sauce 150 g'], a: [1] },

  { k: 'one', c: 'ptruf', t: 'Какой соус в Pizza Truffle Triple Cheese?',
    o: ['Tomato Pizza sauce (S/F) 100 g', 'White Pizza sauce (S/F) 100 g', 'Pesto sauce 100 g', 'Соуса нет'], a: [1] },

  { k: 'many', c: 'ptruf', t: 'Какие сыры и масла в Pizza Truffle Triple Cheese?', h: 'Верных ответов несколько',
    o: ['Mozzarella 80 g', 'Cheddar 50 g', 'Parmesan 10 g', 'Truffle Oil 2 g', 'Olive oil 5 ml', 'Feta 50 g', 'Olives 30 g'], a: [0,1,2,3,4] },

  { k: 'one', c: 'ppep', t: 'Сколько Pepperoni Villa в Pizza Pepperoni?',
    o: ['60 g', '80 g', '100 g', '120 g'], a: [1] },

  { k: 'one', c: 'ppep', t: 'Сколько Olives в Pizza Pepperoni?',
    o: ['20 g', '30 g', '40 g', '50 g'], a: [1] },

  { k: 'one', c: 'pham', t: 'Сколько Fried Mushrooms (S/F) в Pizza Ham Mushroom?',
    o: ['40 g', '50 g', '60 g', '80 g'], a: [2] },

  { k: 'one', c: 'pham', t: 'TOTAL WEIGHT Pizza Ham Mushroom по карте?',
    o: ['560 g', '650 g', '680 g', '815 g'], a: [2] },

  { k: 'one', c: 'ppine', t: 'Shrimp 20-25 в Pizza Pineapple Shrimp — брутто и нетто?',
    o: ['150 g / 75 g', '150 g / 150 g', '100 g / 50 g', '75 g / 75 g'], a: [0] },

  { k: 'one', c: 'ppine', t: 'Arugula в Pizza Pineapple Shrimp — брутто и нетто?',
    o: ['40 g / 20 g', '20 g / 20 g', '40 g / 40 g', '30 g / 15 g'], a: [0] },

  { k: 'many', c: 'ppep', t: 'Что идёт в Pizza Pepperoni по карте?', h: 'Верных ответов несколько',
    o: ['Pizza Dough (S/F) 350 g', 'Pizza sauce (S/F) 100 g', 'Mozzarella 80 g', 'Pepperoni Villa 80 g', 'Olives 30 g', 'Parmesan 5 g', 'Smoked Ham 80 g', 'Fried Mushrooms 60 g', 'Cheddar 50 g'],
    a: [0,1,2,3,4,5] },

  // ── Паста ──────────────────────────────────────────────────────────────
  { k: 'one', c: 'pcarb', t: 'Какая паста в Pasta Carbonara?',
    o: ['Boiled Fusilli (S/F) 100 g', 'Boiled Penne (S/F) 100 g', 'Boiled Spaghetti (S/F) 100 g', 'Boiled Spaghetti (S/F) 150 g'], a: [2] },

  { k: 'one', c: 'pcarb', t: 'Сколько Cream в Pasta Carbonara?',
    o: ['50 g', '80 g', '100 g', '150 g'], a: [2] },

  { k: 'one', c: 'pcarb', t: 'Egg yolk (1 Whole) в Pasta Carbonara — сколько?',
    o: ['30 g', '50 g', '70 g', '100 g'], a: [1] },

  { k: 'many', c: 'pcarb', t: 'Что входит в Pasta Carbonara?', h: 'Верных ответов несколько',
    o: ['Bacon 50 g', 'Onion 80 g', 'Cream 100 g', 'Egg yolk 50 g', 'Bawang goreng 5 g', 'Bolognese sauce 150 g', 'Pesto sauce 30 g'], a: [0,1,2,3,4] },

  { k: 'one', c: 'pbol', t: 'Какая паста в Pasta Bolognese?',
    o: ['Boiled Spaghetti (S/F) 100 g', 'Boiled Fusilli (S/F) 100 g', 'Boiled Penne (S/F) 100 g', 'Boiled Fusilli (S/F) 150 g'], a: [1] },

  { k: 'one', c: 'pbol', t: 'Какие соусы в Pasta Bolognese?',
    o: ['Bolognese sauce 150 g + Tomato pizza sauce 100 g', 'Только Bolognese sauce 150 g', 'Bolognese sauce 100 g + Cream 100 g', 'Bolognese sauce 150 g + Pesto 30 g'], a: [0] },

  { k: 'one', c: 'ppesto', t: 'Salmon в Pasta Salmon Pesto — брутто и нетто?',
    o: ['70 g / 50 g', '70 g / 70 g', '100 g / 50 g', '50 g / 50 g'], a: [0] },

  { k: 'one', c: 'ppesto', t: 'Сколько Pesto sauce (S/F) в Pasta Salmon Pesto?',
    o: ['20 g', '30 g', '50 g', '100 g'], a: [1] },

  { k: 'one', c: 'pmed', t: 'Shrimp в Penne Mediterranean — брутто и нетто?',
    o: ['100 g / 50 g', '100 g / 100 g', '150 g / 75 g', '50 g / 50 g'], a: [0] },

  { k: 'one', c: 'pmed', t: 'Сколько Tomat Pizza sauce (S/F) в Penne Mediterranean?',
    o: ['100 g', '120 g', '150 g', '200 g'], a: [2] },

  // ── Кофе ───────────────────────────────────────────────────────────────
  { k: 'one', c: 'clat', t: 'Сколько капсул Indonesso в Latte?',
    o: ['1 (30 ml)', '2 (60 ml)', '3 (90 ml)', '2 (30 ml)'], a: [1] },

  { k: 'one', c: 'ccap', t: 'Сколько капсул Indonesso в Cappuccino?',
    o: ['1 (30 ml)', '2 (60 ml)', '1 (60 ml)', '3 (90 ml)'], a: [0] },

  { k: 'one', c: 'ccap', t: 'Сколько Hot Milk в Cappuccino?',
    o: ['150 ml', '170 ml', '190 ml', '200 ml'], a: [3] },

  { k: 'one', c: 'cflat', t: 'Сколько Hot Milk в Flat White?',
    o: ['150 ml', '170 ml', '200 ml', '220 ml'], a: [1] },

  { k: 'one', c: 'camer', t: 'Что идёт в Americano кроме капсулы?',
    o: ['Hot Water 190 ml', 'Hot Milk 190 ml', 'Hot Water 200 ml', 'Hot Milk 200 ml'], a: [0] },

  { k: 'one', c: 'cesp', t: 'Какой выход у Espresso по карте?',
    o: ['30 ml', '60 ml', '190 ml', '220 ml'], a: [0] },

  { k: 'one', c: 'camer', t: 'Какой выход у Americano по карте?',
    o: ['190 ml', '200 ml', '220 ml', '250 ml'], a: [2] },

  { k: 'one', c: 'clat', t: 'Чем Latte отличается от Cappuccino по составу карт?',
    o: ['Молока больше на 50 ml', 'Две капсулы вместо одной', 'Другая чашка', 'Ничем'], a: [1] },

  { k: 'many', c: 'cesp', t: 'Что входит в Espresso по карте?', h: 'Верных ответов несколько',
    o: ['Indonesso Capsules 1 (30 ml)', 'Espresso cup 1 pcs', 'Hot Milk 200 ml', 'Hot Water 190 ml', 'Coffee cup 1 pcs'], a: [0,1] },

  { k: 'one', c: 'cflat', t: 'В карте напитка стоит Hot Milk 170 ml. Какой это напиток?',
    o: ['Cappuccino', 'Latte', 'Flat White', 'Americano'], a: [2] },

  // ── Гигиена и стандарты ────────────────────────────────────────────────
  { k: 'one', c: 'std', t: 'Когда моешь руки на смене?',
    o: ['Только в начале смены', 'В начале смены и после каждого контакта с сырым продуктом', 'Раз в два часа', 'Когда видно, что руки грязные'], a: [1] },

  { k: 'one', c: 'std', t: 'Одна доска для сырой курицы и для готовых овощей — можно?',
    o: ['Можно, если протереть', 'Можно, если сполоснуть водой', 'Нельзя: сырое и готовое режут на разных досках', 'Можно в конце смены'], a: [2] },

  { k: 'one', c: 'std', t: 'Работаешь с полуфабрикатом из гастронорма (тесто панкейка, шакшука). Как правильно?',
    o: ['В чистых перчатках', 'Чистыми руками без перчаток', 'Перчатки только для мяса', 'Как удобнее'], a: [0] },

  { k: 'one', c: 'std', t: 'Что должно быть на контейнере с полуфабрикатом (S/F)?',
    o: ['Ничего, повар и так знает', 'Только название', 'Название и дата', 'Только дата'], a: [2] },

  { k: 'one', c: 'std', t: 'Готовое блюдо на полке стоит рядом с сырым мясом. Что делаешь?',
    o: ['Оставляю, полка холодная', 'Переставляю: сырое и готовое хранятся раздельно', 'Накрываю сырое плёнкой и оставляю', 'Спрашиваю в конце смены'], a: [1] },

  { k: 'one', c: 'std', t: 'Продукт упал на пол. Что с ним?',
    o: ['Сполоснуть и в дело', 'Обжарить подольше', 'Выбросить', 'Отдать на стафф'], a: [2] },

  { k: 'one', c: 'std', t: 'Пробуешь соус. Чем?',
    o: ['Той же ложкой, которой мешаешь', 'Чистой ложкой, одноразово', 'Пальцем', 'Пробовать соусы не нужно'], a: [1] },

  { k: 'one', c: 'std', t: 'Как отмеряешь граммовку из тех.карты?',
    o: ['На глаз, опыт есть', 'По весам, как в карте', 'Ложками по памяти', 'Как на прошлой работе'], a: [1] },

  { k: 'one', c: 'std', t: 'В карте брутто больше нетто (например Onion 20 g / 15 g). Что это значит?',
    o: ['Ошибка в карте', 'Потери при зачистке продукта', 'Вес после жарки', 'Вес с упаковкой'], a: [1] },

  { k: 'one', c: 'std', t: 'Ингредиент закончился прямо на смене. Что делаешь?',
    o: ['Меняю на похожий сам', 'Готовлю без него', 'Сообщаю шефу — замену решает он', 'Уменьшаю граммовку остальных'], a: [2] },

  { k: 'one', c: 'std', t: 'Собранная порция не похожа на фото в тех.карте. Что делаешь?',
    o: ['Отдаю, вкус же тот же', 'Пересобираю по карте', 'Спрашиваю у официанта', 'Добавляю зелени сверху'], a: [1] },

  { k: 'one', c: 'std', t: 'Порезал палец или заболел. Как правильно?',
    o: ['Работаю дальше, смена важнее', 'Заклеиваю и молчу', 'Сообщаю шефу и не работаю с продуктом', 'Просто мою руки чаще'], a: [2] },

  // ── Доставка: Grab и GoJek ─────────────────────────────────────────────
  { k: 'one', c: 'agg', t: 'Где принимаются заказы Grab и GoJek?',
    o: ['В приложении гостя GrabFood / GoFood', 'На фронт-офисе Runchise', 'В мессенджере от менеджера', 'По звонку курьера'], a: [1] },

  { k: 'one', c: 'agg', t: 'Кто принимает заказ в приложении?',
    o: ['Кто первый увидел', 'По приоритету: кассир → су-шеф → повар на кухне', 'Только кассир, иначе заказ ждёт', 'Повар на кухне'], a: [1] },

  { k: 'one', c: 'agg', t: 'Кассира и су-шефа нет на смене. Кто принимает заказ?',
    o: ['Заказ ждёт кассира', 'Повар на кухне', 'Курьер принимает сам', 'Заказ отменяется'], a: [1] },

  { k: 'one', c: 'agg', t: 'Сколько времени на принятие заказа?',
    o: ['1 минута', '3 минуты', '5 минут', '15 минут'], a: [0] },

  { k: 'one', c: 'agg', t: 'Сколько времени на подготовку позиций?',
    o: ['5-10 минут', '10-15 минут', '15-20 минут', '20-30 минут'], a: [2] },

  { k: 'one', c: 'agg', t: 'Сколько времени на сборку заказа и кто собирает?',
    o: ['3 минуты, собирает кассир', '3 минуты, собирает повар', '5 минут, собирает кассир', '10 минут, собирает курьер'], a: [0] },

  { k: 'one', c: 'agg', t: 'Как называется кнопка готовности заказа в Runchise?',
    o: ['«Заказ готов»', '«Makanan sudah siap»', '«Order ready»', '«Siap antar»'], a: [1] },

  { k: 'one', c: 'agg', t: 'Что происходит, когда нажали «Makanan sudah siap»?',
    o: ['Закрывается смена', 'Курьеру уходит сигнал, что заказ можно забирать', 'Гостю отправляется чек', 'Заказ уходит в стоп-лист'], a: [1] },

  { k: 'one', c: 'agg', t: 'Когда нажимать «Makanan sudah siap»?',
    o: ['Сразу после принятия заказа', 'Когда готова первая позиция', 'Когда заказ собран и упакован', 'Когда курьер уже приехал'], a: [2] },

  { k: 'one', c: 'agg', t: 'Курьер стоит и ждёт, а блюдо ещё на сковороде. Что делаешь?',
    o: ['Нажимаю «Makanan sudah siap», чтобы курьер не ушёл', 'Отдаю что готово, остальное потом', 'Не нажимаю до готовности и говорю курьеру время', 'Отменяю заказ'], a: [2] },

  { k: 'order', c: 'agg', t: 'Собери порядок работы с заказом агрегатора',
    o: ['принять заказ в Runchise — 1 минута', 'подготовить позиции — 15-20 минут', 'кассир собирает заказ — 3 минуты', 'нажать «Makanan sudah siap»', 'сверить заказ по чеку и передать курьеру'],
    s: [4,1,3,0,2], g: 'agg' },

  { k: 'one', c: 'agg', t: 'Курьер пришёл за заказом. Что делаешь до передачи?',
    o: ['Сверяю номер заказа и позиции по чеку', 'Отдаю первый собранный пакет', 'Спрашиваю имя гостя', 'Ничего, курьер сам проверит'], a: [0] },

  { k: 'one', c: 'agg', t: 'Кто ставит позицию в стоп-лист?',
    o: ['Любой повар', 'По приоритету: кассир → су-шеф смены → повар на кухне', 'Только шеф', 'Позиция выключается сама'], a: [1] },

  { k: 'one', c: 'agg', t: 'Позиция закончилась. Что делаешь?',
    o: ['Меняю на похожую сам', 'Позиция ставится в стоп-лист по приоритету: кассир → су-шеф → повар', 'Готовлю меньшую порцию', 'Жду, пока заказ отменится сам'], a: [1] },

  { k: 'one', c: 'agg', t: 'Кухня загружена, хочется отменить заказ. Можно?',
    o: ['Да, отменяю в Runchise сам', 'Да, если заказ большой', 'Нет: отмена только через кассира или су-шефа', 'Нет, но можно не готовить'], a: [2] },

  { k: 'one', c: 'agg', t: 'В заказе комментарий гостя, например «без лука». Что с ним?',
    o: ['Выполняю и проверяю перед упаковкой', 'Игнорирую, карта важнее', 'Спрашиваю у курьера', 'Кладу лук отдельно'], a: [0] },

  { k: 'one', c: 'agg', t: 'Сколько всего времени от принятия до передачи курьеру?',
    o: ['около 10 минут', 'около 20-25 минут', 'около 40 минут', 'без нормы'], a: [1] },

  { k: 'one', c: 'agg', t: 'Куда идёт чек с номером заказа?',
    o: ['На кухне в мусор', 'Крепится к упаковке заказа', 'Остаётся у менеджера', 'Отдаётся курьеру отдельно'], a: [1] },

  { k: 'one', c: 'agg', t: 'Как упаковывается заказ на доставку?',
    o: ['Всё в один пакет, включая напитки', 'Закрытая упаковка, напитки отдельно', 'Как есть, курьер довезёт', 'В два пакета без разницы что куда'], a: [1] },

  { k: 'many', c: 'agg', t: 'Что нельзя делать с заказом агрегатора?', h: 'Верных ответов несколько',
    o: ['Нажимать «Makanan sudah siap» до сборки заказа', 'Менять состав блюда без шефа', 'Отменять заказ самому', 'Отдавать заказ без сверки по чеку', 'Принимать заказ в Runchise', 'Ставить закончившуюся позицию в стоп-лист'], a: [0,1,2,3] },

  // ── SOP 02: Makanan Sudah Siap ─────────────────────────────────────────
  { k: 'one', c: 'sop02', t: 'Заказ Gojek. Когда нажимается «Makanan Sudah Siap»?',
    o: ['Сразу после того, как заказ готов и собран к передаче', 'После передачи заказа водителю', 'В конце смены', 'Когда водитель показал PIN'], a: [0] },

  { k: 'one', c: 'sop02', t: 'Заказ Grab. Приехал водитель. Что делаешь раньше?',
    o: ['Показываю PIN, потом нажимаю «Makanan Sudah Siap»', 'Нажимаю «Makanan Sudah Siap», потом показываю PIN', 'Порядок не важен', 'PIN показывает водитель сам'], a: [1] },

  { k: 'one', c: 'sop02', t: 'Что произойдёт, если PIN показать водителю Grab до нажатия кнопки?',
    o: ['Ничего, заказ просто уедет', 'Кнопка исчезнет, и заказ не попадёт в статистику времени подготовки', 'Заказ отменится', 'Водитель не сможет забрать заказ'], a: [1] },

  { k: 'one', c: 'sop02', t: 'Показать PIN водителю Grab до нажатия «Makanan Sudah Siap» — это:',
    o: ['Допустимо, если водитель спешит', 'Запрещено процедурой', 'Решает кассир', 'Допустимо в час пик'], a: [1] },

  { k: 'one', c: 'sop02', t: 'Кто ежедневно контролирует правильное использование кнопки?',
    o: ['Purchasing', 'Sous Chef и кассир', 'Только шеф', 'Водители агрегатора'], a: [1] },

  { k: 'many', c: 'sop02', t: 'Что считается нарушением по SOP 02?', h: 'Верных ответов несколько',
    o: ['Не нажать «Makanan Sudah Siap» на заказе Gojek после готовности', 'Показать PIN водителю Grab до нажатия кнопки', 'Передать неполный заказ гостю или водителю', 'Нажать кнопку сразу после сборки заказа Gojek', 'Нажать кнопку до показа PIN на заказе Grab'], a: [0,1,2] },

  { k: 'photo', c: 'sop02', t: 'Заказ готов и собран. Какую кнопку на этом экране нажимаешь?',
    imgId: 'img/sop02-runchise-order.png', fit: 'contain',
    o: ['Красную «Tidak pesanan»', 'Оранжевую «Makanan sudah siap»', 'Ни одну, жду курьера', 'Сначала красную, потом оранжевую'], a: [1], g: 'sop' },

  { k: 'photo', c: 'sop02', t: 'Что на этом экране означает «Catatan Pesanan»?',
    imgId: 'img/sop02-runchise-order.png', fit: 'contain',
    o: ['Номер заказа', 'Комментарий гостя к заказу', 'Сумма заказа', 'Время приготовления'], a: [1], g: 'sop' },

  { k: 'order', c: 'sop02', t: 'Заказ Grab: собери порядок действий',
    o: ['заказ готов и собран', 'нажать «Makanan Sudah Siap»', 'показать PIN водителю', 'передать заказ водителю'], s: [0,1,2,3], g: 'sop' },

  // ── SOP 04: Out of Stock ───────────────────────────────────────────────
  { k: 'one', c: 'sop04', t: 'Продукт закончился. Что делаешь первым?',
    o: ['Закрываю позиции в Runchise', 'Отправляю сообщение в группу Telegram General', 'Говорю кассиру устно', 'Жду конца смены'], a: [1] },

  { k: 'many', c: 'sop04', t: 'Что должно быть в сообщении о закончившемся продукте?', h: 'Верных ответов несколько',
    o: ['Название продукта', 'Время, когда продукт закончился', 'Когда продукт снова будет', 'Упоминание Sous Chef и Purchasing', 'Фото пустого контейнера', 'Сумма потерь'], a: [0,1,2,3] },

  { k: 'one', c: 'sop04', t: 'Где закрываются позиции с закончившимся продуктом?',
    o: ['Только в своей точке', 'Во всех точках, во всех блюдах с продуктом и в Create Your Plate', 'Только в основном меню', 'Только в Create Your Plate'], a: [1] },

  { k: 'one', c: 'sop04', t: 'Продукт снова появился на кухне. Порядок действий?',
    o: ['Сначала открыть позиции, потом написать в General', 'Сначала написать в группу General, потом открыть все позиции', 'Только открыть позиции', 'Только написать в General'], a: [1] },

  { k: 'one', c: 'sop04', t: 'Что указывается в сообщении о возврате продукта?',
    o: ['Название продукта и время получения или доготовки', 'Только название', 'Причина, по которой он закончился', 'Остаток на складе'], a: [0] },

  { k: 'one', c: 'sop04', t: 'Кто проверяет корректность меню в Runchise в начале смены?',
    o: ['Sous Chef и кассир, в ночную смену Line Cook', 'Только шеф', 'Purchasing', 'Никто, меню проверяется раз в неделю'], a: [0] },

  { k: 'one', c: 'sop04', t: 'Всё в наличии и все блюда активны. Какое сообщение в группу General?',
    o: ['«Menu checked»', '«All food available»', '«Stock OK»', 'Сообщение не нужно'], a: [1] },

  { k: 'one', c: 'sop04', t: 'В начале смены нет ни «All food available», ни информации об Out of Stock. Это значит:',
    o: ['Всё в порядке', 'Проверка меню считается непроведённой', 'Смена ещё не началась', 'Меню проверит кассир позже'], a: [1] },

  { k: 'many', c: 'sop04', t: 'Что считается нарушением по SOP 04?', h: 'Верных ответов несколько',
    o: ['Не написать в General, когда продукт закончился', 'Закрыть только часть блюд с этим продуктом', 'Не открыть блюда обратно, когда продукт появился', 'Оставить блюда активными, когда продукта нет', 'Написать в General и закрыть все позиции'], a: [0,1,2,3] },

  { k: 'order', c: 'sop04', t: 'Продукт закончился: собери порядок действий',
    o: ['сообщение в группу General с названием, временем и упоминанием Sous Chef и Purchasing', 'перевести все блюда с продуктом в Out of Stock во всех точках', 'продукт снова появился — сообщение в General', 'открыть все закрытые позиции'], s: [0,1,2,3], g: 'oos' },

  // ── SOP 01: Write Off ──────────────────────────────────────────────────
  { k: 'many', c: 'sop01', t: 'Что подлежит списанию (write off)?', h: 'Верных ответов несколько',
    o: ['Испорченный продукт', 'Просроченный продукт', 'Непригодный к использованию', 'Продукт на trial menu и тестирование', 'Продукт на staff meal', 'Обрезки и очистки (trimming)'], a: [0,1,2,3,4] },

  { k: 'one', c: 'sop01', t: 'Обрезки и очистки продукта (trimming) — списываются?',
    o: ['Да, как любой продукт', 'Нет, они не подлежат списанию', 'Да, раз в неделю', 'Только если их много'], a: [1] },

  { k: 'one', c: 'sop01', t: 'Как Line Cook оформляет списание?',
    o: ['Записывает в блокнот', 'Кладёт продукт на весы, фотографирует так, чтобы вес был виден, отправляет фото в группу Write Off', 'Сообщает Sous Chef устно', 'Вносит данные в Runchise сам'], a: [1] },

  { k: 'one', c: 'sop01', t: 'Line Cook отправил фото в группу Write Off. Что дальше с его стороны?',
    o: ['Его ответственность в процессе write off выполнена', 'Нужно заполнить Write Off Report', 'Нужно внести данные в Runchise', 'Нужно отчитаться Purchasing'], a: [0] },

  { k: 'one', c: 'sop01', t: 'Кто и как часто заполняет Write Off Report?',
    o: ['Line Cook после каждого списания', 'Sous Chef один раз за смену', 'Purchasing один раз в неделю', 'Шеф раз в месяц'], a: [1] },

  { k: 'many', c: 'sop01', t: 'Что указывается в Write Off Report?', h: 'Верных ответов несколько',
    o: ['Название продукта', 'Количество или вес', 'Причина списания', 'Имя гостя', 'Номер заказа'], a: [0,1,2] },

  { k: 'one', c: 'sop01', t: 'Кто вносит данные write off в Runchise и когда?',
    o: ['Sous Chef каждую смену', 'Purchasing один раз в неделю по отчётам Sous Chef', 'Line Cook сразу после фото', 'Кассир в конце дня'], a: [1] },

  { k: 'one', c: 'sop01', t: 'До какого момента данные write off за неделю должны быть в системе?',
    o: ['До конца рабочего дня в воскресенье', 'До конца месяца', 'До утра понедельника', 'Срока нет'], a: [0] },

  { k: 'one', c: 'sop01', t: 'Куда отправляется заполненный Write Off Report?',
    o: ['В группу Write Off', 'В группу Daily Report', 'В группу General', 'Purchasing лично'], a: [1] },

  { k: 'one', c: 'sop01', t: 'Когда продукт можно выбросить?',
    o: ['Сразу, как стало понятно, что он испорчен', 'Только после того, как он занесён в Write Off Report', 'После смены', 'После сообщения в General'], a: [1] },

  { k: 'many', c: 'sop01', t: 'Что запрещено по SOP 01?', h: 'Верных ответов несколько',
    o: ['Выбрасывать продукт без правильного процесса write off', 'Оформлять списание задним числом (backdate)', 'Скрывать порчу, потерю или перерасход', 'Фотографировать продукт на весах', 'Списывать продукт со staff meal'], a: [0,1,2] },

  { k: 'photo', c: 'sop01', t: 'Так выглядит группа Write Off. Что делает фото пригодным для списания?',
    imgId: 'img/sop01-writeoff-photos.png', fit: 'contain',
    o: ['Продукт на весах, вес читается, в подписи название и причина', 'Достаточно фото продукта в мусорном ведре', 'Хватит подписи без фото', 'Главное — время отправки'], a: [0], g: 'wo' },

  { k: 'photo', c: 'sop01', t: 'В группе Write Off подпись «Spoiled green bean 45gr». Что в ней указано?',
    imgId: 'img/sop01-writeoff-photos.png', fit: 'contain',
    o: ['Только название продукта', 'Причина, продукт и вес', 'Номер заказа и вес', 'Цена списания'], a: [1], g: 'wo' },

  { k: 'photo', c: 'sop01', t: 'Куда отправлен этот заполненный Write Off Report?',
    imgId: 'img/sop01-writeoff-report.png', fit: 'contain',
    o: ['В группу Write Off', 'В группу Daily Report', 'В группу General', 'Лично шефу'], a: [1], g: 'wo' },

  { k: 'order', c: 'sop01', t: 'Собери процесс write off по ролям',
    o: ['Line Cook: фото продукта на весах в группу Write Off', 'Sous Chef: заполняет Write Off Report раз за смену', 'Write Off Report уходит в группу Daily Report', 'Purchasing: вносит данные в Runchise раз в неделю'], s: [0,1,2,3], g: 'wo' }
];

const QUOTA = { bf: 3, bfv: 2, hyg: 3, pizza: 3, pasta: 2, coffee: 2, agg: 3, sop: 3, oos: 3, wo: 3 };
const TOPIC_TITLE = { bf: 'Завтраки', bfv: 'Завтраки по фото', hyg: 'Гигиена и стандарты', pizza: 'Пицца', pasta: 'Паста', coffee: 'Кофе', agg: 'Доставка: Runchise', sop: 'SOP 02: Makanan Sudah Siap', oos: 'SOP 04: Out of Stock', wo: 'SOP 01: Write Off' };
const TOPIC_COLOR = { bf: '#E0703F', bfv: '#E0703F', hyg: '#1F7A4D', pizza: '#C0392B', pasta: '#B8860B', coffee: '#7A4B2A', agg: '#1B4FB8', sop: '#1B4FB8', oos: '#6B3FA0', wo: '#2E7D8F' };

const VARIANTS = 10;
function topic(q) { return q.g || CARD[q.c][2]; }

const PRODUCTS = [
  ['prod-eggs', 'Chicken eggs'], ['prod-bacon', 'Bacon'], ['prod-hashbrown', 'Hash brown'],
  ['prod-pancake', 'Pancake'], ['prod-brioche', 'Toast bread / brioche'], ['prod-sausage', 'Sausage small halal'],
  ['prod-beans', 'Red bean in tomato'], ['prod-avocado', 'Avocado'], ['prod-salad', 'Salad latucce'],
  ['prod-cabbage-w', 'White cabbage'], ['prod-cabbage-r', 'Red cabbage'], ['prod-babypotato', 'Baby potato'],
  ['prod-peppers', 'Bell peppers mix'], ['prod-onion', 'Onion'], ['prod-feta', 'Greek feta cheese'],
  ['prod-salmon', 'Smoked salmon'], ['prod-sourdough', 'Sourdough bread'], ['prod-shakshuka', 'Sauce sha-shuka'],
  ['prod-cucumber', 'Cucumber'], ['prod-broccoli', 'Broccoli'], ['prod-yogurt', 'Greek yogurt'],
  ['prod-granola', 'Granola choklat'], ['prod-mango', 'Mango'], ['prod-honey', 'Honey'],
  ['prod-dough', 'Pizza Dough (S/F)'], ['prod-pizzasauce', 'Tomato Pizza sauce (S/F)'], ['prod-whitesauce', 'White Pizza sauce (S/F)'],
  ['prod-mozzarella', 'Mozzarella'], ['prod-parmesan', 'Parmesan'], ['prod-cheddar', 'Cheddar'],
  ['prod-pepperoni', 'Pepperoni Villa'], ['prod-olives', 'Olives'], ['prod-ham', 'Smoked Ham'],
  ['prod-mushrooms', 'Fried Mushrooms (S/F)'], ['prod-pineapple', 'Fried Pineapple (S/F)'], ['prod-shrimp', 'Shrimp 20-25'],
  ['prod-spaghetti', 'Boiled Spaghetti (S/F)'], ['prod-fusilli', 'Boiled Fusilli (S/F)'], ['prod-penne', 'Boiled Penne (S/F)'],
  ['prod-cream', 'Cream'], ['prod-pesto', 'Pesto sauce (S/F)'], ['prod-bolognese', 'Bolognese sauce (S/F)'],
  ['prod-capsule', 'Indonesso Capsules'], ['prod-hotmilk', 'Hot Milk'], ['prod-coffeecup', 'Coffee cup']
];

window.FL_QUESTIONS = { CARD: CARD, Q: Q, QUOTA: QUOTA, TOPIC_TITLE: TOPIC_TITLE, TOPIC_COLOR: TOPIC_COLOR, VARIANTS: VARIANTS, topic: topic, PRODUCTS: PRODUCTS };
})();
