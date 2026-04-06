import pymysql
from pymysql.err import OperationalError


class DBConnection:
    """Lightweight DB helper that opens a new connection per operation.

    This avoids keeping a single connection open across requests and is
    safer for containerized/pooled environments. Use parameterized queries
    by passing `tuple_params` to methods.
    """

    def __init__(self, config):
        self.config = config

    def _connect(self):
        if not pymysql:
            raise ImportError("pymysql library is not installed or not found")

        return pymysql.connect(
            host=self.config.get("DB_HOST", "localhost"),
            user=self.config.get("DB_USER", "root"),
            password=self.config.get("DB_PASSWORD", ""),
            db=self.config.get("DB_NAME", "eduba"),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
        )

    def get_db_cursor(self, query, tuple_params=None):
        conn = None
        try:
            conn = self._connect()
            cursor = conn.cursor()
            if tuple_params:
                cursor.execute(query, tuple_params)
            else:
                cursor.execute(query)
            data = cursor.fetchall()
            cursor.close()
            conn.close()
            return data
        except OperationalError:
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass
            raise

    def push_db_cursor(self, query, tuple_params=None):
        conn = None
        try:
            conn = self._connect()
            cursor = conn.cursor()
            if tuple_params:
                cursor.execute(query, tuple_params)
            else:
                cursor.execute(query)
            conn.commit()
            cursor.close()
            conn.close()
        except OperationalError:
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass
            raise

