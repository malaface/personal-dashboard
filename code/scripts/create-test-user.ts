import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('password123', 12)

  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@dashboard.com',
        password: hashedPassword,
        name: 'Test User',
        emailVerified: new Date(),
      }
    })

    console.log('✅ User created successfully:', user.email)
    console.log('📧 Email:', user.email)
    console.log('🔑 Password: password123')
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('ℹ️  User already exists:', 'test@dashboard.com')
    } else {
      throw error
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
