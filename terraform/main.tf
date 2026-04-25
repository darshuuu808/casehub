terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "casehub" {
  name     = var.resource_group_name
  location = var.location
}

# App Service Plan
resource "azurerm_service_plan" "casehub" {
  name                = "casehub-plan"
  resource_group_name = azurerm_resource_group.casehub.name
  location            = azurerm_resource_group.casehub.location
  os_type             = "Linux"
  sku_name            = "B2"
}

# App Service
resource "azurerm_linux_web_app" "casehub" {
  name                = var.app_service_name
  resource_group_name = azurerm_resource_group.casehub.name
  location            = azurerm_resource_group.casehub.location
  service_plan_id     = azurerm_service_plan.casehub.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    "SQL_SERVER"   = "${var.sql_server_name}.database.windows.net"
    "SQL_USER"     = var.sql_admin_login
    "SQL_PASSWORD" = var.sql_admin_password
    "SQL_DATABASE" = var.sql_db_name
    "JWT_SECRET"   = "casehub_super_secret_jwt_key_2025"
  }
}

# SQL Server
resource "azurerm_mssql_server" "casehub" {
  name                         = var.sql_server_name
  resource_group_name          = azurerm_resource_group.casehub.name
  location                     = azurerm_resource_group.casehub.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password
}

# SQL Database
resource "azurerm_mssql_database" "casehub" {
  name        = var.sql_db_name
  server_id   = azurerm_mssql_server.casehub.id
  sku_name    = "S1"
  max_size_gb = 250
}

# Storage Account
resource "azurerm_storage_account" "casehub" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.casehub.name
  location                 = azurerm_resource_group.casehub.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Storage Container
resource "azurerm_storage_container" "documents" {
  name                  = "case-documents"
  storage_account_name  = azurerm_storage_account.casehub.name
  container_access_type = "private"
}

# Container Registry
resource "azurerm_container_registry" "casehub" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.casehub.name
  location            = azurerm_resource_group.casehub.location
  sku                 = "Basic"
  admin_enabled       = true
}