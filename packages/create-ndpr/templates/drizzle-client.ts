/**
 * NDPR Drizzle integration seam.
 *
 * Call configureNDPRDatabase(yourDrizzleInstance) once during server startup.
 * This package intentionally does not choose a PostgreSQL driver or open a
 * connection for the host application.
 */
export interface NDPRDrizzleTransactionConfig {
  isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
  accessMode?: 'read only' | 'read write';
  deferrable?: boolean;
}

export interface NDPRDrizzleDatabase {
  select(...args: any[]): any;
  insert(...args: any[]): any;
  update(...args: any[]): any;
  delete(...args: any[]): any;
  transaction<T>(
    callback: (tx: NDPRDrizzleDatabase) => Promise<T>,
    config?: NDPRDrizzleTransactionConfig,
  ): Promise<T>;
}

let configuredDatabase: NDPRDrizzleDatabase | null = null;

export function configureNDPRDatabase(database: unknown): void {
  if (!database || typeof database !== 'object') {
    throw new TypeError('configureNDPRDatabase requires a Drizzle database instance');
  }
  configuredDatabase = database as NDPRDrizzleDatabase;
}

export const db = new Proxy({} as NDPRDrizzleDatabase, {
  get(_target, property) {
    if (!configuredDatabase) {
      throw new Error(
        'NDPR Drizzle database is not configured. Call configureNDPRDatabase(db) during server startup.',
      );
    }
    const value = Reflect.get(configuredDatabase, property);
    return typeof value === 'function' ? value.bind(configuredDatabase) : value;
  },
});
