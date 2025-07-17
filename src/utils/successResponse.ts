import { Response } from "express";
import { ApiResponse } from "../interfaces/siswaInterface";

export const successResponse = <T>(
   res: Response,
   statusCode: number,
   data: T,
   meta: object | null
) => {
   const response: ApiResponse<T> = {
      status: "success",
      data,
      meta,
      error: null,
   };

   res.status(statusCode).json(response);
};
