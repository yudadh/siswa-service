import { SiswaRepository } from "../repositories/siswaRepository";
import { JenisKelamin, Prisma, Siswa } from "@prisma/client";
import { AppError } from "../utils/appError";
import {
   GetAllSiswaPendaftaran,
   GetAllSiswaResponse,
   SiswaDTO,
   SiswaResponse,
   GetSiswaNotInPendaftaranAndDibatalkan,
   WilayahMap,
   FailedRows,
   CreateSekolahWithExcel,
} from "../interfaces/siswaInterface";
import ExcelJS, { CellValue } from "exceljs"
import { parseRowToStrings } from "../utils/rowToString";
import { SiswaExcelSchema } from "../validation/siswaSchema";
import { logger } from "../utils/logger";
import { parse } from "dotenv";

export class SiswaService {

   static async getTemplateCreateSiswa() {
      const wilayahs = await SiswaRepository.findAllWilayahBali()
      const agamas = await SiswaRepository.findAllAgama()
      const pekerjaan = await SiswaRepository.findAllPekerjaan()
      const penghasilan = await SiswaRepository.findAllPenghasilan()
      const rows = wilayahs.map((w) => ({
         provinsi: w.desa.kecamatan.kabupaten.provinsi.provinsi_nama,
         kabupaten: w.desa.kecamatan.kabupaten.kabupaten_nama,
         kecamatan: w.desa.kecamatan.kecamatan_nama,
         desa: w.desa.desa_nama,
         banjar: w.banjar_nama
      }))

      // const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res })
      const workbook = new ExcelJS.Workbook()
      const templateSheet = workbook.addWorksheet("Data Siswa")
      templateSheet.columns = [
        { header: 'Nama Siswa', key: 'siswa_nama', width: 15 },
        { header: 'NIK', key: 'nik', width: 10 },
        { header: 'NISN', key: 'nisn', width: 10 },
        { header: 'Provinsi', key: 'provinsi', width: 15 },
        { header: 'Kabupaten', key: 'kabupaten', width: 15 },
        { header: 'Kecamatan', key: 'kecamatan', width: 15 },
        { header: 'Desa', key: 'desa', width: 15 },
        { header: 'Banjar', key: 'banjar', width: 15 },
        { header: 'Tempat Lahir', key: 'tempat_lahir', width: 15 },
        { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
        { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
        { header: 'Nomor Telepon', key: 'nomor_telepon', width: 15 },
        { header: 'Agama', key: 'agama', width: 15 },
        { header: 'Alamat Tinggal', key: 'alamat_tinggal', width: 15 },
        { header: 'Alamat KK', key: 'alamat_kk', width: 15 },
        { header: 'Nama Ibu', key: 'nama_ibu', width: 15 },
        { header: 'Pekerjaan Ibu', key: 'pekerjaan_ibu', width: 15 },
        { header: 'Penghasilan Ibu', key: 'penghasilan_ibu', width: 15 },
        { header: 'Nama Ayah', key: 'nama_ayah', width: 15 },
        { header: 'Pekerjaan Ayah', key: 'pekerjaan_ayah', width: 15 },
        { header: 'Penghasilan Ayah', key: 'penghasilan_ayah', width: 15 },
        { header: 'Kebutuhan Khusus', key: 'kebutuhan_khusus', width: 15 },
        { header: 'Lintang', key: 'lintang', width: 15 },
        { header: 'Bujur', key: 'bujur', width: 15 },
      ];

      const wilayahSheet = workbook.addWorksheet("Master Wilayah")
      wilayahSheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Provinsi', key: 'provinsi', width: 20 },
        { header: 'Kabupaten', key: 'kabupaten', width: 20 },
        { header: 'Kecamatan', key: 'kecamatan', width: 20 },
        { header: 'Desa', key: 'desa', width: 20 },
        { header: 'Banjar', key: 'banjar', width: 20 },
      ];

      for (const [i, row] of rows.entries()) {
         wilayahSheet.addRow([
            i + 1,
            row.provinsi,
            row.kabupaten,
            row.kecamatan,
            row.desa,
            row.banjar
         ])
      }

      const agamaSheet = workbook.addWorksheet("Master Agama")
      agamaSheet.columns = [
         { header: 'No', key: 'no', width: 5 },
         { header: 'Agama', key: 'agama', width: 10 },
      ]

      for (const [i, agama] of agamas.entries()) {
         agamaSheet.addRow([
            i + 1,
            agama.nama_agama
         ])
      }

      const pekerjaanSheet = workbook.addWorksheet("Master Pekerjaan")
      pekerjaanSheet.columns = [
         { header: 'No', key: 'no', width: 5 },
         { header: 'Pekerjaan', key: 'pekerjaan', width: 10 },
      ]

      
      for (const [i, p] of pekerjaan.entries()) {
         pekerjaanSheet.addRow([
            i + 1,
            p.nama_pekerjaan
         ])
      }
      
      const penghasilanSheet = workbook.addWorksheet("Master Penghasilan")
      penghasilanSheet.columns = [
         { header: 'No', key: 'no', width: 5 },
         { header: 'Penghasilan', key: 'penghasilan', width: 10 },
      ]
      
      for (const [i, p] of penghasilan.entries()) {
         penghasilanSheet.addRow([
            i + 1,
            p.penghasilan
         ])
      }

      [templateSheet, wilayahSheet, agamaSheet, pekerjaanSheet, penghasilanSheet].forEach(sheet => {
        sheet.getRow(1).font = { bold: true };
      });

      const buffer = await workbook.xlsx.writeBuffer()

      return buffer
   }

   static async createSiswaWithExcel(buffer: Buffer): Promise<CreateSekolahWithExcel> {
      const failedRows: FailedRows[] = [];
      let successCount = 0;

      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const worksheet = workbook.worksheets[0]

      let headers: string[] = []
      worksheet.getRow(1).eachCell((cell, cellNumber) => {
         headers.push(cell.value?.toString().trim() ?? '')
      })

      const wilayahs = await SiswaRepository.findAllWilayahBali()
      const agamas = await SiswaRepository.findAllAgama()
      const pekerjaan = await SiswaRepository.findAllPekerjaan()
      const penghasilan = await SiswaRepository.findAllPenghasilan()

      const wilayahMap = new Map<string, WilayahMap>()
      const agamaMap = new Map<string, number>()
      const pekerjaanMap = new Map<string, number>()
      const penghasilanMap = new Map<string, number>()

      for (const agama of agamas) {
         agamaMap.set(agama.nama_agama, agama.agama_id)
      }

      for (const p of pekerjaan) {
         pekerjaanMap.set(p.nama_pekerjaan, p.pekerjaan_id)
      }

      for (const p of penghasilan) {
         penghasilanMap.set(p.penghasilan ?? "", p.penghasilan_id)
      }

      for (const w of wilayahs) {
         const key = [
           w.desa.kecamatan.kabupaten.provinsi.provinsi_nama,
           w.desa.kecamatan.kabupaten.kabupaten_nama,
           w.desa.kecamatan.kecamatan_nama,
           w.desa.desa_nama,
           w.banjar_nama,
         ]
         .map((v) => v.trim().toLowerCase())
         .join("|")
         
         wilayahMap.set(key, {
            provinsi_id: w.desa.kecamatan.kabupaten.provinsi.provinsi_id,
            kabupaten_id: w.desa.kecamatan.kabupaten.kabupaten_id,
            kecamatan_id: w.desa.kecamatan.kecamatan_id,
            desa_id: w.desa.desa_id,
            banjar_id: w.banjar_id
         })
      }

      console.log(headers)

      let rows: Prisma.SiswaCreateInput[] = []
      worksheet.eachRow((row, rowNumber) => {
         if (rowNumber === 1) return
         const values = parseRowToStrings(row.values as CellValue[])
         console.log(values)
         const [
            siswa_nama,
            nik,
            nisn,
            provinsi,
            kabupaten,
            kecamatan,
            desa,
            banjar,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
            nomor_telepon,
            agama,
            alamat_tinggal,
            alamat_kk,
            nama_ibu,
            pekerjaan_ibu,
            penghasilan_ibu,
            nama_ayah,
            pekerjaan_ayah,
            penghasilan_ayah,
            kebutuhan_khusus,
            lintang,
            bujur,
         ] = values // row.values[0] is null
      
         const parsed = SiswaExcelSchema.safeParse({
            siswa_nama, nisn, nik, provinsi, kabupaten, kecamatan, desa, banjar,
            tempat_lahir, tanggal_lahir, jenis_kelamin, nomor_telepon,
            agama, alamat_tinggal, alamat_kk,
            nama_ibu, pekerjaan_ibu, penghasilan_ibu,
            nama_ayah, pekerjaan_ayah, penghasilan_ayah,
            kebutuhan_khusus, lintang, bujur,
         })
         
         if (!parsed.success) {
            failedRows.push({
               row_number: rowNumber,
               siswa_nama: siswa_nama,
               messages: parsed.error.errors.map(e => e.message)
            })
            return
         }
         
         const validData = parsed.data!
         // console.log(validData)

         const key = [validData.provinsi, validData.kabupaten, validData.kecamatan, validData.desa, validData.banjar]
         .map((v) => (v || "").toLowerCase())
         .join("|")
         
         const messages: string[] = []
         
         const wilayah = this.setErrorField(wilayahMap, key, messages, "data wilayah tidak valid")
         const agamaValue = this.setErrorField(agamaMap, validData.agama ?? "", messages, "data agama tidak valid")
         const pekerjaanIbuValue = this.setErrorField(pekerjaanMap, validData.pekerjaan_ibu ?? "", messages, "data pekerjaan ibu tidak valid")
         const penghasilanIbuValue = this.setErrorField(penghasilanMap, validData.penghasilan_ibu ?? "", messages, "data penghasilan ibu tidak valid")
         const pekerjaanAyahValue = this.setErrorField(pekerjaanMap, validData.pekerjaan_ayah ?? "", messages, "data pekerjaan ayah tidak valid")
         const penghasilanAyahValue = this.setErrorField(penghasilanMap, validData.penghasilan_ayah ?? "", messages, "data penghasilan ayah tidak valid")
         
         logger.info(`messages: ${messages.map(m => ({ message: m }))}`)

         if (messages.length > 0) {
            failedRows.push({
               row_number: rowNumber,
               siswa_nama: validData.siswa_nama,
               messages: messages
            })
            return
         }
      
         rows.push({
            nama: validData.siswa_nama,
            nisn: validData.nisn,
            nik: validData.nik,
            provinsi: {
               connect: {
                  provinsi_id: wilayah!.provinsi_id
               }
            },
            kabupaten: {
               connect: {
                  kabupaten_id: wilayah!.kabupaten_id
               }
            },
            kecamatan: {
               connect: {
                  kecamatan_id: wilayah!.kecamatan_id
               }
            },
            desa: {
               connect: {
                  desa_id: wilayah!.desa_id
               }
            },
            banjar: {
               connect: {
                  banjar_id: wilayah!.banjar_id
               }
            },
            m_agama: {
               connect: {
                  agama_id: agamaValue
               }
            },
            tempat_lahir: tempat_lahir?.toString().trim() || "",
            tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir.toString().trim()) : "",
            jenis_kelamin: jenis_kelamin?.toString().trim() as JenisKelamin,
            nomor_telepon: nomor_telepon?.toString().trim(),
            alamat_tinggal: alamat_tinggal,
            alamat_kk: alamat_kk,
            nama_ibu: nama_ibu,
            pekerjaan_ibu_id: pekerjaanIbuValue!,
            penghasilan_ibu_id: penghasilanIbuValue,
            nama_ayah: nama_ayah,
            pekerjaan_ayah_id: pekerjaanAyahValue!,
            penghasilan_ayah_id: penghasilanAyahValue,
            kebutuhan_khusus: validData.kebutuhan_khusus,
            lintang: parsed.data!.lintang,
            bujur: parsed.data!.bujur,
            created_at: new Date().toISOString()
         }) 
         successCount++ 
      })

      const totalCreated = await SiswaRepository.createManySiswa(rows)

      // logger.debug(`${JSON.stringify(rows)}`)
      logger.info(`${rows} of ${totalCreated} siswa datas created`)

      return {
         successCount,
         failCount: failedRows.length,
         failedRows
      }
   }

   private static setErrorField<T> (
      map: Map<string, T>,
      key: string,
      messages: string[],
      errorMessage: string
   ): T | undefined {
      const value = map.get(key)
      if (!value) {
         messages.push(errorMessage)
      }
      return value
   }

   static async updateSiswa(
      id: number,
      data: SiswaDTO
   ): Promise<SiswaResponse> {
      const updated_at: string = new Date().toISOString();
      const siswa = await SiswaRepository.updateSiswaById(id, data, updated_at);
      if (!siswa) {
         throw new AppError(`Siswa with ID ${id} not found`, 400);
      }
      const response: SiswaResponse = {
         siswa_id: siswa.siswa_id,
         nama: siswa.nama,
      };
      return response;
   }

   static async getAllSiswaWithPagination(
      page: number,
      limit: number,
      sekolahId: number,
      filters: any
   ): Promise<{
      response: GetAllSiswaResponse[];
      limit: number;
      total: number;
   }> {
      const skip = (page - 1) * limit;
      const where: any = {}

      where.sekolah_asal_id = sekolahId

      if(filters.nama?.value && filters.nisn?.value) {
         where.nama = { contains: filters.nama.value }
         where.nisn = { contains: filters.nisn.value }
      }
      if(filters.nama?.value) {
         where.nama = { contains: filters.nama.value }
      }
      if(filters.nisn?.value) {
         where.nisn = { contains: filters.nisn.value }
      }
      // await SiswaRepository.testQuery()
      const siswas = await SiswaRepository.findAllSiswa(skip, limit, where);
      const total: number = await SiswaRepository.countAllSiswaBySekolah(
         where
      );
      let response: GetAllSiswaResponse[] = [];
      siswas.forEach((siswa) => {
         response.push({
            siswa_id: siswa.siswa_id,
            nama: siswa.nama,
            nisn: siswa.nisn,
         });
      });
      return { response, limit, total };
   }

   static async getSiswaById(siswaId: number): Promise<SiswaDTO> {
      const siswa = await SiswaRepository.getSiswaById(siswaId);

      if (!siswa) {
         throw new AppError(`Siswa with ID ${siswaId} not found`, 404);
      }

      const response: SiswaDTO = {
         siswa_id: siswa.siswa_id,
         user_id: siswa.user_id,
         banjar_id: siswa.banjar_id,
         desa_id: siswa.desa_id,
         kecamatan_id: siswa.kecamatan_id,
         kabupaten_id: siswa.kabupaten_id,
         provinsi_id: siswa.provinsi_id,
         sekolah_asal_id: siswa.sekolah_asal_id,
         nama: siswa.nama,
         tempat_lahir: siswa.tempat_lahir,
         tanggal_lahir: siswa.tanggal_lahir.toISOString(),
         jenis_kelamin: siswa.jenis_kelamin,
         nomor_telepon: siswa.nomor_telepon,
         agama_id: siswa.agama_id,
         nik: siswa.nik,
         nisn: siswa.nisn,
         alamat_tinggal: siswa.alamat_tinggal,
         alamat_kk: siswa.alamat_kk,
         isluartabanan: siswa.isluartabanan,
         nama_ibu: siswa.nama_ibu,
         pekerjaan_ibu_id: siswa.pekerjaan_ibu_id,
         penghasilan_ibu_id: siswa.penghasilan_ibu_id,
         nama_ayah: siswa.nama_ayah,
         pekerjaan_ayah_id: siswa.pekerjaan_ayah_id,
         penghasilan_ayah_id: siswa.penghasilan_ayah_id,
         nama_wali: siswa.nama_wali,
         pekerjaan_wali_id: siswa.pekerjaan_wali_id,
         penghasilan_wali_id: siswa.penghasilan_wali_id,
         kebutuhan_khusus: siswa.kebutuhan_khusus,
         lintang: siswa.lintang,
         bujur: siswa.bujur,
      };
      return response;
   }

   static async getSiswaStatusBySiswaId(siswaId: number, periodeJalurId: number) {
      const siswa = await SiswaRepository.findSiswaStatusById(siswaId)

      if (!siswa) {
         throw new AppError("Siswa not found", 404)
      }

      const response = {
         siswa_id: siswa.siswa_id,
         isWilayahFull: siswa.provinsi_id 
            && siswa.kabupaten_id 
            && siswa.kecamatan_id 
            && siswa.desa_id 
            && siswa.banjar_id 
            ? true 
            : false,
         isDokumenFull: siswa.dokumen_siswas.length === 4 ? true : false,
         isDokumenValid: siswa.dokumen_siswas.length === 4 
            && siswa.dokumen_siswas.every((d) => d.status !== 'BELUM_VALID')
            ? true
            : false,
         isTerdaftar: siswa.pendaftaran.some((p) => p.periode_jalur_id === periodeJalurId),
         banjar_id: siswa.banjar_id,
         tanggal_lahir: siswa.tanggal_lahir.toISOString(),
         lintang: siswa.lintang,
         bujur: siswa.bujur
      }

      return response
   }

   // static async getSiswaNotInPendaftaranV1(
   //    sekolahId: number,
   //    periodeJalurId: number,
   //    page: number,
   //    limit: number,
   //    // filters: any
   // ): Promise<{
   //    // siswaBelumDaftar: GetAllSiswaResponse[];
   //    // siswaDibatalkan: GetAllSiswaResponse[];
   //    siswaBelumTerdaftar: GetAllSiswaPendaftaran[];
   //    total: number;
   // }> {
   //    const skip = (page - 1) * limit;
   //    const conditions: any = []
   //    const whereClause = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : ""

   //    const total: number =
   //       await SiswaRepository.countAllSiswaNotInPendaftaranAndDibatalkan(
   //          sekolahId
   //       );

   //    const siswas =
   //       await SiswaRepository.findAllSiswaNotInPendaftaranAndDibatalkan(
   //          sekolahId, skip, limit
   //       );

   //    const siswaBelumTerdaftar: GetAllSiswaPendaftaran[] = siswas.map((siswa) => ({
   //       siswa_id: siswa.siswa_id,
   //       pendaftaran_id: 1,
   //       nama: siswa.nama,
   //       nisn: siswa.nisn,
   //       banjar_id: siswa.banjar_id,
   //       lintang: siswa.lintang,
   //       bujur: siswa.bujur,
   //       isWilayahFull: siswa.provinsi_id && siswa.kabupaten_id && siswa.kecamatan_id && siswa.desa_id && siswa.banjar_id ? true : false,
   //       isDokumenFull: siswa.dokumen_siswas.length === 4 ? true : false,
   //       isAllDokumenValid: false,
   //       statusDaftar: siswa.pendaftaran &&
   //       siswa.pendaftaran.status === "DIBATALKAN" &&
   //       siswa.pendaftaran.periode_jalur_id === periodeJalurId ? "DIBATALKAN" : "BELUM TERDAFTAR"
   //    }))
   //    // const siswaBelumDaftar: GetAllSiswaResponse[] = siswas
   //    //    .filter((siswa) => siswa.pendaftaran === null)
   //    //    .map((siswa) => ({
   //    //       siswa_id: siswa.siswa_id,
   //    //       nama: siswa.nama,
   //    //       nisn: siswa.nisn,
   //    //    }));

   //    // const siswaDibatalkan: GetAllSiswaResponse[] = siswas
   //    //    .filter(
   //    //       (siswa) =>
   //    //          siswa.pendaftaran &&
   //    //          siswa.pendaftaran.status === "DIBATALKAN" &&
   //    //          siswa.pendaftaran.periode_jalur_id === periodeJalurId
   //    //    )
   //    //    .map((siswa) => ({
   //    //       siswa_id: siswa.siswa_id,
   //    //       nama: siswa.nama,
   //    //       nisn: siswa.nisn,
   //    //    }));

   //    // return { siswaBelumDaftar, siswaDibatalkan, total };
   //    return { siswaBelumTerdaftar, total}
   // }

   static async getSiswaNotInPendaftaran(
      sekolahId: number,
      periodeJalurId: number,
      page: number,
      limit: number,
      filters: any
   ) {
      console.log(filters)
      const skip = (page - 1) * limit;
      const conditions: string[] = []
      // filters.isWilayahFull?.value ? console.log("wilayah full") : console.log("wilayah gak full")
      // conditions.push(`s.sekolah_asal_id = ${sekolahId}`)

      if(filters.nama?.value) {
         conditions.push(`s.nama LIKE '%${filters.nama.value}%'`)
      }

      if(filters.nisn?.value) {
         conditions.push(`s.nisn LIKE '%${filters.nisn.value}%'`)
      }

      if(filters.isDokumenFull?.value !== null) {
         if(filters.isDokumenFull.value) {
            conditions.push("COALESCE(ds.dokumen_count, 0) = 4")
         }else {
            conditions.push("COALESCE(ds.dokumen_count, 0) < 4")
         }
      }

      if(filters.isWilayahFull?.value !== null) {
         if(filters.isWilayahFull.value) {
            // console.log("hello di if")
            conditions.push(`
              (s.provinsi_id IS NOT NULL AND 
               s.kabupaten_id IS NOT NULL AND 
               s.kecamatan_id IS NOT NULL AND 
               s.desa_id IS NOT NULL AND 
               s.banjar_id IS NOT NULL)
            `)
         }else {
            // console.log("hello di else")
            conditions.push(`
              (s.provinsi_id IS NULL OR 
               s.kabupaten_id IS NULL OR 
               s.kecamatan_id IS NULL OR 
               s.desa_id IS NULL OR 
               s.banjar_id IS NULL)
            `)
         }
      }
      if (filters.statusDaftar?.value === true) {
         conditions.push(`(p.status = 'DIBATALKAN' AND COALESCE(p.periode_jalur_id, 0) = ${periodeJalurId})`)
      } else if (filters.statusDaftar?.value === false) {
         conditions.push(`(p.siswa_id IS NULL)`)
      } else {
         conditions.push(`((p.status = 'DIBATALKAN' AND COALESCE(p.periode_jalur_id, 0) = ${periodeJalurId}) 
            OR (p.siswa_id IS NULL))`)
         // conditions.push(`(p.siswa_id IS NULL)`)
      }
      // console.log(conditions)
      if (filters.statusDokumen.value !== null) {
         
         if (filters.statusDokumen.value) {
            // ? havingConditions.push(`(dokumen_count = 4 AND dokumen_count = valid_count)`)
            // : havingConditions.push(`(belum_valid_count > 0)`)
            conditions.push(`(COALESCE(ds.dokumen_count, 0) = 4 AND ds.valid_count = 4)`)
            // ? conditions.push(`isAllDokumenValid = true`)
            // : conditions.push(`isAllDokumenValid = false`)
         } else {
            conditions.push(`(COALESCE(ds.dokumen_count, 0) > 0 AND ds.belum_valid_count > 0)`)
         }
         
      }
      const whereClause = conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : ""
      // const havingClause = havingConditions.length > 0 ? `HAVING ${havingConditions.join(" AND ")}` : ""
      console.log(whereClause)
      // console.log(havingClause)
      const siswas = await SiswaRepository.GetSiswaNotInPendaftaranAndDibatalkanRaw(sekolahId, limit, skip, whereClause)
      // console.log(siswas)
      const totalSiswa = await SiswaRepository.CountSiswaNotInPendaftaranAndDibatalkanRaw(sekolahId, whereClause)
      
      const result: GetSiswaNotInPendaftaranAndDibatalkan[] = JSON.parse(JSON.stringify(siswas, (key, value) =>
         typeof value === "bigint" ? Number(value) : value
       ));
      // console.log(totalSiswa)
      const total = Number(totalSiswa[0].total)
      // console.log(result)

      const siswaBelumTerdaftar: GetAllSiswaPendaftaran[] = result.map((siswa) => ({
         siswa_id: siswa.siswa_id,
         pendaftaran_id: siswa.pendaftaran.pendaftaran_id ? siswa.pendaftaran.pendaftaran_id : null,
         nama: siswa.nama,
         nisn: siswa.nisn,
         banjar_id: siswa.banjar_id,
         tanggal_lahir: siswa.tanggal_lahir,
         lintang: siswa.lintang,
         bujur: siswa.bujur,
         isWilayahFull: siswa.provinsi_id && siswa.kabupaten_id && siswa.kecamatan_id && siswa.desa_id && siswa.banjar_id ? true : false,
         isDokumenFull: siswa.dokumen_siswas_count < 4 ? false : true,
         isAllDokumenValid: siswa.isAllDokumenValid,
         totalDokumenValid: Number(siswa.totalDokumenValid),
         statusDaftar: siswa.pendaftaran.status ? siswa.pendaftaran.status : 'BELUM_TERDAFTAR'
      }))
      return {siswaBelumTerdaftar, total} 
   }

   static async countAllSiswaBySekolahId(sekolahId: number) {
      const whereClause = {
         sekolah_asal_id: sekolahId
      }

      return await SiswaRepository.countAllSiswaBySekolah(whereClause)
   }

   static async deleteSiswaById(siswaId: number) {
      return await SiswaRepository.deleteSiswaById(siswaId)
   }

   // agama
   static async createAgama(namaAgama: string): Promise<{
      agama_id: number;
   }> {
      const created_at = new Date().toISOString();
      const newAgama = await SiswaRepository.createAgama(
         namaAgama,
         created_at
      );
      return newAgama;
   }

   static async getAllAgama(): Promise<
      {
         agama_id: number;
         nama_agama: string;
      }[]
   > {
      return await SiswaRepository.findAllAgama();
   }

   static async updateAgamaById(
      agama_id: number,
      namaAgama: string
   ): Promise<{
      agama_id: number;
   }> {
      const update_at = new Date().toISOString();
      return await SiswaRepository.updateAgamaById(
         agama_id,
         namaAgama,
         update_at
      );
   }

   static async deleteAgamaById(agama_id: number): Promise<{
      agama_id: number;
   }> {
      return await SiswaRepository.deleteAgamaById(agama_id);
   }

   // pekerjaan
   static async createPekerjaan(namaPekerjaan: string): Promise<{
      pekerjaan_id: number;
      nama_pekerjaan: string;
   }> {
      const create_at = new Date().toISOString();
      const newPekerjaan = await SiswaRepository.createPekerjaan(
         namaPekerjaan,
         create_at
      );
      return newPekerjaan;
   }

   static async getAllPekerjaan(): Promise<
      {
         pekerjaan_id: number;
         nama_pekerjaan: string;
      }[]
   > {
      return await SiswaRepository.findAllPekerjaan();
   }

   static async updatePekerjaanById(
      pekerjaan_id: number,
      namaPekerjaan: string
   ): Promise<{
      pekerjaan_id: number;
   }> {
      const update_at = new Date().toISOString();
      return await SiswaRepository.updatePekerjaanById(
         pekerjaan_id,
         namaPekerjaan,
         update_at
      );
   }

   static async deletePekerjaanById(pekerjaan_id: number) {
      return await SiswaRepository.deletePekerjaanById(pekerjaan_id);
   }

   // penghasilan
   static async getAllPenghasilan(): Promise<
      {
         penghasilan: string | null;
         penghasilan_id: number;
      }[]
   > {
      return await SiswaRepository.findAllPenghasilan();
   }
}
