Пояснення до кожного питання
1
Що таке closure в JavaScript?
Closure — це функція з доступом до змінних зовнішнього лексичного scope.
Closure потрібні для callback-ів, memoization та інкапсуляції стану.
Типові помилки: застарілі значення і неправильний scope у циклах.
2
Який метод повертає новий масив із трансформованими елементами?
map повертає новий масив із трансформованими елементами.
forEach орієнтований на побічні ефекти і не повертає трансформацію.
Для чистої обробки даних у відповідях на співбесіді використовуйте map.
3
Що забороняє const?
const забороняє reassignment binding, але не глибоку мутацію об'єкта.
Властивості об'єкта можуть змінюватись, якщо не застосовувати додаткові обмеження.
Пояснюйте різницю між binding immutability і value immutability.
4
Яке твердження про let правильне?
let має block scope і temporal dead zone до ініціалізації.
Це зменшує клас помилок, пов'язаних з небезпечним hoisting.
Для перевизначуваних змінних у блоці використовуйте let, для стабільних — const.
5
Який метод повертає перший відповідний елемент або undefined?
find повертає перший елемент за умовою або undefined.
filter повертає всі збіги, тоді як find зупиняється на першому.
Для точкового пошуку find ефективніший і читабельніший.
6
Що повертає Array.prototype.reduce()?
7
Яке твердження про строгу рівність (===) правильне?
8
Що таке closure в JavaScript?
9
Що повертає 'typeof null'?
10
Що таке hoisting?
11
Яка різниця між let і var?
12
На що посилається 'this' в стрілковій функції?
13
Що таке event loop?
14
Що повертає Array.prototype.map()?
15
Що таке NaN?
16
Як перевірити чи значення є NaN?
17
Що робить 'use strict'?
18
Що таке деструктуризація?
19
Що таке оператор spread?
20
Що таке Promise?
21
Які три стани Promise?
22
Що робить Array.prototype.filter()?
23
Яка різниця між == і ===?
24
Що таке 'undefined' у JavaScript?
25
Що робить JSON.stringify()?
26
Для чого ключове слово 'const'?
27
Що таке Array.prototype.find()?
28
Що повертає Object.keys()?
29
Який синтаксис template literal?
30
Що повертає Array.prototype.some()?
31
Що таке rest параметр?
32
Що таке Array.prototype.every()?
33
Що таке callback функція?
34
Що перевіряє Array.prototype.includes()?
35
Для чого використовується Object.assign()?
36
Що таке оператор nullish coalescing?
37
Що робить Array.prototype.flat()?
38
Що таке optional chaining?
39
Що робить String.prototype.trim()?
40
Яке призначення try...catch?
41
Що повертає Array.prototype.indexOf() коли не знайдено?
42
Що робить Object.freeze()?
43
Яка різниця між null і undefined?
44
Що робить Array.prototype.concat()?
45
Що таке чиста функція?
46
Що робить Array.prototype.slice()?
47
Яка різниця між slice і splice?
48
Що таке Object.values()?
49
Що робить Array.prototype.join()?
50
Для чого Array.isArray()?
51
Що таке функція вищого порядку?
52
Що робить String.prototype.split()?
53
Реалізуйте debounce(fn, wait) для поля пошуку. Повернена функція має відкладати виконання і перезапускати таймер, якщо її викликають повторно до завершення очікування.
54
Полагодьте делегований click-handler для списку кнопок дій. Безпечно зчитайте action з найближчого відповідного елемента і викликайте run лише тоді, коли ціль справді знайдена.
55
Спроєктуйте normalizeProfile(input) для даних із форми. Перевірте обов'язкові поля, обріжте пробіли в рядках і кидайте помилку, якщо payload неповний.

посібник  
Повна теорія з прикладами коду
Async-потік і межі помилок
Розділяйте транспортні та доменні помилки. 500 і бізнес-валидація мають різну UX-обробку.

Критичні async-операції обгортайте в try/catch і показуйте зрозуміле повідомлення користувачу.

Не ковтайте помилки в порожніх catch-блоках.

Transport + domain валідація
async function loadProfile() {
const response = await fetch("/api/profile");
if (!response.ok) throw new Error("Transport error");
const data = await response.json();
if (!data.user) throw new Error("Invalid payload");
return data.user;
}
AbortController для race-safe UI
У пошуку/autocomplete попередні запити потрібно скасовувати при зміні вводу.

Без скасування застарілі відповіді можуть перезаписати актуальний UI-стан.

AbortController — стандартний механізм браузера для контролю життєвого циклу запиту.

Скасований пошуковий запит
let controller = null;
async function search(term) {
controller?.abort();
controller = new AbortController();
const res = await fetch('/api/search?q=' + encodeURIComponent(term), {
signal: controller.signal
});
return res.json();
}
Retry-політика без перевантаження бекенду
Повторюйте лише тимчасові збої та обмежуйте кількість спроб.

Використовуйте backoff (наприклад 300мс, 900мс, 1800мс), щоб зменшити пікове навантаження.

Ніколи не використовуйте миттєвий нескінченний retry у проді.

Обмежений retry з backoff
async function retry(fn, max = 3) {
for (let i = 0; i < max; i += 1) {
try { return await fn(); } catch (err) {
if (i === max - 1) throw err;
await new Promise(r => setTimeout(r, 300 \* (2 \*\* i)));
}
}
}
Архітектура API-клієнта для масштабного frontend
Розділяйте транспортний шар, доменну валідацію і UI-адаптацію.

Централізуйте заголовки, refresh токенів і глобальну мапу помилок в одному модулі клієнта.

Тримайте endpoint-и типізованими і уникайте хаотичних fetch-викликів по компонентах.

Типізований wrapper для endpoint
type ApiResult<T> = { data: T; status: number };

async function getJson<T>(url: string): Promise<ApiResult<T>> {
const response = await fetch(url);
if (!response.ok) throw new Error("HTTP error");
return { data: (await response.json()) as T, status: response.status };
}
Діагностика async-багів
Якщо стан стрибає непередбачувано, перевіряйте чи застарілий запит не прийшов пізніше нового.

Якщо помилки API виглядають хаотично, перевіряйте retry, скасування і дублікати запитів.

Використовуйте network tab з request ID для чіткого контролю життєвого циклу запиту.

Захист від застарілої відповіді
let requestId = 0;
async function loadData() {
const id = ++requestId;
const data = await fetch("/api/data").then(r => r.json());
if (id !== requestId) return;
render(data);
}

Пояснення до кожного питання
1
Що робить await в async-функції?
await зупиняє тільки поточну async-функцію, а не весь JS runtime.
Event loop продовжує обробку інших задач і UI лишається чутливим.
Це базова концепція для правильних відповідей по async flow.
2
Де зазвичай перевіряти статус відповіді при fetch?
У fetch спершу перевіряйте транспортний результат (status/ok), потім payload.
Успішний HTTP-запит і успішний бізнес-результат — різні рівні.
Ясне розділення помилок спрощує UX і відладку.
3
Що допомагає уникнути race condition у повторних запитах?
Race condition виникає, коли стара відповідь перезаписує новий стан UI.
AbortController та stale guards захищають інтерфейс від застарілих даних.
Контроль життєвого циклу запитів обов'язковий у швидких user-flow.
4
Яка практична стратегія retry для нестабільної мережі?
Bounded retry з backoff стабілізує поведінку при тимчасових збоях мережі.
Нескінченний миттєвий retry перевантажує сервер і погіршує інцидент.
Повторюйте лише безпечні/idempotent-операції.
5
Який діапазон статус-кодів зазвичай означає серверні помилки?
HTTP 5xx означає збої на стороні сервера: internal error, unavailable service тощо.
4xx найчастіше вказує на проблеми запиту з боку клієнта.
Розділяйте ці категорії в UX-обробці і retry-логіці.
6
Який статус-код зазвичай означає неавторизований запит?
7
Яка основна мета AbortController у flow із fetch?
8
Що робить async/await?
9
Який HTTP метод зазвичай використовується для створення ресурсу?
10
Що означає статус-код 404?
11
Яке призначення try...catch з async/await?
12
Що робить Promise.all()?
13
Що означає статус-код 500?
14
Що таке CORS?
15
Що повертає fetch()?
16
Який HTTP метод є ідемпотентним?
17
Яке призначення response.json()?
18
Що робить Promise.race()?
19
Що означає статус-код 201?
20
Яка різниця між PUT і PATCH?
21
Що таке REST API?
22
Що робить ключове слово 'await'?
23
Який Content-Type header для JSON?
24
Що робить Promise.finally()?
25
Що таке callback hell?
26
Що означає статус-код 403?
27
Яке призначення setTimeout?
28
Що таке черга мікрозадач?
29
Що перевіряє response.ok?
30
Що таке Promise.allSettled()?
31
Що робить setInterval?
32
Для чого зазвичай використовується Authorization header?
33
Що означає статус-код 204?
34
Що таке debouncing?
35
Що таке throttling?
36
Що робить HTTP метод HEAD?
37
Що таке query string?
38
Що робить JSON.parse()?
39
Що таке WebSocket?
40
Що повертає async функція?
41
Для чого HTTP метод OPTIONS?
42
Що таке race condition?
43
Що означає статус-код 302?
44
Що таке localStorage?
45
Що робить clearInterval?
46
Для чого Accept header?
47
Що таке preflight запит?
48
Що повертає Promise.resolve()?
49
Що таке sessionStorage?
50
Що означає статус-код 400?
51
Яке призначення credentials у fetch?
52
Що повертає Promise.reject()?
53
Напишіть fetchJson(url) для API-клієнта. Дочекайтеся відповіді, кидайте змістовну помилку, якщо response.ok дорівнює false, інакше повертайте розпарсений JSON.
54
Реалізуйте retryAsync(fn, attempts, delayMs) для нестабільного API-виклику. Повторюйте операцію обмежену кількість разів і зупиняйтесь одразу після першого успіху.
55
Полагодьте race condition у loadLatest. Ігноруйте застарілі відповіді, відстежуючи токен останнього запиту, і застосовуйте до state лише найсвіжіший результат.
