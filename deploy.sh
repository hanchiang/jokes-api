echo "Pulling from master..."

git pull origin master

echo "Successfully from master!"

echo "Restarting server..."

pm2 reload index

echo "Server restarted Successfully!"
