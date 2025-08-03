FROM node:18.17.1

WORKDIR /app

# Install Yarn globally
RUN corepack enable && corepack prepare yarn@stable --activate


COPY . .

RUN yarn install

EXPOSE 3000

# Start the app using yarn dev
CMD ["yarn", "dev"]


# docker build -t sparc-app-2 .
# docker run --env-file .env -it -p 3000:3000 sparc-app-2

# troubleshooting:
#System limit for number of file watchers reached
# solution
#echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
