import { JenisKelamin } from "@prisma/client";

export interface ApiResponse<T> {
   status: "success" | "error";
   data: T | null;
   meta: any | null;
   error: {
      message: string;
      code: number;
   } | null;
}

export interface SiswaDTO {
   siswa_id?: number;
   user_id: number | null;
   banjar_id: number | null;
   desa_id: number | null;
   kecamatan_id: number | null;
   kabupaten_id: number | null;
   provinsi_id: number | null;
   sekolah_asal_id: number | null;
   nama: string;
   tempat_lahir: string;
   tanggal_lahir: string;
   jenis_kelamin: JenisKelamin;
   nomor_telepon: string | null;
   agama_id: number | null;
   nik: string | null;
   nisn: string;
   alamat_tinggal: string;
   alamat_kk: string | null;
   isluartabanan: number | null;
   nama_ibu: string;
   pekerjaan_ibu_id: number;
   penghasilan_ibu_id: number | null;
   nama_ayah: string | null;
   pekerjaan_ayah_id: number;
   penghasilan_ayah_id: number | null;
   nama_wali: string | null;
   pekerjaan_wali_id: number | null;
   penghasilan_wali_id: number | null;
   kebutuhan_khusus: number;
   lintang: number | null;
   bujur: number | null;
}

export interface SiswaResponse {
   siswa_id: number;
   nama: string;
}

export interface GetAllSiswaResponse extends SiswaResponse {
   nisn: string;
}

export interface GetAllSiswaPendaftaran extends GetAllSiswaResponse {
   pendaftaran_id: number | null
   banjar_id: number | null,
   tanggal_lahir: string;
   lintang: number | null,
   bujur: number | null,
   isWilayahFull: boolean
   isDokumenFull: boolean,
   statusDaftar: string,
   totalDokumenValid: number;
   isAllDokumenValid: boolean
}

export interface GetSiswaNotInPendaftaranAndDibatalkan extends GetAllSiswaResponse {
   provinsi_id: number | null,
   kabupaten_id: number | null,
   kecamatan_id: number | null,
   desa_id: number | null,
   banjar_id: number | null,
   tanggal_lahir: string
   lintang: number | null,
   bujur: number | null,
   dokumen_siswas_count: number,
   totalDokumenValid: string;
   pendaftaran: {
      pendaftaran_id: number | null,
      status: string | null,
      periode_jalur_id: number | null
   }
   isAllDokumenValid: boolean
   // isWilayahFull: boolean,
   // isDokumenFull: boolean,
}

// export interface GetSiswaByIdResponse extends Omit<UpdateSiswaRequest, "siswaId"> {
//    siswaId: string
// }

export interface PaginationMeta {
   total: number;
   page: number;
   limit: number;
}

export interface JwtPayloadToken {
   userId: number;
   role: string;
}

export interface SiswaWithStatus {
   siswa_id: number,
   isWilayahFull: boolean,
   isDokumenFull: boolean,
   isDokumenValid: boolean,
   isTerdaftar: boolean
}

export interface WilayahMap {
   provinsi_id: number,
   kabupaten_id: number,
   kecamatan_id: number,
   desa_id: number,
   banjar_id: number
}

export interface FailedRows {
    row_number: number;
    siswa_nama: string;
    messages: string[];
}

export interface CreateSekolahWithExcel {
    successCount: number;
    failCount: number;
    failedRows: FailedRows[]
}