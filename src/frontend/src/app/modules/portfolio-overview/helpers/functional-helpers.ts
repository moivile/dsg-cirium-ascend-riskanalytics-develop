export const functionalHelpers =
{
  groupBy: (array: any[], key: string) => array.reduce((accumulator, currentValue) => {
    return privateHelpers.addToGroup(accumulator, key, currentValue);
  }, {}),
  groupByExcludingNulls: (array: any[], key: string) => array.reduce((accumulator, currentValue) => {
    if (currentValue[key] === null) {
      return accumulator;
    }
    return privateHelpers.addToGroup(accumulator, key, currentValue);
  }, {}),
  distinct: (array: any[], key: string) => {
    return [...new Set(array.map(arrayItem => arrayItem[key]))] as any[];
  },
  distinctWithoutNulls: (array: any[], key: string) => {
    return [...new Set(array.map(arrayItem => arrayItem[key]))].filter(x=>x!=null) as any[];
  },
  countBy: (array: any[], key: string) => array.reduce((accumulator, currentValue) => {
    const currentCount = accumulator[currentValue[key]] || 0;
    accumulator[currentValue[key]] = currentCount + 1;
    return accumulator;
  }, {}),
  countByExcludingNulls: (array: any[], key: string) => array.reduce((accumulator, currentValue) => {
    if (currentValue[key] === null) {
      return accumulator;
    }
    const currentCount = accumulator[currentValue[key]] || 0;
    accumulator[currentValue[key]] = currentCount + 1;
    return accumulator;
  }, {}),
  sortByPropertyDescending: (array: any[], property: any) => {
    return array.sort((a, b) => {
      if (a[property] === b[property]) {
        return 0;
      }
      return a[property] > b[property] ? -1 : 1;
    });
  },
  sortByPropertyAscending: (array: any[], property: any) => {
    return array.sort((a, b) => {
      if (a[property] === b[property]) {
        return 0;
      }
      return a[property] < b[property] ? -1 : 1;
    });
  },
  computeMean(array: number[], decimalPlaces: number): number {
    if (array.length === 0) {
      return 0;
    }
    const total = array.reduce((a, b) => a + b);
    return this.round((total / array.length), decimalPlaces);
  },
  computeMedian(array: number[], decimalPlaces: number): number {
    if (array.length === 0) {
      return 0;
    }
    array.sort((a, b) => a - b);
    const middleIndex = (array.length - 1) / 2;
    return this.round((middleIndex % 1 === 0 ? array[middleIndex] :
      (array[Math.floor(middleIndex)] + array[Math.ceil(middleIndex)]) / 2), decimalPlaces);
  },
  round(value: number, decimalPlaces: number): number {
    return Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  },
  calculatePercentage(numerator: number, denominator: number, decimalPlaces: number): number {
    const percentage = (numerator / denominator * 100);
    if (Number.isNaN(percentage)) {
      return 0;
    }
    return this.round(percentage, decimalPlaces);
  },
};

const privateHelpers = {
  addToGroup:(accumulator: any, key: string, currentValue: any) => {
    const groupByKey = currentValue[key];

    if(!accumulator[groupByKey]) {
      accumulator[groupByKey] = [];
    }

    accumulator[groupByKey].push(currentValue);
    return accumulator;
  }
};
