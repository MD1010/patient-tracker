import { differenceInMonths } from 'date-fns';

const recallDateToValue = (recallDate: string | undefined) => {
  if (recallDate) {
    if (+recallDate) return recallDate;

    const monthsDifference = differenceInMonths(recallDate, new Date());

    return (monthsDifference + 1).toString();
  }
  return undefined;
};

export { recallDateToValue };
