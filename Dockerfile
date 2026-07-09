FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-java-common \
    default-jre \
    fonts-liberation \
    locales \
    --no-install-recommends && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    sed -i -e 's/# tr_TR.UTF-8 UTF-8/tr_TR.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen && \
    rm -rf /var/lib/apt/lists/*

ENV LANG tr_TR.UTF-8
ENV LANGUAGE tr_TR:tr
ENV LC_ALL tr_TR.UTF-8

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN mkdir -p uploads && chmod -R 777 uploads 
EXPOSE 3000
CMD ["node", "app.js"]