import 'dotenv/config';  
import prisma from './app/lib/prisma';

async function test() {
  const beats = await prisma.beat.findMany();
  console.log(beats);
}

test()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());

