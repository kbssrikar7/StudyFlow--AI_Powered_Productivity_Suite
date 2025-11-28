import sqlite3

def check_data():
    try:
        conn = sqlite3.connect('database/app_v2.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM sessions")
        session_count = cursor.fetchone()[0]
        print(f"Total Sessions: {session_count}")
        
        cursor.execute("SELECT COUNT(*) FROM snippets")
        snippet_count = cursor.fetchone()[0]
        print(f"Total Snippets: {snippet_count}")
        
        conn.close()
    except Exception as e:
        print(f"Check failed: {e}")

if __name__ == "__main__":
    check_data()
