'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createApp } = require('../src/server');

let server;
let baseUrl;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET /api/tasks mengembalikan daftar tugas dan status 200', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.equal(body.meta.count, body.data.length);
});

test('POST /api/tasks membuat tugas dan status 201', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Mendokumentasikan API contract',
      completed: false,
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(response.headers.get('location'), `/api/tasks/${body.data.id}`);
  assert.equal(body.success, true);
  assert.equal(body.data.title, 'Mendokumentasikan API contract');
});

test('GET /api/tasks/999 mengembalikan error 404 yang konsisten', async () => {
  const response = await fetch(`${baseUrl}/api/tasks/999`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'TASK_NOT_FOUND');
});

test('POST /api/tasks menolak data tidak valid dengan status 422', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.title);
});

test('POST /api/tasks menolak media type selain JSON dengan status 415', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: 'judul tugas',
  });
  const body = await response.json();

  assert.equal(response.status, 415);
  assert.equal(body.error.code, 'UNSUPPORTED_MEDIA_TYPE');
});
