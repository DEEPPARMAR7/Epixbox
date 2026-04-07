const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EpixBox API',
      version: '1.0.0',
      description: 'Core API documentation for EpixBox',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:4000/api/v1',
      },
      {
        url: 'http://localhost:4000/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            200: {
              description: 'Server health status',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'your-password' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Authenticated successfully' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/upload/photos': {
        post: {
          summary: 'Upload photos to a gallery',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    gallery_id: { type: 'string', example: 'gallery-uuid' },
                    photos: {
                      type: 'array',
                      items: { type: 'string', format: 'binary' },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Photos uploaded successfully' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/admin/analytics': {
        get: {
          summary: 'Get admin analytics overview',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Analytics payload' },
            403: { description: 'Insufficient permissions' },
          },
        },
      },
      '/admin/rate-analytics': {
        get: {
          summary: 'Get API rate analytics dashboard metrics',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Rate analytics payload' },
            403: { description: 'Insufficient permissions' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
