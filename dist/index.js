"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config = {
    connectionString: process.env.POSTGRES_CONN_STR,
    databaseName: process.env.POSTGRES_DB_NAME,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};
// 建立 PostgreSQL 連線池
const pool = new pg_1.Pool(config);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 建立 PostgreSQL 客戶端
        const client = yield pool.connect();
        // 建立資料表
        yield client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    );
  `);
        // 建立觸發器
        yield client.query(`
    CREATE TRIGGER users_insert_trigger
      BEFORE INSERT ON users
      FOR EACH ROW
    BEGIN
      INSERT INTO logs (message) VALUES ('User inserted: ' || new.name);
    END;
  `);
        yield client.query(`
    CREATE TRIGGER users_update_trigger
      BEFORE UPDATE ON users
      FOR EACH ROW
    BEGIN
      INSERT INTO logs (message) VALUES ('User updated: ' || new.name);
    END;
  `);
        yield client.query(`
    CREATE TRIGGER users_delete_trigger
      BEFORE DELETE ON users
      FOR EACH ROW
    BEGIN
      INSERT INTO logs (message) VALUES ('User deleted: ' || old.name);
    END;
  `);
        // 插入一個使用者
        yield client.query(`
    INSERT INTO users (name, email) VALUES ('John Doe', 'johndoe@example.com');
  `);
        // 更新使用者的姓名
        yield client.query(`
    UPDATE users SET name = 'Jane Doe' WHERE id = 1;
  `);
        // 刪除使用者
        yield client.query(`
    DELETE FROM users WHERE id = 1;
  `);
        // 檢查日誌
        const results = yield pool.query(`
    SELECT * FROM logs;
  `);
        console.log(results);
        // 關閉 PostgreSQL 連線池
        yield pool.end();
    });
}
main();
