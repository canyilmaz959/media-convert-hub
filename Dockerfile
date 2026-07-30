FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    poppler-utils \
    pkg-config \
    libcairo2 \
    libcairo2-dev \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY requirements.txt ./

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

EXPOSE 3000
CMD ["node", "app.js"]