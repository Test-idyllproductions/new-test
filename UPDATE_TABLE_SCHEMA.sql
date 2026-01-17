-- Update task_tables and payout_tables to support enhanced table creation
-- Add new columns for table metadata

-- Update task_tables
ALTER TABLE task_tables 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS assigned_users TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'));

-- Update payout_tables
ALTER TABLE payout_tables 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS assigned_users TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_tables_priority ON task_tables(priority);
CREATE INDEX IF NOT EXISTS idx_task_tables_status ON task_tables(status);
CREATE INDEX IF NOT EXISTS idx_task_tables_deadline ON task_tables(deadline);

CREATE INDEX IF NOT EXISTS idx_payout_tables_priority ON payout_tables(priority);
CREATE INDEX IF NOT EXISTS idx_payout_tables_status ON payout_tables(status);
CREATE INDEX IF NOT EXISTS idx_payout_tables_deadline ON payout_tables(deadline);

-- Update existing tables to have default values
UPDATE task_tables SET 
  priority = 'medium' WHERE priority IS NULL,
  status = 'active' WHERE status IS NULL;

UPDATE payout_tables SET 
  priority = 'medium' WHERE priority IS NULL,
  status = 'active' WHERE status IS NULL;