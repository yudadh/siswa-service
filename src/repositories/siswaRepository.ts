import { Siswa } from "@prisma/client";
import { prisma } from "../utils/database";
import { Prisma } from "@prisma/client";
import { SiswaDTO, GetSiswaNotInPendaftaranAndDibatalkan } from "../interfaces/siswaInterface";

export class SiswaRepository {

   static async createManySiswa(data: Prisma.SiswaCreateInput[]) {
      return prisma.siswa.createMany({
         data: data
      })
   }

   static async updateSiswaById(
      id: number,
      data: SiswaDTO,
      updated_at: string
   ) {
      return prisma.siswa.update({
         where: { siswa_id: id },
         data: {
            banjar_id: data.banjar_id,
            desa_id: data.desa_id,
            kecamatan_id: data.kecamatan_id,
            kabupaten_id: data.kabupaten_id,
            provinsi_id: data.provinsi_id,
            sekolah_asal_id: data.sekolah_asal_id,
            nama: data.nama,
            tempat_lahir: data.tempat_lahir,
            tanggal_lahir: new Date(data.tanggal_lahir),
            jenis_kelamin: data.jenis_kelamin,
            nomor_telepon: data.nomor_telepon,
            agama_id: data.agama_id,
            nik: data.nik,
            nisn: data.nisn,
            alamat_tinggal: data.alamat_tinggal,
            alamat_kk: data.alamat_kk,
            isluartabanan: data.isluartabanan,
            nama_ibu: data.nama_ibu,
            pekerjaan_ibu_id: data.pekerjaan_ibu_id,
            penghasilan_ibu_id: data.penghasilan_ibu_id,
            nama_ayah: data.nama_ayah,
            pekerjaan_ayah_id: data.pekerjaan_ayah_id,
            penghasilan_ayah_id: data.penghasilan_ayah_id,
            nama_wali: data.nama_wali,
            pekerjaan_wali_id: data.pekerjaan_wali_id,
            penghasilan_wali_id: data.penghasilan_wali_id,
            kebutuhan_khusus: data.kebutuhan_khusus,
            lintang: data.lintang,
            bujur: data.bujur,
            updated_at: updated_at
         },
         select: {
            siswa_id: true,
            nama: true,
         },
      });
   }

   static async findAllSiswa(
      skip: number,
      limit: number,
      where: any
   ): Promise<
      {
         siswa_id: number;
         nama: string;
         nisn: string;
      }[]
   > {
      return prisma.siswa.findMany({
         skip: skip,
         take: limit,
         where: where,
         select: {
            siswa_id: true,
            nama: true,
            nisn: true,
         },
      });
   }

   static async countAllSiswaBySekolah (where: any) {
      return prisma.siswa.count({
         where: where
      })
   }

   static async getSiswaById(siswaId: number): Promise<Siswa | null> {
      return prisma.siswa.findUnique({
         where: { siswa_id: siswaId },
      });
   }

   static async findSiswaStatusById(siswaId: number) {
      return prisma.siswa.findUnique({
         where: { siswa_id: siswaId },
         select: {
            siswa_id: true,
            provinsi_id: true,
            kabupaten_id: true,
            kecamatan_id: true,
            desa_id: true,
            banjar_id: true,
            tanggal_lahir: true,
            lintang: true,
            bujur: true,
            dokumen_siswas: {
               select: {
                  status: true
               }
            },
            pendaftaran: {
               select: {
                  pendaftaran_id: true,
                  periode_jalur_id: true
               }
            }
            
         }
      })
   }

   static async findSiwaNotInPendaftaran(sekolahId: number, periodeJalurId: number, skip: number, limit: number) {
      return prisma.siswa.findMany({
         skip: skip,
         take: limit,
         where: { 
            sekolah_asal_id: sekolahId,
            NOT: {
               siswa_id: {
                  in: ((await prisma.pendaftaran.findMany({
                     where: { periode_jalur_id: periodeJalurId },
                     select: { siswa_id: true }
                  })
               ).map((pendaftaran) => pendaftaran.siswa_id))
               }
            }
         },
         select: {
            siswa_id: true,
            nama: true,
            nisn: true,
            banjar_id: true,
            lintang: true,
            bujur: true
         }
      })
   }

   static async countSiwaNotInPendaftaran(sekolahId: number, periodeJalurId: number) {
      return prisma.siswa.count({
         where: { 
            sekolah_asal_id: sekolahId,
            NOT: {
               siswa_id: {
                  in: ((await prisma.pendaftaran.findMany({
                     where: { periode_jalur_id: periodeJalurId },
                     select: { siswa_id: true }
                  })
               ).map((pendaftaran) => pendaftaran.siswa_id))
               }
            }
         },
      })
   }

   static async findAllSiswaNotInPendaftaranAndDibatalkan(sekolahId: number, skip: number, limit: number) {
      return prisma.siswa.findMany({
         skip: skip,
         take: limit,
         where: {
            sekolah_asal_id: sekolahId,
         },
         select: {
            siswa_id: true,
            nama: true,
            nisn: true,
            provinsi_id: true,
            kabupaten_id: true,
            kecamatan_id: true,
            desa_id: true,
            banjar_id: true,
            lintang: true,
            bujur: true,
            dokumen_siswas: {
               select: {
                  dokumen_id: true
               }
            },
            pendaftaran: {
               select: {
                  status: true,
                  periode_jalur_id: true
               }
            }
         }
      })
   }
   
   // static async countAllSiswaNotInPendaftaranAndDibatalkan(sekolahId: number) {
   //    return prisma.siswa.count({
   //       where: {
   //          sekolah_asal_id: sekolahId,
   //          OR: [
   //             { pendaftaran: null }, // Siswa belum daftar
   //             { pendaftaran: { status: "DIBATALKAN" } } // Siswa dibatalkan
   //          ],
   //       }
   //    })
   // }

   // static async testQuery() {

   //    const searchQuery = `made`;
   //    // const data = await prisma.siswa.findMany({
   //    //    // skip: skip,
   //    //    // take: limit,
   //    //    where: where,
   //    //    select: {
   //    //       siswa_id: true,
   //    //       nama: true,
   //    //       nisn: true,
   //    //    },
   //    // });
   //    // const data = await prisma.$queryRaw`
   //    //   SELECT siswa_id, nama, nisn
   //    //   FROM m_siswas
   //    //   WHERE sekolah_asal_id = 114 AND nama LIKE ${searchQuery}
   //    //   ORDER BY siswa_id ASC
   //    //   LIMIT 10 OFFSET 0;
   //    //  `
   //     console.log(data)
   // }

   static async GetSiswaNotInPendaftaranAndDibatalkanRaw(sekolahId: number, limit: number, skip: number, whereClause: any) {
      return prisma.$queryRaw<GetSiswaNotInPendaftaranAndDibatalkan[]>`
         SELECT 
         s.siswa_id, 
         s.nama, 
         s.nisn, 
         s.provinsi_id, 
         s.kabupaten_id, 
         s.kecamatan_id, 
         s.desa_id, 
         s.banjar_id,
         s.tanggal_lahir,
         s.lintang,
         s.bujur, 
         -- CAST(s.lintang as CHAR) as lintang, 
         -- CAST(s.bujur as CHAR) as bujur,
         COALESCE(ds.dokumen_count, 0) as dokumen_siswas_count,
         COALESCE(ds.valid_count, 0) as totalDokumenValid,
         -- ds.dokumen_count as dokumen_siswas_count,
         JSON_OBJECT(
            'pendaftaran_id', p.pendaftaran_id,
            'status', p.status,
            'periode_jalur_id', p.periode_jalur_id
         ) AS pendaftaran,
         CASE 
            WHEN ds.dokumen_count = ds.valid_count AND ds.dokumen_count = 4 THEN true
            ELSE false
         END AS isAllDokumenValid
         FROM m_siswas s
         LEFT JOIN (
           SELECT siswa_id, 
           COUNT(*) AS dokumen_count,
           SUM(CASE WHEN status = 'VALID_SD' THEN 1 ELSE 0 END) AS valid_count,
           SUM(CASE WHEN status = 'BELUM_VALID' THEN 1 ELSE 0 END) AS belum_valid_count
           FROM dokumen_siswa ds
           GROUP BY siswa_id
         ) ds ON s.siswa_id = ds.siswa_id
         LEFT JOIN m_pendaftaran p ON p.siswa_id = s.siswa_id
         WHERE s.sekolah_asal_id = ${sekolahId}
         ${Prisma.raw(whereClause)}
         LIMIT ${limit} OFFSET ${skip};`
   }

   static async CountSiswaNotInPendaftaranAndDibatalkanRaw(sekolahId: number, whereClause: any) {
      return prisma.$queryRaw<[{total: number}]>`
         SELECT 
         CAST(COUNT(*) as CHAR) as total
         FROM m_siswas s
         LEFT JOIN (
           SELECT siswa_id, COUNT(*) AS dokumen_count,
           SUM(CASE WHEN status = 'VALID_SD' THEN 1 ELSE 0 END) AS valid_count,
           SUM(CASE WHEN status = 'BELUM_VALID' THEN 1 ELSE 0 END) AS belum_valid_count
           FROM dokumen_siswa ds
           GROUP BY siswa_id
         ) ds ON s.siswa_id = ds.siswa_id
         LEFT JOIN m_pendaftaran p ON p.siswa_id = s.siswa_id
         WHERE s.sekolah_asal_id = ${sekolahId}
         ${Prisma.raw(whereClause)};`
   }

   static async deleteSiswaById(siswaId: number) {
      return prisma.siswa.delete({
         where: { siswa_id: siswaId },
         select: {
            siswa_id: true
         }
      })
   }

   static async findAllSekolahSD() {
      return prisma.sekolah.findMany({
         where: { jenjang_sekolah_id: 2 }
      })
   }

   static async findAllWilayahBali() {
      return prisma.banjar.findMany({
         where: {
            desa: {
               kecamatan: {
                  kabupaten: {
                     provinsi: {
                        provinsi_id: 1
                     }
                  }
               }
            }
         },
         select: {
            banjar_id: true,
            banjar_nama: true,
            desa: {
               select: {
                  desa_id: true,
                  desa_nama: true,
                  kecamatan: {
                     select: {
                        kecamatan_id: true,
                        kecamatan_nama: true,
                        kabupaten: {
                           select: {
                              kabupaten_id: true,
                              kabupaten_nama: true,
                              provinsi: {
                                 select: {
                                    provinsi_id: true,
                                    provinsi_nama: true
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      })
   }

   // agama
   static async createAgama(namaAgama: string, create_at: string) {
      return await prisma.agama.create({
         data: {
            nama_agama: namaAgama,
            created_at: create_at,
         },
         select: {
            agama_id: true,
         },
      });
   }

   static async findAllAgama() {
      return prisma.agama.findMany({
         select: {
            agama_id: true,
            nama_agama: true,
         },
      });
   }

   static async updateAgamaById(
      agama_id: number,
      namaAgama: string,
      update_at: string
   ) {
      return prisma.agama.update({
         where: { agama_id: agama_id },
         data: {
            nama_agama: namaAgama,
            updated_at: update_at,
         },
         select: {
            agama_id: true,
         },
      });
   }

   static async deleteAgamaById(agama_id: number) {
      return prisma.agama.delete({
         where: { agama_id: agama_id },
         select: { agama_id: true },
      });
   }

   // pekerjaan
   static async createPekerjaan(namaPekerjaan: string, create_at: string) {
      return await prisma.pekerjaan.create({
         data: {
            nama_pekerjaan: namaPekerjaan,
            created_at: create_at,
         },
         select: {
            pekerjaan_id: true,
            nama_pekerjaan: true,
         },
      });
   }

   static async findAllPekerjaan() {
      return prisma.pekerjaan.findMany({
         select: {
            pekerjaan_id: true,
            nama_pekerjaan: true,
         },
      });
   }

   static async updatePekerjaanById(
      pekerjaan_id: number,
      namaPekerjaan: string,
      update_at: string
   ) {
      return prisma.pekerjaan.update({
         where: { pekerjaan_id: pekerjaan_id },
         data: {
            nama_pekerjaan: namaPekerjaan,
            updated_at: update_at,
         },
         select: {
            pekerjaan_id: true,
         },
      });
   }

   static async deletePekerjaanById(pekerjaan_id: number) {
      return prisma.pekerjaan.delete({
         where: { pekerjaan_id: pekerjaan_id },
         select: {
            pekerjaan_id: true,
         },
      });
   }

   // penghasilan
   static async findAllPenghasilan() {
      return prisma.penghasilan.findMany({
         select: {
            penghasilan_id: true,
            penghasilan: true
         }
      })
   }


}


