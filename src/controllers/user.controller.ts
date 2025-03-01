import { FastifyReply, FastifyRequest } from 'fastify';
import { createUpdateUserBodyType, createUpdateUserSchema } from '../schemas/user.shema.ts'
import { UserNotCreatedError, UserNotFoundError, UserNotUpdatedError, UserNotDeletedError } from '../error/user/userErrors.ts';
import { defaultIdParam, defaultIdParamType } from '../schemas/default.schema.ts';

export async function getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    const { prisma, log } = request.server;
    const users = await prisma.user.findMany().catch(e => {
        log.error(e)
        throw new e;
    })
    reply.status(200).send(users)
}

export async function getUserById(request: FastifyRequest<{ Params: defaultIdParamType }>, reply: FastifyReply) {
    const { prisma, log } = request.server;
    const { id } = defaultIdParam.parse(request.params);

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: parseInt(id)
        }
    }).catch(e => {
        log.error(e)
        throw new UserNotFoundError(e)
    })

    reply.status(200).send(user)
}

export async function createUser(request: FastifyRequest<{ Body: createUpdateUserBodyType }>, reply: FastifyReply) {
    const { prisma, log } = request.server;
    const { name, email } = createUpdateUserSchema.parse(request.body)

    await prisma.user.create({
        data: {
            name: name,
            email: email
        }
    }).catch(e => {
        log.error(e)
        throw new UserNotCreatedError(e)
    })

    reply.status(201).send({ message: 'User created' })
}

export async function updateUser(request: FastifyRequest<{ Params: defaultIdParamType, Body: createUpdateUserBodyType }>, reply: FastifyReply) {
    const { prisma, log } = request.server;
    const { name, email } = createUpdateUserSchema.parse(request.body)
    const { id } = defaultIdParam.parse(request.params);

    await prisma.user.update({
        where: {
            id: parseInt(id)
        },
        data: {
            name: name,
            email: email
        }
    }).catch(e => {
        log.error(e)
        throw new UserNotUpdatedError(e)
    })

    reply.status(200).send({ message: "User updated" })
}


export async function deleteUser(request: FastifyRequest<{ Params: defaultIdParamType }>, reply: FastifyReply) {
    const { prisma, log } = request.server;
    const { id } = defaultIdParam.parse(request.params)

    await prisma.user.delete({
        where: {
            id: parseInt(id)
        }
    }).catch(e => {
        log.error(e)
        throw new UserNotDeletedError(e)
    })

    reply.status(200).send({ message: "User deleted" })
}