import prisma from '../shared/prisma.js';

async function cleanupDuplicateTasks() {
  try {
    console.log('Starting cleanup of duplicate tasks...');

    // Delete duplicate tasks by ID
    // Based on the database screenshot, these appear to be duplicates:
    const duplicateIds = [17, 18, 20]; // Keep 15 and 19, delete others

    for (const id of duplicateIds) {
      const deleted = await prisma.task.delete({
        where: { id }
      });
      console.log(`Deleted task ID ${id}:`, deleted.name);
    }

    console.log('Cleanup complete!');
    
    // Show remaining tasks
    const remainingTasks = await prisma.task.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('\nRemaining tasks:');
    remainingTasks.forEach(task => {
      console.log(`ID ${task.id}: ${task.name} - ${task.start_time}`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateTasks();
