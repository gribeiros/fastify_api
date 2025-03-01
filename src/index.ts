import fastify from "fastify";
import fastifyEnv from "@fastify/env";
import { fastifyCors } from '@fastify/cors'
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

import envSchema from './schemas/env.schema.ts'
import loggerConfig from './config/logger.config.ts'
import prismaPlugin from './plugins/prisma.plugin.ts'
import userRoutes from './routes/user.route.ts'
import errorHandler from './config/errorHandler.config.ts'
import profileRoutes from "./routes/profile.route.ts";
import postRoutes from "./routes/post.route.ts";
import helathRoutes from "./routes/health.route.ts";

const server = fastify({ logger: loggerConfig }).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

await server.register(fastifyEnv, { dotenv: true, schema: envSchema, });

const PATH_API: string = server.config.PATH_API;

server.register(prismaPlugin);

server.register(fastifyCors, { origin: '*', })

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Fastify_API',
            version: '1.0.0'
        },
        servers: [{
            url: `/${PATH_API}`,
            description: 'Base path URL'
        }]
    },
    transform: jsonSchemaTransform
});

server.register(fastifySwaggerUi, { routePrefix: '/docs' })

server.setErrorHandler(errorHandler)

server.register(userRoutes, { prefix: `${PATH_API}/users` })
server.register(profileRoutes, { prefix: `${PATH_API}/profiles` })
server.register(postRoutes, { prefix: `${PATH_API}/post` })

server.register(helathRoutes)

server.listen({ port: server.config.PORT }, (error, address) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
    server.log.info(`Server documentation on: ${address}/docs`);
    server.log.info(`Server healthcheck on: ${address}/health`);
});
