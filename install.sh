#!/usr/bin/env bash
echo "** Installing Project dependency, It may take some time. **" &&
echo "** Installing Node JS**" &&
sudo cp -r node/{bin,include,lib,share} /usr/
export PATH=/usr/node-v16.18.0-linux-x64/bin:$PATH
echo "**  installing pm2 **" &&
sudo npm i ./pm2-master -g
echo "** Installing redis server **" &&
cd redis-stable && make && sudo install make && cd ..
echo "** Installing postgress SQL Server **" &&
cd postgresql && 
sudo ./configure &&
sudo make &&
sudo su &&
sudo make install && 
adduser postgres && 
mkdir -p /usr/local/pgsql/data && 
chown postgres /usr/local/pgsql/data && 
su - postgres && 
/usr/local/pgsql/bin/initdb -D /usr/local/pgsql/data && 
/usr/local/pgsql/bin/pg_ctl -D /usr/local/pgsql/data -l logfile start && 
/usr/local/pgsql/bin/createdb test && 
/usr/local/pgsql/bin/psql test &&
cd ..
