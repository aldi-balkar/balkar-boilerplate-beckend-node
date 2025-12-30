import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { seedPermissions } from './seeds/permissions.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed permissions first
  await seedPermissions();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      password: userPassword,
    },
    create: {
      email: 'user@example.com',
      username: 'user',
      password: userPassword,
      role: 'USER',
      isActive: true,
    },
  });

  console.log('✅ Regular user created:', user.email);

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        content: 'This is the content of the first post',
        published: true,
        authorId: admin.id,
      },
      {
        title: 'Second Post',
        content: 'This is the content of the second post',
        published: false,
        authorId: user.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sample posts created');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
