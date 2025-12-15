import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const summarizeFinancialData = (data) => {
  try {
    let youGetBack = 0, youPay = 0;
    const youOwe = [], youAreOwed = [];

    for (let ele of data) {
        if (ele.type === 'you get back') {
            youGetBack += ele.amount;
            youAreOwed.push (ele);
        }
        else {
            youPay += ele.amount
            youOwe.push(ele);
        }
    }

    return {
      youGetBack,
      youPay,
      youOwe,
      youAreOwed
    };
  }
  catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      'Database error while getting user settlement details',
      500,
      errorCodes.DATABASE_OPERATION_ERROR
    );
  }
}