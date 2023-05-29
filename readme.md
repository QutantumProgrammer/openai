端口转发
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000

sudo iptables -t nat -L

v2ray

bash <(wget -qO- -o- https://git.io/v2ray.sh)