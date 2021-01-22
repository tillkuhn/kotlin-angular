-- support bike trips
UPDATE app_user SET id = '00000000-0000-0000-0000-000000000001' where id = '007';
UPDATE dish SET created_by = '00000000-0000-0000-0000-000000000001' ;
UPDATE dish SET updated_by = '00000000-0000-0000-0000-000000000001' ;
UPDATE note SET created_by = '00000000-0000-0000-0000-000000000001' ;
--UPDATE note SET updated_by = '00000000-0000-0000-0000-000000000001' ;
UPDATE place SET created_by = '00000000-0000-0000-0000-000000000001' ;
UPDATE place SET updated_by = '00000000-0000-0000-0000-000000000001' ;

ALTER TABLE app_user ALTER id type uuid USING id::uuid;
ALTER TABLE app_user ALTER COLUMN ID SET DEFAULT uuid_generate_v4();

ALTER TABLE dish ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE dish ALTER created_by type uuid USING created_by::uuid;
ALTER TABLE dish ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE dish ADD FOREIGN KEY (created_by) REFERENCES app_user(id);

ALTER TABLE dish ALTER COLUMN updated_by DROP DEFAULT;
ALTER TABLE dish ALTER updated_by type uuid USING updated_by::uuid;
ALTER TABLE dish ALTER COLUMN updated_by SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE dish ADD FOREIGN KEY (updated_by) REFERENCES app_user(id);

ALTER TABLE place ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE place ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE place ALTER created_by type uuid USING created_by::uuid;
ALTER TABLE place ADD FOREIGN KEY (created_by) REFERENCES app_user(id);

ALTER TABLE place ALTER COLUMN updated_by DROP DEFAULT;
ALTER TABLE place ALTER updated_by type uuid USING updated_by::uuid;
ALTER TABLE place ALTER COLUMN updated_by SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE place ADD FOREIGN KEY (updated_by) REFERENCES app_user(id);

ALTER TABLE note ALTER COLUMN created_by DROP DEFAULT;
ALTER TABLE note ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE note ALTER created_by type uuid USING created_by::uuid;
ALTER TABLE note ADD FOREIGN KEY (created_by) REFERENCES app_user(id);
-- Note has no updated by yet
ALTER TABLE note ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE note ADD COLUMN IF NOT EXISTS updated_by uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;
ALTER TABLE note ADD FOREIGN KEY (updated_by) REFERENCES app_user(id);

