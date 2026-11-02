-- Pages made from the admin page for testing, so they can be cleared in one go.
ALTER TABLE collections ADD COLUMN is_test INTEGER NOT NULL DEFAULT 0;
