variable "aws_region" {
  type        = string
  description = "AWS region for the deployment."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Short project name used in resource names."
  default     = "epixbox"
}

variable "environment" {
  type        = string
  description = "Deployment environment."
  default     = "production"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR range for the application VPC."
  default     = "10.42.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones for the public and private subnets."
  default     = ["us-east-1a", "us-east-1b"]
}

variable "node_instance_types" {
  type        = list(string)
  description = "EKS managed node instance types."
  default     = ["t3.medium"]
}
