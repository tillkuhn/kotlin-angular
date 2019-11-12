 #! /bin/bash
sudo yum update -y
sudo amazon-linux-extras install java-openjdk11 -y
sudo amazon-linux-extras install nginx1 -y
#sudo systemctl enable nginx
sudo systemctl stop nginx
sudo wget -r --no-parent -A 'epel-release-*.rpm' http://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/
sudo rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm
sudo yum-config-manager --enable epel*
sudo yum install -y certbot python2-certbot-nginx unzip
sudo certbot --nginx -m ${certbot_mail} --agree-tos -n -d ${domain_name}
mkdir -p ${appdir}
sudo aws s3 sync  s3://${bucket_name}/deploy ${appdir}
sudo unzip -o ${appdir}/webapp.zip -d /usr/share/nginx/html
sudo cp  s3://${bucket_name}/deploy/app.service /etc/systemd/system
