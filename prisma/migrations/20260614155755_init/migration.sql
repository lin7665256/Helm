-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "api_key_hash" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'push',
    "created_at" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "agent_status" (
    "agent_id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "current_task" TEXT,
    "task_count" INTEGER NOT NULL DEFAULT 0,
    "next_trigger" INTEGER,
    "last_heartbeat" INTEGER,
    "last_activity" TEXT,
    "updated_at" INTEGER NOT NULL,
    CONSTRAINT "agent_status_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" INTEGER NOT NULL,
    "completed_at" INTEGER,

    PRIMARY KEY ("agent_id", "id"),
    CONSTRAINT "tasks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agent_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "artifact_path" TEXT,
    "created_at" INTEGER NOT NULL,
    CONSTRAINT "activities_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "artifacts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agent_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" INTEGER NOT NULL,
    CONSTRAINT "artifacts_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "activities_agent_id_created_at_idx" ON "activities"("agent_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activities_event_type_created_at_idx" ON "activities"("event_type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "artifacts_agent_id_created_at_idx" ON "artifacts"("agent_id", "created_at" DESC);
