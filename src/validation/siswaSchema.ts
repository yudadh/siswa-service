import { z } from "zod";

export const updateSiswaParamsSchema = z.object({
   sekolah_asal_id: z.number().int().optional(),
});
export const updateSiswaSchema = z.object({
   banjar_id: z.number().int().positive(),
   desa_id: z.number().int().positive(),
   kecamatan_id: z.number().int().positive(),
   kabupaten_id: z.number().int().positive(),
   provinsi_id: z.number().int().positive(),
   sekolah_asal_id: z.number().int().positive(),
   nama: z.string().min(1),
   tempat_lahir: z.string().min(1),
   tanggal_lahir: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
         message: "Invalid date format",
      }),
   jenis_kelamin: z.enum(["L", "P"]),
   nomor_telepon: z
      .string()
      .regex(/^\d+$/, { message: "Nomor telepon hanya boleh mengandung angka" })
      .min(10)
      .max(16),
   agama_id: z.number().int().positive(),
   nik: z
      .string()
      .regex(/^\d+$/, { message: "NIK hanya boleh mengandung angka" })
      .length(16),
   nisn: z
      .string()
      .regex(/^\d+$/, { message: "NISN hanya boleh mengandung angka" })
      .length(10),
   alamat_tinggal: z.string().min(1),
   alamat_kk: z.string().min(1),
   isluartabanan: z.number().int().max(1).nonnegative(),
   nama_ibu: z.string().min(1),
   pekerjaan_ibu_id: z.number().int().positive(),
   penghasilan_ibu_id: z.number().int().positive(),
   nama_ayah: z.string().min(1),
   pekerjaan_ayah_id: z.number().int().positive(),
   penghasilan_ayah_id: z.number().int().positive(),
   nama_wali: z.string().min(1).nullable(),
   pekerjaan_wali_id: z.number().int().positive().nullable(),
   penghasilan_wali_id: z.number().int().positive().nullable(),
   kebutuhan_khusus: z.number().int().max(1).nonnegative(),
   lintang: z.number(),
   bujur: z.number(),
});

const filterSchema = z.object({
   value: z.string().or(z.boolean()).nullable(),
   matchMode: z.string()
})

export const paginationSchema = z.object({
   page: z.string().regex(/^\d+$/, "Page must be a numeric string"),
   limit: z.string().regex(/^\d+$/, "Limit must be a numeric string"),
   filters: z
   .string()
   .optional()
   .transform((str) => {
     try {
       const val = str ? JSON.parse(str) : {}
       console.log(val)
       return val;
     } catch (e) {
       return null; // Jika gagal parse, return null agar validasi gagal nanti
     }
   })
   .refine(
     (data) => data !== null && typeof data === "object" && !Array.isArray(data),
     {
       message: "filters harus berupa objek JSON yang valid",
     }
   )
   .pipe(z.record(filterSchema))
});

const id = z.string().regex(/^\d+$/, "ID must be a numeric string")
const periode_jalur_id =  z.string().regex(/^\d+$/, "ID must be a numeric string")

export const siswaParamsSchema = z.object({
   id
});

export const siswaStatusParamsSchema = z.object({
   id,
   periode_jalur_id
})

export const getSiswaNotInPendaftaranParamsSchema = z.object({
   periode_jalur_id,
   sekolah_id: z.string().regex(/^\d+$/, "ID must be a numeric string")
});

export const SiswaExcelSchema = z.object({
   siswa_nama: z.string().min(1, "Nama siswa kosong"),
   nisn: z.string().length(10, "NISN harus 10 digit"),
   nik: z.string().length(16, "NIK harus 16 digit"),
   provinsi: z.string().min(1, "Provinsi kosong"),
   kabupaten: z.string().min(1, "Kabupaten kosong"),
   kecamatan: z.string().min(1, "Kecamatan kosong"),
   desa: z.string().min(1, "Desa kosong"),
   banjar: z.string().min(1, "Banjar kosong"),
   tempat_lahir: z.string(),
   tanggal_lahir: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Tanggal lahir tidak valid" }),
   jenis_kelamin: z.string().refine(val => ["L", "P"].includes(val), { message: "Jenis kelamin harus L atau P" }),
   nomor_telepon: z.string().optional(),
   agama: z.string().optional(),
   alamat_tinggal: z.string().optional(),
   alamat_kk: z.string().optional(),
   nama_ibu: z.string().optional(),
   pekerjaan_ibu: z.string().optional(),
   penghasilan_ibu: z.string().optional(),
   nama_ayah: z.string().optional(),
   pekerjaan_ayah: z.string().optional(),
   penghasilan_ayah: z.string().optional(),
   kebutuhan_khusus: z.enum(["Ya", "YA", "Tidak", "TIDAK"], {message: "Kebutuhan khusus tidak valid"}).transform(val => {
    if (val.toLowerCase() === "ya") {
       return 1
    } else {
       return 0
    }
   }),
   lintang: z.union([z.string(), z.number()]).transform(val => parseFloat(val.toString())),
   bujur: z.union([z.string(), z.number()]).transform(val => parseFloat(val.toString())),
})

export const createAgamaBodySchema = z.object({
   nama_agama: z.string().min(1)
})

export const createPekerjaanBodySchema = z.object({
   nama_pekerjaan: z.string().min(1)
})