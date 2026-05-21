-- Renomeia tabela islands para continents
ALTER TABLE islands RENAME TO continents;

-- Renomeia a coluna island_id em mines para continent_id
ALTER TABLE mines RENAME COLUMN island_id TO continent_id;

-- Renomeia a constraint de FK se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'mines' AND constraint_name = 'mines_island_id_fkey'
  ) THEN
    ALTER TABLE mines RENAME CONSTRAINT mines_island_id_fkey TO mines_continent_id_fkey;
  END IF;
END$$;
