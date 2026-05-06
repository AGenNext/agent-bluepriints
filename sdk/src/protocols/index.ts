// OM Protocols - All API Protocols & Node Types
// Complete protocol definitions for OpenMetadata Manager

// ===== REST API Protocols =====

export const Protocols = {
  auth: {
    signIn: 'POST /api/auth/signin/{provider}',
    signOut: 'POST /api/auth/signout',
    session: 'GET /api/auth/session',
    refresh: 'POST /api/auth/refresh',
    tokensList: 'GET /api/auth/tokens',
  },
  identity: {
    get: 'GET /api/identity',
    update: 'PATCH /api/identity',
  },
  tables: {
    list: 'GET /api/tables',
    get: 'GET /api/tables/{id}',
    create: 'POST /api/tables',
    update: 'PATCH /api/tables/{id}',
    delete: 'DELETE /api/tables/{id}',
  },
  services: {
    list: 'GET /api/services',
    get: 'GET /api/services/{id}',
    create: 'POST /api/services',
    delete: 'DELETE /api/services/{id}',
  },
  glossaries: {
    list: 'GET /api/glossaries',
    create: 'POST /api/glossaries',
    terms: 'GET /api/glossaries/{id}/terms',
  },
  search: {
    query: 'GET /api/search?q={query}',
    index: 'POST /api/search/index',
  },
  lineage: {
    get: 'GET /api/lineage?entityType={type}&entityId={id}',
    query: 'GET /api/lineage/query?table={name}&direction={dir}',
    discover: 'POST /api/lineage/discover',
  },
  governance: {
    classifications: 'GET /api/governance/classifications',
    tags: 'GET /api/governance/tags',
    policies: 'GET /api/governance/policies',
    retention: 'GET /api/governance/retention',
  },
  ingestion: {
    pipelines: 'GET /api/ingestion/pipelines',
    create: 'POST /api/ingestion/pipelines',
    trigger: 'POST /api/ingestion/pipelines/{id}/trigger',
  },
  storage: {
    buckets: 'GET /api/storage/buckets',
    policies: 'GET /api/storage/policies',
  },
  query: {
    execute: 'POST /api/query',
    explain: 'POST /api/query/explain',
  },
  permissions: {
    check: 'POST /api/permissions/check',
    bulkCheck: 'POST /api/permissions/bulk-check',
    grant: 'POST /api/permissions',
    revoke: 'DELETE /api/permissions',
  },
  fga: {
    check: 'POST /api/fga/check',
    expand: 'POST /api/fga/expand',
    write: 'POST /api/fga/write',
    read: 'GET /api/fga/read',
  },
  opa: {
    evaluate: 'POST /api/opa/data',
    policies: 'GET /api/opa/policies',
    status: 'GET /api/opa/status',
  },
  jobs: {
    list: 'GET /api/jobs',
    create: 'POST /api/jobs',
    cancel: 'POST /api/jobs/{id}/cancel',
    retry: 'POST /api/jobs/{id}/retry',
  },
  health: 'GET /api/health',
  metrics: 'GET /api/metrics',
  alerts: 'GET /api/alerts',
  tasks: 'GET /api/tasks',
} as const;

// ===== Node Types =====

export const NodeTypes = {
  table: 'table',
  view: 'view',
  materializedView: 'materialized',
  column: 'column',
  pipeline: 'pipeline',
  source: 'source',
  transform: 'transform',
  sink: 'sink',
  condition: 'condition',
  bucket: 'bucket',
  object: 'object',
  folder: 'folder',
  database: 'database',
  schema: 'schema',
  service: 'service',
  classification: 'classification',
  tag: 'tag',
  policy: 'policy',
  glossary: 'glossary',
  term: 'term',
  user: 'user',
  team: 'team',
  role: 'role',
  permission: 'permission',
  dashboard: 'dashboard',
  chart: 'chart',
  report: 'report',
  model: 'model',
  feature: 'feature',
  featureStore: 'featureStore',
} as const;

// ===== Connection Types =====

export const ConnectionTypes = {
  Snowflake: 'snowflake',
  BigQuery: 'bigquery',
  Redshift: 'redshift',
  Databricks: 'databricks',
  Trino: 'trino',
  PostgreSQL: 'postgresql',
  MySQL: 'mysql',
  Oracle: 'oracle',
  SQLServer: 'sqlserver',
  S3: 's3',
  GCS: 'gcs',
  ADLS: 'adls',
  Tableau: 'tableau',
  Metabase: 'metabase',
  Superset: 'superset',
  Looker: 'looker',
  SageMaker: 'sagemaker',
  Vertex: 'vertex',
  MLflow: 'mlflow',
  Airflow: 'airflow',
  Dagster: 'dagster',
  Prefect: 'prefect',
} as const;

// ===== Event Types =====

export const EventTypes = {
  entityCreated: 'entity.created',
  entityUpdated: 'entity.updated',
  entityDeleted: 'entity.deleted',
  entityOwned: 'entity.owned',
  classificationAdded: 'classification.added',
  tagAdded: 'tag.added',
  pipelineStarted: 'pipeline.started',
  pipelineCompleted: 'pipeline.completed',
  pipelineFailed: 'pipeline.failed',
  queryStarted: 'query.started',
  queryCompleted: 'query.completed',
  queryFailed: 'query.failed',
} as const;

// ===== Metrics =====

export const Metrics = {
  dataQuality: 'data_quality_score',
  freshness: 'data_freshness',
  coverage: 'data_coverage',
  queryCount: 'query_count',
  userCount: 'query_users',
  scanSize: 'data_scanned_bytes',
  queryLatency: 'query_latency_ms',
  pipelineDuration: 'pipeline_duration_ms',
  apiLatency: 'api_latency_ms',
  storageSize: 'storage_size_bytes',
  objectCount: 'object_count',
} as const;

export default { Protocols, NodeTypes, ConnectionTypes, EventTypes, Metrics };