FROM node:latest
MAINTAINER @smtx

# # Updating ubuntu packages
# RUN apt-get update

# # Installing the packages needed to run Nightmare
# RUN apt-get install -y \
#   xvfb \
#   x11-xkb-utils \
#   xfonts-100dpi \
#   xfonts-75dpi \
#   xfonts-scalable \
#   xfonts-cyrillic \
#   x11-apps \
#   clang \
#   libdbus-1-dev \
#   libgtk2.0-dev \
#   libnotify-dev \
#   libgnome-keyring-dev \
#   libgconf2-dev \
#   libasound2-dev \
#   libcap-dev \
#   libcups2-dev \
#   libxtst-dev \
#   libxss1 \
#   libnss3-dev \
#   gcc-multilib \
#   g++-multilib

# ENV DEBUG="nightmare"

WORKDIR /home/api
ADD . /home/api

RUN npm install

EXPOSE 8888

# CMD xvfb-run --server-args="-screen 0 1024x768x24" node app.js
CMD node app.js
