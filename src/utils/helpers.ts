/**
 * Форматирует сообщение, заменяя плейсхолдеры на соответствующие значения.
 * 
 * Функция поддерживает два варианта вызова:
 * 1. С объектом параметров, где плейсхолдеры имеют формат {paramName}
 * 2. С переменным числом аргументов, где плейсхолдеры обозначены {0}, {1}, {2}, и т.д.
 * 
 * @param message - Сообщение с плейсхолдерами
 * @param paramsOrArg - Объект с параметрами или первый аргумент для подстановки
 * @param args - Дополнительные аргументы для подстановки
 * @returns Отформатированная строка с подставленными значениями
 * 
 * @example
 * // Вариант 1: С объектом параметров
 * formatMessage('Hello, {name}!', { name: 'John' }) // возвращает "Hello, John!"
 * 
 * @example
 * // Вариант 2: С переменным числом аргументов
 * formatMessage('Channel: {0} of {1}', '2', '10') // возвращает "Channel: 2 of 10"
 */
export const formatMessage = (
  message: string, 
  paramsOrArg: Record<string, string> | string, 
  ...args: string[]
): string => {
  let result = message;
  
  // Определяем, какой вариант функции используется
  if (typeof paramsOrArg === 'object') {
    // Вариант 1: Использование объекта параметров
    Object.entries(paramsOrArg).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
    });
  } else {
    // Вариант 2: Использование переменного числа аргументов
    const allArgs = [paramsOrArg, ...args];
    allArgs.forEach((arg, index) => {
      result = result.replace(new RegExp(`{${index}}`, 'g'), arg);
    });
  }
  
  return result;
}; 