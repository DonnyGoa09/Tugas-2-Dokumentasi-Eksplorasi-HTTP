# Minggu 2 — Dokumentasi Eksplorasi HTTP

## 1. Tujuan

Pengerjaan ini bertujuan menerapkan konsep HTTP, REST, JSON, status code, dan
Postman pada sebuah REST API sederhana. Hasilnya harus dapat dijalankan ulang,
dibandingkan dengan API contract, dan memperlihatkan response sukses maupun
response error tanpa menyimpan credential atau secret.

## 2. Perubahan

- Membuat HTTP server dengan modul `node:http` tanpa dependency eksternal.
- Membuat resource REST `tasks` dengan operasi membaca dan menambah data.
- Menyeragamkan response sukses dan error dalam format JSON.
- Menggunakan status code `200`, `201`, `400`, `404`, `413`, `415`, dan `422`
  sesuai hasil pemrosesan request.
- Menambahkan validasi input untuk `title` dan `completed`.
- Menambahkan automated test berbasis `node:test`.
- Menambahkan Postman collection dengan request, assertion, variable
  `base_url`, dan contoh response.

Keputusan utama yang diambil adalah menggunakan kata benda jamak `/api/tasks`
sebagai resource, membedakan HTTP method untuk membaca (`GET`) dan membuat
(`POST`), serta mempertahankan bentuk envelope response yang konsisten. Dengan
demikian, method, URL, status code, header, dan body implementasi dapat langsung
dicocokkan dengan contract berikut.

## 3. Endpoint atau API contract

Base URL lokal: `http://127.0.0.1:3000`

| Method | Endpoint | Request body | Response utama |
| --- | --- | --- | --- |
| `GET` | `/api/tasks` | Tidak ada | `200 OK`, daftar task |
| `GET` | `/api/tasks/{id}` | Tidak ada | `200 OK` atau `404 Not Found` |
| `POST` | `/api/tasks` | JSON: `title` wajib, `completed` opsional | `201 Created` atau `422 Unprocessable Content` |

### Contract field

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | number | Dibuat server, unik selama server berjalan |
| `title` | string | Wajib, setelah trim minimal 3 karakter |
| `completed` | boolean | Opsional; default `false` |

Semua response memakai header `Content-Type: application/json; charset=utf-8`.
Response sukses memakai `success: true` dan data pada properti `data`. Response
error memakai `success: false` dan objek `error` yang minimal berisi `code` dan
`message`. Penyimpanan masih berada di memori, sehingga data tambahan akan
kembali ke kondisi awal ketika server dimulai ulang.

## 4. Bukti pengujian

Jalankan:

```bash
node --test
```

Hasil verifikasi pada 24 September 2026:

```text
tests 5
pass 5
fail 0
```

Pengujian manual juga dijalankan melalui Postman Web menggunakan Postman
Desktop Agent agar request dapat mencapai server lokal. Collection yang dipakai
adalah `postman/Tugas-2-HTTP.postman_collection.json` dengan variable
`base_url = http://127.0.0.1:3000`.

### Success response — mengambil daftar tugas

Request:

```http
GET /api/tasks HTTP/1.1
Host: 127.0.0.1:3000
Accept: application/json
```

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mempelajari dasar HTTP",
      "completed": true
    },
    {
      "id": 2,
      "title": "Menguji API dengan Postman",
      "completed": false
    }
  ],
  "meta": {
    "count": 2
  }
}
```

Bukti Postman berikut memperlihatkan method `GET`, URL `/api/tasks`, status
`200 OK`, waktu response, ukuran response, dan body JSON yang diterima.

![Bukti success response 200 di Postman](images/postman-success-200.png)

### Success response — membuat tugas

Request body:

```json
{
  "title": "Mendokumentasikan API contract",
  "completed": false
}
```

Status: `201 Created`. Response juga memberikan header
`Location: /api/tasks/3` agar client mengetahui URL resource baru.

```json
{
  "success": true,
  "message": "Tugas berhasil dibuat.",
  "data": {
    "id": 3,
    "title": "Mendokumentasikan API contract",
    "completed": false
  }
}
```

## 5. Error case

Error case utama mengirim `title` kosong ke `POST /api/tasks`.

Request body:

```json
{
  "title": ""
}
```

Status: `422 Unprocessable Content`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": {
      "title": "Title wajib berupa teks minimal 3 karakter."
    }
  }
}
```

Status `422` dipilih karena JSON dapat dibaca secara sintaksis, tetapi nilainya
tidak memenuhi aturan contract. Skenario error tambahan yang tersedia pada
automated test dan Postman collection adalah task yang tidak ada (`404`) serta
media type selain JSON (`415`).

Bukti Postman berikut memperlihatkan method `POST`, URL `/api/tasks`, status
`422 Unprocessable Entity`, dan body error `VALIDATION_ERROR`. Istilah status
yang ditampilkan UI Postman mengikuti label bawaan client, sedangkan nilai
status numeriknya tetap `422` sesuai API contract.

![Bukti error response 422 di Postman](images/postman-error-422.png)

## 6. Kesimpulan

Implementasi telah menunjukkan komunikasi HTTP berbasis resource, pertukaran
data JSON, penggunaan status code sesuai hasil request, response sukses dan
error yang konsisten, serta pengujian yang dapat diulang melalui automated test
dan Postman Collection Runner. API contract, implementasi, test, dan contoh
response menggunakan nama field serta status code yang sama.

## 7. Referensi

### Referensi utama kelas

- [Materi 1 — API dalam Sistem Modern](https://app.notion.com/p/Materi-1-API-dalam-Sistem-Modern-26c8bda175f98119acdef67232f637d0)
- [Praktikum 1 — Audit API dengan Postman](https://app.notion.com/p/Praktikum-1-Audit-API-dengan-Postman-26c8bda175f981a9a0e0c121c9355b32)
- [Tugas 1 — Audit API dan Ide Proyek Semester](https://app.notion.com/p/Tugas-1-Audit-API-dan-Ide-Proyek-Semester-3d78bda175f98117b123c21f376e893c)
- [Materi 2 — HTTP, REST, JSON, dan Status Code](https://app.notion.com/p/Materi-2-HTTP-REST-JSON-dan-Status-Code-26c8bda175f9806cba15c1f99e022acd)
- [Praktikum 2 — Eksplorasi HTTP dengan Postman](https://app.notion.com/p/Praktikum-2-Eksplorasi-HTTP-dengan-Postman-26c8bda175f980b7873ffe5830138835)
- [Tugas 2 — Dokumentasi Eksplorasi HTTP](https://app.notion.com/p/Tugas-2-Dokumentasi-Eksplorasi-HTTP-2738bda175f98090a791d1161e9769f0)

### Referensi teknis tambahan

- [Node.js HTTP documentation](https://nodejs.org/api/http.html)
- [MDN HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [Postman: Write scripts to test API response data](https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/)
- [Postman: Test your API using the Collection Runner](https://learning.postman.com/docs/tests-and-scripts/running-collections/intro-to-collection-runs/)

Referensi diakses pada 24 September 2026.

## 8. Deklarasi penggunaan AI

Saya menggunakan AI sebagai alat bantu untuk menyusun struktur implementasi,
meninjau konsistensi API contract, membuat skenario pengujian, dan merapikan
dokumentasi. Saya tetap memperhatikan materi dan praktikum yang diberikan,
memeriksa setiap saran atau hasil dari AI, serta membandingkannya dengan
referensi kelas dan dokumentasi teknis lainnya. Saya juga menjalankan sendiri
endpoint, automated test, dan Postman collection untuk memastikan success
response, error response, status code, dan body JSON sesuai dengan API
contract. Saya memahami hasil yang dikumpulkan dan bertanggung jawab atas isi
repository ini. Tidak ada API key, token, password, cookie, atau secret yang
dimasukkan ke repository.
