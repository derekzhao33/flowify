-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "canvas_event_id" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canvas_ics_url" TEXT,
ADD COLUMN     "canvas_last_sync" TIMESTAMP(3);
