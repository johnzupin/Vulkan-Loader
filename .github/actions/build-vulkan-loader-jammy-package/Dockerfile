FROM ubuntu:22.04
RUN  apt-get update && \
    DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get install -y \
    git build-essential pkg-config libx11-xcb-dev \
    libxkbcommon-dev libwayland-dev libxrandr-dev \
    libegl1-mesa-dev python3-distutils git-buildpackage cmake \
    python3 debhelper pbuilder npm
COPY . .
RUN npm install --production
ENTRYPOINT ["node", "/dist/index.js"]