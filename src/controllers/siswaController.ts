import { Request, Response, NextFunction } from "express";
import { SiswaService } from "../services/siswaService";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";
import {
   GetAllSiswaPendaftaran,
   GetAllSiswaResponse,
   PaginationMeta,
   SiswaDTO,
} from "../interfaces/siswaInterface";
import { successResponse } from "../utils/successResponse";


export async function getTemplateCreateSiswa(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const buffer = await SiswaService.getTemplateCreateSiswa();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=template-siswa.xlsx')

      res.send(Buffer.from(buffer))
      // successResponse(res, 201, Buffer.from(buffer), null)
      // successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getTemplateCreateSiswa]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in getTemplateCreateSiswa]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in getTemplateCreateSiswa]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function createSiswaWithExcel(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const file = req.file;
      console.log(file)
      if (!file) {
         throw new AppError('File tidak ditemukan', 400);
      }

      const result = await SiswaService.createSiswaWithExcel(file.buffer)
      successResponse(res, 201, result, null)
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createSiswaWithExcel]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in createSiswaWithExcel]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in createSiswaWithExcel]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function updateSiswaById(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { id } = req.params;
      const requestData = req.body as SiswaDTO;
      const response = await SiswaService.updateSiswa(
         parseInt(id),
         requestData
      );
      //
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in updateSiswa]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in updateSiswa]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in updateSiswa]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllSiswaWithPagination(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { page = 1, limit = 10 } = req.query;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      const { id } = req.params;
      const { response, total } =
         await SiswaService.getAllSiswaWithPagination(
            Number(page),
            Number(limit),
            parseInt(id),
            filters
         );
      const meta: PaginationMeta = {
         total: total,
         page: Number(page),
         limit: Number(limit),
      };
      successResponse(res, 200, response, meta);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(
            `[AppError in getAllSiswaWithPagination]: ${error.message}`
         );
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllSiswaWithPagination]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllSiswaWithPagination]: ${JSON.stringify(
               error
            )}`
         );
      }
      next(error);
   }
}

export async function getSiswaById(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { id } = req.params;
      const response = await SiswaService.getSiswaById(parseInt(id));
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getSiswaById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in getSiswaById]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in getSiswaById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getSiswaStatusById(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { id, periode_jalur_id } = req.params;
      const response = await SiswaService.getSiswaStatusBySiswaId(
         Number(id as string),
         Number(periode_jalur_id as string)
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getSiswaStatusById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in getSiswaStatusById]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in getSiswaStatusById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getSiswaNotInPendaftaran(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { periode_jalur_id, sekolah_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      console.log(`page: ${page}, limit: ${limit}`)
      const response: {
         // siswaBelumDaftar: GetAllSiswaResponse[];
         // siswaDibatalkan: GetAllSiswaResponse[];
         siswaBelumTerdaftar: GetAllSiswaPendaftaran[];
         total?: number;
      } = await SiswaService.getSiswaNotInPendaftaran(
         Number(sekolah_id as string),
         Number(periode_jalur_id as string),
         Number(page as string),
         Number(limit as string),
         filters
      );

      // console.log(response.siswaBelumTerdaftar)

      const meta: PaginationMeta = {
         page: Number(page),
         limit: Number(limit),
         total: response.total!
      };
      // delete response.total
      successResponse(res, 200, response.siswaBelumTerdaftar, meta);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getSiswaNotInPendaftaran]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in getSiswaNotInPendaftaran]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in getSiswaNotInPendaftaran]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function countAllSiswaBySekolahId(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { id } = req.params;
      const response = await SiswaService.countAllSiswaBySekolahId(Number(id as string))
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in countAllSiswaBySekolahId]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in countAllSiswaBySekolahId]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in countAllSiswaBySekolahId]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function testingQuery(
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> {
   try {
      const { periode_jalur_id, sekolah_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      const response: {
         // siswaBelumDaftar: GetAllSiswaResponse[];
         // siswaDibatalkan: GetAllSiswaResponse[];
         siswaBelumTerdaftar: GetAllSiswaPendaftaran[];
         total?: number;
      } = await SiswaService.getSiswaNotInPendaftaran(
         Number(sekolah_id as string),
         Number(periode_jalur_id as string),
         Number(page as string),
         Number(limit as string),
         filters
      );

      const meta: PaginationMeta = {
         page: Number(page),
         limit: Number(limit),
         total: response.total!
      };
      delete response.total
      successResponse(res, 200, response.siswaBelumTerdaftar, meta);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in testingQuery]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in testingQuery]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in testingQuery]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function deleteSiswaById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const response = await SiswaService.deleteSiswaById(
         Number(id as string)
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in deleteSiswaById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in deleteSiswaById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in deleteSiswaById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

// agama
export async function createAgama(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { nama_agama }: { nama_agama: string } = req.body;
      const response = await SiswaService.createAgama(nama_agama);
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createAgama]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in createAgama]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in createAgama]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllAgama(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const response = await SiswaService.getAllAgama();
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllAgama]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in getAllAgama]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(
            `[Unknown Error in getAllAgama]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function updateAgamaById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const { nama_agama }: { nama_agama: string } = req.body;
      const response = await SiswaService.updateAgamaById(
         Number(id as string),
         nama_agama
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in updateAgamaById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updateAgamaById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updateAgamaById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function deleteAgamaById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const response = await SiswaService.deleteAgamaById(
         Number(id as string)
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in deleteAgamaById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in deleteAgamaById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in deleteAgamaById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

// pekerjaan
export async function createPekerjaan(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { nama_pekerjaan }: { nama_pekerjaan: string } = req.body;
      const response = await SiswaService.createPekerjaan(nama_pekerjaan);
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createPekerjaan]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in createPekerjaan]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in createPekerjaan]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllPekerjaan(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const response = await SiswaService.getAllPekerjaan();
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllPekerjaan]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllPekerjaan]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllPekerjaan]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function updatePekerjaanById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const { nama_pekerjaan }: { nama_pekerjaan: string } = req.body;
      const response = await SiswaService.updatePekerjaanById(
         Number(id as string),
         nama_pekerjaan
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in updatePekerjaanById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updatePekerjaanById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updatePekerjaanById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function deletePekerjaanById(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params;
      const response = await SiswaService.deletePekerjaanById(
         Number(id as string)
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in deletePekerjaanById]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in deletePekerjaanById]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in deletePekerjaanById]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

// Penghasilan
export async function getAllPenghasilan(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const response = await SiswaService.getAllPenghasilan();
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllPenghasilan]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllPenghasilan]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllPenghasilan]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}
