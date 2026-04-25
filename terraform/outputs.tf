output "app_service_url" {
  value = azurerm_linux_web_app.casehub.default_hostname
}

output "sql_server_fqdn" {
  value = azurerm_mssql_server.casehub.fully_qualified_domain_name
}

output "storage_account_name" {
  value = azurerm_storage_account.casehub.name
}

output "acr_login_server" {
  value = azurerm_container_registry.casehub.login_server
}