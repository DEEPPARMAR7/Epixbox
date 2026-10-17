output "vpc_id" {
  description = "Application VPC ID."
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name."
  value       = module.eks.cluster_name
}

output "api_repository_url" {
  description = "ECR repository URL for the API image."
  value       = aws_ecr_repository.api.repository_url
}

output "client_repository_url" {
  description = "ECR repository URL for the client image."
  value       = aws_ecr_repository.client.repository_url
}

output "uploads_bucket_name" {
  description = "Private S3 bucket for application uploads."
  value       = aws_s3_bucket.uploads.bucket
}
