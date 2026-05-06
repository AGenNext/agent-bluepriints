// OM Providers - Pre-built provider configurations for data platforms

// Database Providers
export const DatabaseProviders = {
  snowflake: {
    name: 'Snowflake',
    category: 'warehouse',
    icon: '❄️',
    fields: ['account', 'username', 'password', 'database', 'schema', 'warehouse'],
  },
  bigquery: {
    name: 'BigQuery',
    category: 'warehouse',
    icon: '📊',
    fields: ['project_id', 'dataset', 'credentials_json'],
  },
  postgresql: {
    name: 'PostgreSQL',
    category: 'database',
    icon: '🐘',
    fields: ['host', 'port', 'database', 'username', 'password', 'schema'],
  },
  mysql: {
    name: 'MySQL',
    category: 'database',
    icon: '🐬',
    fields: ['host', 'port', 'database', 'username', 'password'],
  },
  redshift: {
    name: 'Redshift',
    category: 'warehouse',
    icon: '📈',
    fields: ['host', 'port', 'database', 'username', 'password', 'cluster_id'],
  },
  databricks: {
    name: 'Databricks',
    category: 'lakehouse',
    icon: '🏠',
    fields: ['host', 'token', 'http_path', 'catalog'],
  },
} as const;

// Storage Providers
export const StorageProviders = {
  s3: {
    name: 'Amazon S3',
    category: 'lake',
    icon: '📦',
    fields: ['bucket', 'region', 'access_key', 'secret_key'],
  },
  gcs: {
    name: 'Google Cloud Storage',
    category: 'lake',
    icon: '🪣',
    fields: ['bucket', 'project_id', 'credentials_json'],
  },
  adls: {
    name: 'Azure Data Lake',
    category: 'lake',
    icon: '🏛️',
    fields: ['account_name', 'container', 'sas_token'],
  },
  azure_blob: {
    name: 'Azure Blob',
    category: 'lake',
    icon: '📁',
    fields: ['account_name', 'container', 'sas_token'],
  },
} as const;

// BI & Visualization
export const BIProviders = {
  tableau: { name: 'Tableau', icon: '📊' },
  metabase: { name: 'Metabase', icon: '📉' },
  superset: { name: 'Apache Superset', icon: '⚡' },
  looker: { name: 'Looker', icon: '👁️' },
  powerbi: { name: 'Power BI', icon: '📈' },
} as const;

// ML & AI
export const MLProviders = {
  sagemaker: { name: 'SageMaker', icon: '🤖' },
  vertex: { name: 'Vertex AI', icon: '🧠' },
  mlflow: { name: 'MLflow', icon: '📊' },
  weights_biases: { name: 'Weights & Biases', icon: '⚖️' },
  featurestore: { name: 'Feature Store', icon: '🗂️' },
} as const;

// Pipelines
export const PipelineProviders = {
  airflow: { name: 'Apache Airflow', icon: '💨' },
  dagster: { name: 'Dagster', icon: '🔮' },
  prefect: { name: 'Prefect', icon: '🏃' },
  meltano: { name: 'Meltano', icon: '🔧' },
} as const;

// SSO Providers
export const SSOProviders = {
  google: { name: 'Google', color: '#4285f4', icon: '🔵' },
  github: { name: 'GitHub', color: '#333', icon: '🐙' },
  azure: { name: 'Azure AD', color: '#0078d4', icon: '☁️' },
  okta: { name: 'Okta', color: '#007dc1', icon: '🛡️' },
  saml: { name: 'SAML / Enterprise', color: '#6366f1', icon: '🔐' },
} as const;

// All Providers
export const AllProviders = {
  ...DatabaseProviders,
  ...StorageProviders,
  ...BIProviders,
  ...MLProviders,
  ...PipelineProviders,
  ...SSOProviders,
} as const;

// Provider Categories
export type ProviderCategory = 
  | 'database' 
  | 'warehouse' 
  | 'lake' 
  | 'lakehouse' 
  | 'bi' 
  | 'ml' 
  | 'pipeline'
  | 'sso';

export function getProvidersByCategory(category: ProviderCategory) {
  return Object.entries(AllProviders).filter(
    ([, p]) => p.category === category
  );
}

export function getProvider(name: string) {
  return AllProviders[name as keyof typeof AllProviders];
}