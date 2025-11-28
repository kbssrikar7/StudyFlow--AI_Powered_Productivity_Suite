import sqlite3

def migrate_db():
    try:
        conn = sqlite3.connect('database/app_v2.db')
        cursor = conn.cursor()
        
        # Check if tasks table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
        if not cursor.fetchone():
            print("Creating tasks table...")
            cursor.execute("""
                CREATE TABLE tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR NOT NULL,
                    description TEXT,
                    status VARCHAR DEFAULT 'todo',
                    priority VARCHAR DEFAULT 'medium',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("CREATE INDEX ix_tasks_id ON tasks (id)")
            cursor.execute("CREATE INDEX ix_tasks_title ON tasks (title)")
            conn.commit()
            print("Tasks table created successfully.")
        else:
            print("Tasks table already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate_db()
