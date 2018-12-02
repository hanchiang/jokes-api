echo "Pulling from master..."
git pull origin master
echo "Successfully from master!"

echo "Updating packages..."
npm install
echo "Packaged updated!"

echo "Restarting server..."
pm2 restart index
echo "Server restarted Successfully!"
