variable "resource_group_name" {
  default = "casehub-rg"
}

variable "location" {
  default = "Central India"
}

variable "sql_admin_login" {
  default = "casehubadmin"
}

variable "sql_admin_password" {
  default   = "Casehub@2025"
  sensitive = true
}

variable "app_service_name" {
  default = "casehub-api"
}

variable "sql_server_name" {
  default = "casehub-server-1604"
}

variable "sql_db_name" {
  default = "casehub"
}

variable "storage_account_name" {
  default = "casehubstorage1604"
}

variable "acr_name" {
  default = "casehubacr1604"
}