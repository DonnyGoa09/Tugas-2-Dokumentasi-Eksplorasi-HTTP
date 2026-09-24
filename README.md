# Tugas 2 — Dokumentasi Eksplorasi HTTP

Project ini berisi REST API sederhana untuk menerapkan HTTP, REST, JSON, status
code, automated test, dan pengujian Postman. Implementasi memakai modul HTTP
bawaan Node.js sehingga tidak membutuhkan package pihak ketiga.

## Menjalankan project

Persyaratan: Node.js 18 atau lebih baru.

```bash
node src/server.js
```

API tersedia di `http://127.0.0.1:3000`.

## Menjalankan test

```bash
node --test
```

Jika `npm` tersedia, perintah ekuivalennya adalah `npm start` dan `npm test`.

## Postman

Import file
[`postman/Tugas-2-HTTP.postman_collection.json`](postman/Tugas-2-HTTP.postman_collection.json),
jalankan server, lalu pilih **Run collection**. Collection menggunakan variable
`base_url` dengan nilai awal `http://127.0.0.1:3000` dan tidak memuat credential.

Dokumentasi tugas dan API contract tersedia di
[`docs/minggu-2.md`](docs/minggu-2.md).

Screenshot pengujian Postman untuk response `200` dan `422` juga disertakan di
folder [`docs/images`](docs/images).
