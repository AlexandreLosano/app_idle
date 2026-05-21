-- Renomeia tabela continents para game_modes
ALTER TABLE continents RENAME TO game_modes;

-- Renomeia a coluna continent_id em islands para game_mode_id
ALTER TABLE islands RENAME COLUMN continent_id TO game_mode_id;

-- Renomeia a constraint de FK se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'islands' AND constraint_name = 'islands_continent_id_fkey'
  ) THEN
    ALTER TABLE islands RENAME CONSTRAINT islands_continent_id_fkey TO islands_game_mode_id_fkey;
  END IF;
END$$;
