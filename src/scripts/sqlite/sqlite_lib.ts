import { Database } from "sqlite3";

export const execute = async (db: Database, sql: string) => {
    return new Promise<void>((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

export const runWithParams = async (
    db: Database,
    sql: string,
    params: any[]
) => {
    return new Promise<void>((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

export const getWithParams = async (
    db: Database,
    sql: string,
    params: any[]
) => {
    return new Promise<any>((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

export const allWithParams = async (
    db: Database,
    sql: string,
    params: any[]
) => {
    return new Promise<any[]>((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};
