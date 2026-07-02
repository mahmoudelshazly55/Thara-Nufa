import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './config/database';

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'admin@tharanufa.sa';
  const password = process.env.ADMIN_PASSWORD || 'TharaNufa@2026';
  const name = process.env.ADMIN_NAME || 'Thara Admin';

  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.create({ data: { email, passwordHash, name } });
  await prisma.$disconnect();
}

seed().catch(console.error);
