CREATE TYPE note_status AS ENUM ( 'OPEN','IN_PROGRESS','IMPEDED','CLOSED');

ALTER TABLE note
    RENAME COLUMN notes TO summary;
ALTER TABLE note
    ADD COLUMN IF NOT EXISTS status note_status DEFAULT 'OPEN';
ALTER TABLE note
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE note
    ADD COLUMN IF NOT EXISTS due_date date;

CREATE INDEX ON note (status);
CREATE INDEX ON note USING gin (tags);
