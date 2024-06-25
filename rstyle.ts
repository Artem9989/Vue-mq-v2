/* Модификатор "+" позволяет не прописывать для следующих точек свойства, они заполнются сами, пока не встретят следующий модификатор +
*  Модификатор "-" действует в обратную сторону, позволяет не прописывать свойства для меньшего экрана 
*  Например, mq320+ будет работать и на 768 и 1024 и т.д. если есть mq1024+ , то mq320+ дойдет до 1024+ и уже отработает 1024+
*  Ттакже это работает с модификатором "-", только в обратном порядке
*  Если ожидается адаптив под экраны (различные точки остановы), то директиве следует передать, объект, в котором лежит объект,
*  имя которого соответствует стилю, которому необходимо примениить адаптивные свойства
*
*  Если ожидается параметр под все экраны сразу, то необходимо передать string значение, например width: 40rem,
*  где ключ соответсвует стилю, название стилей записываются в camelCase
*/
import Vue from 'vue'
// точка остановки

let brk: any;
// Точка остановки прошлые (mob,tab)
let oldBrk: any;
// размер экрана пользователя
let windowWidth: number;

/**
 * по умолчанию
 * @const
 */
// возможные точки остановки новые и старые
export const options = {
  breakpoints: {
    mqInf: 7680,
    mq1440: 1440,
    mq1024: 1024,
    mq768: 768,
    mq320: 1,
  },
  oldBreakpoints: {
    lg: 'mq1440',
    md: 'mq1024',
    tab: 'mq768',
    mob: 'mq320',
  },
  fallbackBreakpoint: 'mq1024'
};

Vue.directive('rstyle', {
  bind: (el, binding) => {
    let lastBrkO = new newLastBrk();
    window.addEventListener('resize', () => addStyleComponent(lastBrkO, el.style, binding.value));
  },
  inserted: (el, binding) => {
    let lastBrkO = new newLastBrk();
    addStyleComponent(lastBrkO, el.style, binding.value)
  },
  unbind: (el, binding) => {
    let lastBrkO = new newLastBrk();
    window.removeEventListener('resize', () => addStyleComponent(lastBrkO, el.style, binding.value));
  }
})

const isObject = obj => obj && obj.constructor && obj.constructor === Object;
// кэшируем значения
function newLastBrk() {
  oldBrk = checkOldBrk()
  brk = getDefaultBrk()
  let lastBrk = brk;
  let lastBrkOld = oldBrk;
  //@ts-ignore
  this.getLastBrk = function () { return lastBrk }
  //@ts-ignore
  this.getLastBrkOld = function () { return lastBrkOld }
  //@ts-ignore
  this.lastBrk = function (brk) { lastBrk = brk; }
  //@ts-ignore
  this.lastBrkOld = function (brk) { lastBrkOld = brk; }
}
const addStyleComponent = (lastBrkO, style, binding) => {
  const { breakpoints, oldBreakpoints } = options
  if (!binding) {
    return
  }
  windowWidth = window.innerWidth
  brk = getDefaultBrk()
  oldBrk = checkOldBrk()
  //  Проверка прошлых значения и текущих
  if (brk.key !== lastBrkO.getLastBrk() && (!brk.key.includes('+') || !brk.key.includes('-'))
    || oldBrk.key !== lastBrkO.getLastBrkOld()) {
    lastBrkO.lastBrk(brk.key);
    lastBrkO.lastBrkOld(oldBrk.key);
  }
  else if (oldBrk.key !== brk.key && (!brk.key.includes('+') || !brk.key.includes('-'))) return
  else return
  // забираем значение и ключ у элемента
  for (const [key, value] of Object.entries(binding)) {
    // проверяем value на объект
    if (isObject(value)) {
      // если объект то забираем значение и ключ у него
      //@ts-ignore
      for (const [keyTwo, valueTwo] of Object.entries(value)) {
        // Убираем последний элемент из ключа
        const keySlice = keyTwo.slice(0, -1)
        const lastElementKey = keyTwo.slice(-1)
        // проверяем на модификатор + 
        if (lastElementKey === '+' && windowWidth + 1 >= breakpoints[keySlice]) {
          // проверяем значение следующего элемента, если модификатор + есть, то следующее значение будет равно предыдущему
          style[key] = valueTwo
          return
        }
        else if (lastElementKey === '+' && windowWidth < breakpoints[keySlice]) {
          // обнуляем значение, если экран меньше чем необходимо
          style[key] = ''
        }
        else if (lastElementKey === '-' && windowWidth - 1 <= breakpoints[keySlice]) { //проверяем на модификтаор -
          // // проверяем значение прошлого элемента, если модификатор - есть, то предыдущее значение будет равно следующем
          style[key] = valueTwo
          return
        }
        else if (lastElementKey === '-' && windowWidth > breakpoints[keySlice]) {
          // обнуляем значение, если экран больше чем необходимо
          style[key] = ''
        }
        // Проверяем подходит ли значение под экран, также проверяем старые точки остановы
        else if (keyTwo === brk.key && windowWidth >= brk.value || oldBreakpoints[keyTwo] === brk.key && windowWidth >= oldBrk.value) {
          style[key] = valueTwo
          return
        }
        // если нет точки остановы то пустой стиль
        else if (keyTwo !== brk.key || oldBreakpoints[keyTwo] !== brk.key) {
          style[key] = ''
        }
      }
    }
    // если значение не является объектом, то назначить стиль
    else {
      style[key] = value
    }
  }
}

// функция находит текущую точку остановы
const getDefaultBrk = () => {
  const { breakpoints = [] } = options
  let breakpointsKeys = Object.keys(breakpoints)
  breakpointsKeys = (breakpointsKeys.sort((a, b) => breakpoints[a] - breakpoints[b]))
  // разбиваем объект на ключ / значение и если значение меньше или равно размеру экрана, возвращаем ключ и значение
  for (const [key, value] of Object.entries(breakpoints)) {
    if (windowWidth >= value) {
      return { key, value: breakpoints[key] }
    }
  }
}
// функция находит текущую точку остановы, среди старых
const checkOldBrk = () => {
  const { oldBreakpoints, breakpoints } = options
  /**
  разбиваем объекты на ключ / значение и если ключ равен прошлому ключу 
  и размер экрана больше значения точки остановы, возвращаем точку остановы и ключ 
  */
  for (const [oldKey, oldValue] of Object.entries(oldBreakpoints)) {
    for (const [key, value] of Object.entries(breakpoints)) {
      if (key === oldBreakpoints[oldKey] && windowWidth >= breakpoints[oldValue]) {
        return { key: key, value: value }
      }
    }
  }
}
