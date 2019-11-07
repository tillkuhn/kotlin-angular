
provider "aws" {
  region = "eu-central-1"
  version = "~> 2.34"
}

## see terraform-backend.tf.tmpl for s3 backend terraform state

data "aws_vpc" "vpc" {
  filter {
    name = "tag:Name"
    values = [
      var.aws_vpc_name]
  }
}

data "aws_subnet" "app_onea" {
  filter {
    name = "tag:Name"
    values = [
      var.aws_subnet_name]
  }
  vpc_id = data.aws_vpc.vpc.id
}

data "aws_security_group" "ssh" {
  filter {
    name = "tag:Name"
    values = [
      var.aws_ssh_security_group_name]
  }
}
## SSH key for instance (BYOK)
resource "aws_key_pair" "ssh_key" {
  key_name    = var.appid
  public_key  = file(var.ssh_pubkey_file)
}

## bucket for artifacts
resource "aws_s3_bucket" "data" {
  bucket = "${var.aws_s3_prefix}-${var.appid}-data"
  region = var.aws_region
  tags = map("Name", "${var.appid}-data", "managedBy", "terraform")
}

resource "aws_security_group" "instance_sg" {
  name        = "${var.appid}-instance-sg"
  description = "Security group for ${var.appid} insta  nces"
  vpc_id      = "${data.aws_vpc.vpc.id}"
//  ingress {
//    # ingress rule for SSH communication
//    from_port = 22
//    to_port = 22
//    protocol = "tcp"
//    security_groups = ["${data.aws_security_group.bastion.id}"]
//  }
//  ingress {
//    # ingress rule for HTTP communication
//    from_port = 80
//    to_port = 80
//    protocol = "tcp"
//    security_groups = ["${data.aws_security_group.alb_sg.id}"]
//  }
  ingress {
    # allow echo / ping requests
    from_port = 8
    to_port = -1
    protocol = "icmp"
    cidr_blocks = ["10.0.0.0/8"]
  }
  ingress {
    # ingress rule for HTTP communication
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    # ingress rule for HTTPS communication
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    # allow all egress rule
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = map("Name", "${var.appid}-instance-sg", "managedBy", "terraform")
}

//## Actual EC2 instance
resource "aws_instance" "instance" {
  ami                     = var.aws_instance_ami
  instance_type           = var.aws_instance_type
  vpc_security_group_ids  = [
    aws_security_group.instance_sg.id, data.aws_security_group.ssh.id]
  subnet_id               = data.aws_subnet.app_onea.id
  key_name                = aws_key_pair.ssh_key.key_name
  ## todo user data https://www.bogotobogo.com/DevOps/Terraform/Terraform-terraform-userdata.php
  ## User data is limited to 16 KB, in raw form, before it is base64-encoded. The size of a string of length n after base64-encoding is ceil(n/3)*4.
  user_data = file("user_data.sh")
  tags = map("Name", "${var.appid}-instance", "managedBy", "terraform")
  lifecycle {
    ignore_changes = [ "ami" ]
  }
}


## output private ip
output "instance_ip" {
  value = "private ${aws_instance.instance.private_ip} public ${aws_instance.instance.public_ip}"
}

//## Route 53 ALB Alias for access to alb resource
//resource "aws_route53_record" "app_dns_alias" {
//  zone_id = "${lookup(var.domain_zone_id,var.stage)}"
//  name    = "${var.domain_host}.${lookup(var.domain_zone_name,var.stage)}" ## fully qualified
//  type    = "A"
//  alias {
//    name                   = "${data.aws_alb.lb.dns_name}"
//    zone_id                = "${data.aws_alb.lb.zone_id}"
//    evaluate_target_health = false
//  }
//}
//
//## Route 53 ALB Alias for ssh access to compute instance
//resource "aws_route53_record" "app_instance_alias" {
//  zone_id = "${lookup(var.domain_zone_id,var.stage)}"
//  name    = "${var.domain_host}-app.${lookup(var.domain_zone_name,var.stage)}" ## fully qualified
//  type    = "A"
//  records = ["${aws_instance.instance.private_ip}"]
//  ttl = "300"
//}
//
//output "app_dns_alias" {
//  value = "${aws_route53_record.app_dns_alias.name}"
//}
//
