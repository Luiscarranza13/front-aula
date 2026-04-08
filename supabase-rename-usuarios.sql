-- Renombrar perfiles a usuarios
ALTER TABLE perfiles RENAME TO usuarios;

-- Actualizar trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO usuarios (id, email, nombre, rol)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', new.email),
    COALESCE(new.raw_user_meta_data->>'rol', 'estudiante')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
