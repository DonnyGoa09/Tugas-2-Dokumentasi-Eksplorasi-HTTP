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

- [Node.js HTTP documentation](https://nodejs.org/api/http.html)
- [MDN HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [Postman: Write scripts to test API response data](https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/)
- [Postman: Test your API using the Collection Runner](https://learning.postman.com/docs/tests-and-scripts/running-collections/intro-to-collection-runs/)

Referensi diakses pada 24 September 2026.

## 8. Deklarasi penggunaan AI

AI digunakan sebagai alat bantu untuk menyusun struktur implementasi, meninjau
konsistensi API contract, membuat skenario pengujian, dan merapikan dokumentasi.
Seluruh kode, request Postman, response, dan hasil test tetap diperiksa serta
dapat dijalankan ulang oleh mahasiswa. Tidak ada API key, token, password,
cookie, atau secret yang dimasukkan ke repository.
