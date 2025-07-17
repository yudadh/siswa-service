import express from "express";
import { authMiddleware } from "../middleware/jwtAuth";
import { roleMiddleware } from "../middleware/verifyRole";
import { validateRequest } from "../middleware/validation";
import {
   updateSiswaSchema,
   paginationSchema,
   siswaParamsSchema,
   getSiswaNotInPendaftaranParamsSchema,
   siswaStatusParamsSchema,
   createAgamaBodySchema,
   createPekerjaanBodySchema,
} from "../validation/siswaSchema";
import * as SiswaController from "../controllers/siswaController";
import { upload } from "../middleware/multer";

const router = express.Router();

// agama
router.post(
   "/agama",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ body: createAgamaBodySchema }),
   SiswaController.createAgama
);

router.get(
   "/agama",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   SiswaController.getAllAgama
);

router.put(
   "/agama/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({
      params: siswaParamsSchema,
      body: createAgamaBodySchema,
   }),
   SiswaController.updateAgamaById
);

router.delete(
   "/agama/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: siswaParamsSchema }),
   SiswaController.deleteAgamaById
);

// pekerjaan
router.post(
   "/pekerjaan",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ body: createPekerjaanBodySchema }),
   SiswaController.createPekerjaan
);

router.get(
   "/pekerjaan",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   SiswaController.getAllPekerjaan
);

router.put(
   "/pekerjaan/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({
      params: siswaParamsSchema,
      body: createPekerjaanBodySchema,
   }),
   SiswaController.updatePekerjaanById
);

router.delete(
   "/pekerjaan/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: siswaParamsSchema }),
   SiswaController.deletePekerjaanById
);

// penghasilan
router.get(
   "/penghasilan",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   SiswaController.getAllPenghasilan
);

router.post(
   "/many",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   upload.single("file"),
   SiswaController.createSiswaWithExcel
)

router.put(
   "/:id",
   authMiddleware,
   validateRequest({ params: siswaParamsSchema, body: updateSiswaSchema }),
   SiswaController.updateSiswaById
);

router.get(
   "/sekolah/:id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: siswaParamsSchema, query: paginationSchema }),
   SiswaController.getAllSiswaWithPagination
);

router.get("/total/:id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: siswaParamsSchema }),
   SiswaController.countAllSiswaBySekolahId
)

router.get(
   "/template",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   SiswaController.getTemplateCreateSiswa
)

router.get("/:id",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   validateRequest({ params: siswaParamsSchema }),
   SiswaController.getSiswaById
)

router.get("/status/:id/:periode_jalur_id",
   authMiddleware,
   roleMiddleware(["siswa"]),
   validateRequest({ params: siswaStatusParamsSchema }),
   SiswaController.getSiswaStatusById
)

router.get("/:periode_jalur_id/:sekolah_id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: getSiswaNotInPendaftaranParamsSchema, query: paginationSchema}),
   SiswaController.getSiswaNotInPendaftaran
)

router.get("/testing/:periode_jalur_id/:sekolah_id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: getSiswaNotInPendaftaranParamsSchema, query: paginationSchema}),
   SiswaController.testingQuery
)

// siswa
router.delete(
   "/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: siswaParamsSchema }),
   SiswaController.deleteSiswaById
)

export default router;
