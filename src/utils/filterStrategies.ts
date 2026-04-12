// src/utils/filterStrategies.ts
export const filterStrategies = {
  all: () => true,
  
  date: (recDate: Date, specificDate: string) => {
    if (!specificDate) return true;
    return recDate.toISOString().split('T')[0] === specificDate;
  },
  
  month: (recDate: Date, specificMonth: string) => {
    if (!specificMonth) return true;
    const recMonthString = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, '0')}`;
    return recMonthString === specificMonth;
  },
  
  year: (recDate: Date, specificYear: string) => {
    if (!specificYear) return true;
    return recDate.getFullYear().toString() === specificYear;
  }
};