FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev=false
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
CMD ["npm","start"]
