import prisma from '../shared/prisma.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashExistingPasswords() {
  try {
    console.log('Starting password hashing migration...');
    
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users to update`);
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (user.password.startsWith('$2b$')) {
        console.log(`User ${user.email} already has hashed password, skipping...`);
        continue;
      }
      
      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      
      // Update user with hashed password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      console.log(`✓ Updated password for user: ${user.email}`);
    }
    
    console.log('Password hashing migration completed successfully!');
  } catch (error) {
    console.error('Error during password hashing migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

hashExistingPasswords();
