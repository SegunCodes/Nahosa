const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient
const bcryptjs = require("bcryptjs")

exports.findUserByEmail = async (email) => { 
    return prisma.user.findUnique({ where: {email}})
}

exports.createUser = async (email, name, password) => {
    try {
        const hashPassword = await bcryptjs.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword
            }
        })
        return user
    } catch (error) {
        console.error(error)
    }
}