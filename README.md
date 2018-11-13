# EOS-history-elasticsearch
Use fibos emitter plugin as action data source


## Install FIBOS
```shell
curl -s https://fibos.io/download/installer_beta.sh | sh
```

## Run elasticsearch

```shell
sudo docker-compose up -d
```

## Start Node

```shell
nohup fibos node.js > run.log &
```

## Install Kibana
```shell
wget https://artifacts.elastic.co/downloads/kibana/kibana-6.4.3-linux-x86_64.tar.gz
tar zxvf kibana-6.4.3-linux-x86_64.tar.gz
cd kibana-6.4.3-linux-x86_64
bin/kibana
```