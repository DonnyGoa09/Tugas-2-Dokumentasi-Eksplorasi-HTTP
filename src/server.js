'use strict';

const http = require('node:http');

const initialTasks = [
  {
    id: 1,
    title: 'Mempelajari dasar HTTP',
    completed: true,
  },
  {
    id: 2,
    title: 'Menguji API dengan Postman',
    completed: false,
  },
];

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  response.end(body);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        const error = new Error('Request body terlalu besar.');
        error.code = 'BODY_TOO_LARGE';
        reject(error);
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        const error = new Error('Body harus berupa JSON yang valid.');
        error.code = 'INVALID_JSON';
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function validateTask(payload) {
  const details = {};

  if (typeof payload.title !== 'string' || payload.title.trim().length < 3) {
    details.title = 'Title wajib berupa teks minimal 3 karakter.';
  }
  if (
    Object.hasOwn(payload, 'completed') &&
    typeof payload.completed !== 'boolean'
  ) {
    details.completed = 'Completed harus berupa boolean.';
  }

  return details;
}

function createApp() {
  const tasks = initialTasks.map((task) => ({ ...task }));
  let nextId = Math.max(...tasks.map((task) => task.id)) + 1;

  return http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, 'http://localhost');
    const { pathname } = requestUrl;

    if (request.method === 'GET' && pathname === '/api/tasks') {
      sendJson(response, 200, {
        success: true,
        data: tasks,
        meta: { count: tasks.length },
      });
      return;
    }

    const taskRoute = pathname.match(/^\/api\/tasks\/(\d+)$/);
    if (request.method === 'GET' && taskRoute) {
      const id = Number(taskRoute[1]);
      const task = tasks.find((item) => item.id === id);

      if (!task) {
        sendJson(response, 404, {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: `Tugas dengan id ${id} tidak ditemukan.`,
          },
        });
        return;
      }

      sendJson(response, 200, { success: true, data: task });
      return;
    }

    if (request.method === 'POST' && pathname === '/api/tasks') {
      if (!request.headers['content-type']?.includes('application/json')) {
        sendJson(response, 415, {
          success: false,
          error: {
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Gunakan Content-Type: application/json.',
          },
        });
        return;
      }

      let payload;
      try {
        payload = await readJsonBody(request);
      } catch (error) {
        if (error.code === 'BODY_TOO_LARGE') {
          if (!response.headersSent) {
            sendJson(response, 413, {
              success: false,
              error: { code: error.code, message: error.message },
            });
          }
          return;
        }

        sendJson(response, 400, {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Body harus berupa JSON yang valid.',
          },
        });
        return;
      }

      const validationErrors = validateTask(payload);
      if (Object.keys(validationErrors).length > 0) {
        sendJson(response, 422, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data yang dikirim tidak valid.',
            details: validationErrors,
          },
        });
        return;
      }

      const task = {
        id: nextId,
        title: payload.title.trim(),
        completed: payload.completed ?? false,
      };
      nextId += 1;
      tasks.push(task);

      sendJson(
        response,
        201,
        {
          success: true,
          message: 'Tugas berhasil dibuat.',
          data: task,
        },
        { Location: `/api/tasks/${task.id}` },
      );
      return;
    }

    sendJson(response, 404, {
      success: false,
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: 'Endpoint tidak ditemukan.',
      },
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = createApp();

  server.listen(port, '127.0.0.1', () => {
    console.log(`API berjalan di http://127.0.0.1:${port}`);
  });
}

module.exports = { createApp };
